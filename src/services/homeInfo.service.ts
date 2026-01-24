import { HomeInfo } from '../models/HomeInfo.model';
import { uploadToCloudinary, deleteFromCloudinary } from './fileUpload.service';
import { CLOUDINARY_FOLDERS } from '../config/constants';

// Removed unused getHomeInfo since getHomeInfoPublic is used in controller
// If getHomeInfo is needed elsewhere, keep it and export it

export const getHomeInfoPublic = async () => {
    return await HomeInfo.findOne();
}

export const updateHomeInfo = async (data: any, files: Express.Multer.File[]) => {
  let homeInfo = await HomeInfo.findOne();

  // Handle file uploads
  if (files && files.length > 0) {
    for (const file of files) {
      const fieldName = file.fieldname;
      const uploadResult = await uploadToCloudinary(file, CLOUDINARY_FOLDERS.HOME_INFO);

      // Map field name to data structure and delete old image if exists
      if (fieldName === 'banner[heroImageFile]') {
        if (!data.banner) data.banner = {};
        
        // Delete old image if exists
        if (homeInfo?.banner?.heroImagePublicId) {
          await deleteFromCloudinary(homeInfo.banner.heroImagePublicId);
        }

        data.banner.heroImage = uploadResult.secureUrl;
        data.banner.heroImagePublicId = uploadResult.publicId;
      } 
      else if (fieldName.match(/^benefits\[items\]\[(\d+)\]\[imageFile\]$/)) {
        const match = fieldName.match(/^benefits\[items\]\[(\d+)\]\[imageFile\]$/);
        if (match) {
            const index = parseInt(match[1]);
            if (!data.benefits) data.benefits = {};
            if (!data.benefits.items) data.benefits.items = [];
            
            // Ensure array has objects up to index
            // Note: Since data is partial, we need to be careful. 
            // The unflattening in controller should have created the structure.
            // But if we are adding just the image, we need to make sure the object exists.
             if (!data.benefits.items[index]) {
                 data.benefits.items[index] = {};
             }

            // Delete old image if exists
            if (homeInfo?.benefits?.items?.[index]?.imagePublicId) {
                await deleteFromCloudinary(homeInfo.benefits.items[index].imagePublicId);
            }

            data.benefits.items[index].image = uploadResult.secureUrl;
            data.benefits.items[index].imagePublicId = uploadResult.publicId;
        }
      }
    }
  }

  if (!homeInfo) {
    // Create new
    homeInfo = await HomeInfo.create(data);
  } else {
    // Update existing - partial updates
    // We merge the new data into the existing document
    
    if (data.banner) {
        // For sub-documents, we want to merge properties, but replacing arrays like checklistItems usually makes sense 
        // unless we want to merge them index by index which is complex.
        // Prompt says: "If a section is not provided in the request, keep the existing values for that section."
        // It doesn't explicitly say about partial updates WITHIN a section, but usually PUT updates the resource. 
        // Since we allow partial updates to the DOCUMENT (e.g. only update banner), 
        // we should probably replace the sub-document if provided, or merge carefully.
        // Mongoose updates: assigning an object to a nested path replaces it?
        // Actually, if we do homeInfo.banner = data.banner, it might lose fields not in data.banner.
        // However, the validation requires all fields for a section if provided?
        // "Banner Section: heading: Required..."
        // The validation in `homeInfo.validation.ts` defines schemas for sections.
        // If I validate the incoming data with that schema, it ensures all required fields are present for that section.
        // So I can safely replace the section.
        
        // However, I need to preserve images if not provided in the update but exist in DB.
        // "If an existing image URL is provided (not a file), keep it as-is"
        // If the user sends the text fields but NOT the image URL/File, should we keep the old image?
        // Usually, yes. 
        
        const existingBanner = homeInfo.banner ? homeInfo.toObject().banner : {};
        homeInfo.banner = { ...existingBanner, ...data.banner };
    }

    if (data.benefits) {
         const existingBenefits = homeInfo.benefits ? homeInfo.toObject().benefits : {};
         // For arrays (items), we probably want to replace the list if provided, because it's "exactly 3 items".
         // But we need to preserve images if they are not in the payload but match existing items?
         // The prompt says "If an existing image URL is provided (not a file), keep it as-is".
         // This implies the frontend sends the URL back. 
         // If I strictly follow: if data has benefits, I use data.benefits.
         // But I need to handle the image merge logic from above (where I injected the new image URL).
         
         // If I updated data.benefits with new image URLs in the loop above, `data.benefits` is now correct with new images.
         // If the user didn't upload a file, they should have sent the old URL. 
         // So replacing the object should be fine IF the frontend sends everything.
         // The prompt: "Request Body (JSON): ... full object structure".
         // The prompt: "Request Body (FormData): ... partial updates". 
         // "Partial Updates: The PUT endpoint should support partial updates. If a section is not provided in the request, keep the existing values for that section."
         
         // So if `data.benefits` is provided, I replace `homeInfo.benefits`.
         // BUT wait. `homeInfo.benefits` has `items`. `data.benefits.items` will be an array.
         // If I just do `homeInfo.benefits = data.benefits`, it works.
         // What about fields I added in the file loop? They are in `data`.
         
         homeInfo.benefits = { ...existingBenefits, ...data.benefits };
         // Note: merging benefits object might be tricky with arrays.
         // If `data.benefits` has `items`, it will overwrite `existingBenefits.items`.
         // This is what we want, assuming `data.benefits.items` is complete (which validation enforces).
    }

    if (data.services) {
        const existingServices = homeInfo.services ? homeInfo.toObject().services : {};
        homeInfo.services = { ...existingServices, ...data.services };
    }
    
    await homeInfo.save();
  }

  return homeInfo;
};
