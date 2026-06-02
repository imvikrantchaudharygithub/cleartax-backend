import { Router } from 'express';
import * as testimonialController from '../controllers/testimonial.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from '../validations/testimonial.validations';
import { testimonialImageUpload } from '../middlewares/upload.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', testimonialController.getTestimonials);
router.get('/featured', testimonialController.getFeaturedTestimonials);
router.get('/:id', testimonialController.getTestimonialById);

// Protected routes — admin only
router.post('/', authenticate, authorize('admin'), testimonialImageUpload, validate(createTestimonialSchema), testimonialController.createTestimonial);
router.put('/:id', authenticate, authorize('admin'), testimonialImageUpload, validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete('/:id', authenticate, authorize('admin'), testimonialController.deleteTestimonial);

export default router;
