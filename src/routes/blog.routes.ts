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
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { publicCache } from '../middlewares/cache.middleware';

const router = Router();

// Public routes (edge-cached)
router.get('/', publicCache, validate(blogQuerySchema), blogController.getBlogs);
router.get('/featured', publicCache, blogController.getFeaturedBlog);
router.get('/recent', publicCache, blogController.getRecentBlogs);
router.get('/:slug', publicCache, validate(getBlogBySlugSchema), blogController.getBlogBySlug);
router.get('/:slug/related', publicCache, validate(getBlogBySlugSchema), blogController.getRelatedBlogs);

// Protected routes — admin only
router.post('/', authenticate, authorize('admin'), singleImageUpload, validate(createBlogSchema), blogController.createBlog);
router.put('/:id', authenticate, authorize('admin'), singleImageUpload, validate(updateBlogSchema), blogController.updateBlog);
router.delete('/:id', authenticate, authorize('admin'), blogController.deleteBlog);

export default router;
