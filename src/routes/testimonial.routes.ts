import { Router } from 'express';
import * as testimonialController from '../controllers/testimonial.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from '../validations/testimonial.validations';
import { testimonialImageUpload } from '../middlewares/upload.middleware';

const router = Router();

// Public routes
router.get('/', testimonialController.getTestimonials);
router.get('/featured', testimonialController.getFeaturedTestimonials);
router.get('/:id', testimonialController.getTestimonialById);

// Protected routes (admin only) - AUTH TEMPORARILY DISABLED
// router.post('/', authenticate, authorize('admin'), testimonialImageUpload, validate(createTestimonialSchema), testimonialController.createTestimonial);
// router.put('/:id', authenticate, authorize('admin'), testimonialImageUpload, validate(updateTestimonialSchema), testimonialController.updateTestimonial);
// router.delete('/:id', authenticate, authorize('admin'), testimonialController.deleteTestimonial);
router.post('/', testimonialImageUpload, validate(createTestimonialSchema), testimonialController.createTestimonial);
router.put('/:id', testimonialImageUpload, validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);

export default router;

