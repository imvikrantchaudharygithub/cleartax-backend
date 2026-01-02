import { cloudinary } from '../config/cloudinary';
import { CLOUDINARY_FOLDERS } from '../config/constants';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve({
          url: result.url,
          publicId: result.public_id,
          secureUrl: result.secure_url,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const uploadBlogImage = async (file: Express.Multer.File): Promise<UploadResult> => {
  return uploadToCloudinary(file, CLOUDINARY_FOLDERS.BLOG_IMAGES);
};

export const uploadTeamAvatar = async (file: Express.Multer.File): Promise<UploadResult> => {
  return uploadToCloudinary(file, CLOUDINARY_FOLDERS.TEAM_AVATARS);
};

export const uploadComplianceDocument = async (file: Express.Multer.File): Promise<UploadResult> => {
  return uploadToCloudinary(file, CLOUDINARY_FOLDERS.COMPLIANCE_DOCS);
};

export const uploadTestimonialImage = async (file: Express.Multer.File): Promise<UploadResult> => {
  return uploadToCloudinary(file, CLOUDINARY_FOLDERS.TESTIMONIALS);
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

