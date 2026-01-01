import { Router } from 'express';
import * as blogController from '../controllers/blog.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createBlogSchema,
  updateBlogSchema,
  getBlogBySlugSchema,
  blogQuerySchema,
} from '../validations/blog.validations';
import { singleImageUpload } from '../middlewares/upload.middleware';

const router = Router();

// Public routes
router.get('/', validate(blogQuerySchema), blogController.getBlogs);
router.get('/featured', blogController.getFeaturedBlog);
router.get('/recent', blogController.getRecentBlogs);
router.get('/:slug', validate(getBlogBySlugSchema), blogController.getBlogBySlug);
router.get('/:slug/related', validate(getBlogBySlugSchema), blogController.getRelatedBlogs);

// Protected routes (admin only) - AUTH TEMPORARILY DISABLED
// router.post('/', authenticate, authorize('admin'), singleImageUpload, validate(createBlogSchema), blogController.createBlog);
// router.put('/:id', authenticate, authorize('admin'), singleImageUpload, validate(updateBlogSchema), blogController.updateBlog);
// router.delete('/:id', authenticate, authorize('admin'), blogController.deleteBlog);
router.post('/', singleImageUpload, validate(createBlogSchema), blogController.createBlog);
router.put('/:id', singleImageUpload, validate(updateBlogSchema), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

export default router;

