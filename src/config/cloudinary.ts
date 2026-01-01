import { v2 as cloudinary } from 'cloudinary';
// CLOUDINARY_URL=cloudinary://221417781982271:_VpDY3foA_xm-ZNH7WFUsoiaWG0@dbdevmnas

// const cloudinaryUrl = process.env.CLOUDINARY_URL;
export const configureCloudinary = (): void => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbdevmnas',
      api_key: process.env.CLOUDINARY_API_KEY || '221417781982271',
      api_secret: process.env.CLOUDINARY_API_SECRET || '_VpDY3foA_xm-ZNH7WFUsoiaWG0',
    });
    console.log('✅ Cloudinary configured successfully');
  } else {
    console.warn('⚠️  Cloudinary credentials not found. File uploads will be disabled.');
  }
};

export { cloudinary };

