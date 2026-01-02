import multer from 'multer';
import { FILE_UPLOAD } from '../config/constants';

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const storage = multer.memoryStorage();

// File filter for images
export const imageFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

// File filter for documents
export const documentFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Excel files are allowed'));
  }
};

// Multer configuration for images
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_FILE_SIZE,
  },
});

// Multer configuration for documents
export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_FILE_SIZE,
  },
});

// Single image upload
export const singleImageUpload = uploadImage.single('image');

// Single image upload with 'file' field name (for team routes)
export const singleFileUpload = uploadImage.single('file');

// Single document upload
export const singleDocumentUpload = uploadDocument.single('document');

// Testimonial image upload (supports two file fields: companyLogo and personAvatar)
export const testimonialImageUpload = uploadImage.fields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'personAvatar', maxCount: 1 },
]);

