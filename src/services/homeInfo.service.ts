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

  // Ensure banner.heroImages array exists when processing hero image uploads
  if (data.banner && !Array.isArray(data.banner.heroImages)) {
    data.banner.heroImages = [];
  }

  // Handle file uploads
  if (files && files.length > 0) {
    for (const file of files) {
      const fieldName = file.fieldname;
      const uploadResult = await uploadToCloudinary(file, CLOUDINARY_FOLDERS.HOME_INFO);

      // Hero images array: banner[heroImages][index][file]
      const heroImageFileMatch = fieldName.match(/^banner\[heroImages\]\[(\d+)\]\[file\]$/);
      if (heroImageFileMatch) {
        const index = parseInt(heroImageFileMatch[1], 10);
        if (!data.banner) data.banner = {};
        if (!Array.isArray(data.banner.heroImages)) data.banner.heroImages = [];
        while (data.banner.heroImages.length <= index) {
          data.banner.heroImages.push({ url: '', alt: '', publicId: '' });
        }
        const existingAtIdx = homeInfo?.banner?.heroImages?.[index]?.publicId || data.banner.heroImages[index]?.publicId;
        if (existingAtIdx) {
          await deleteFromCloudinary(existingAtIdx);
        }
        const existingAlt = data.banner.heroImages[index]?.alt ?? '';
        data.banner.heroImages[index] = {
          url: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          alt: existingAlt,
        };
        continue;
      }

      // Legacy single hero image
      if (fieldName === 'banner[heroImageFile]') {
        if (!data.banner) data.banner = {};
        if (homeInfo?.banner?.heroImagePublicId) {
          await deleteFromCloudinary(homeInfo.banner.heroImagePublicId);
        }
        data.banner.heroImage = uploadResult.secureUrl;
        data.banner.heroImagePublicId = uploadResult.publicId;
      } else if (fieldName.match(/^benefits\[items\]\[(\d+)\]\[imageFile\]$/)) {
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
        const existingBanner = homeInfo.banner ? homeInfo.toObject().banner : {};
        const newHeroImages = Array.isArray(data.banner.heroImages) ? data.banner.heroImages : existingBanner.heroImages;
        const existingHeroPublicIds = (existingBanner.heroImages || []).map((img: any) => img.publicId).filter(Boolean);
        const newHeroPublicIds = (newHeroImages || []).map((img: any) => img.publicId).filter(Boolean);
        for (const publicId of existingHeroPublicIds) {
          if (!newHeroPublicIds.includes(publicId)) {
            await deleteFromCloudinary(publicId);
          }
        }
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
