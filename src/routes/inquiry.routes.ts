import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createInquirySchema,
  inquiryQuerySchema,
  updateInquiryStatusSchema,
} from '../validations/inquiry.validations';

const router = Router();

// Public route
router.post('/', validate(createInquirySchema), inquiryController.createInquiry);

// Admin only routes - AUTH TEMPORARILY DISABLED
// router.get('/', authenticate, authorize('admin'), validate(inquiryQuerySchema), inquiryController.getInquiries);
// router.get('/stats', authenticate, authorize('admin'), inquiryController.getInquiryStats);
// router.get('/:id', authenticate, authorize('admin'), inquiryController.getInquiryById);
// router.put('/:id', authenticate, authorize('admin'), validate(updateInquiryStatusSchema), inquiryController.updateInquiryStatus);
// router.delete('/:id', authenticate, authorize('admin'), inquiryController.deleteInquiry);
router.get('/', validate(inquiryQuerySchema), inquiryController.getInquiries);
router.get('/stats', inquiryController.getInquiryStats);
router.get('/:id', inquiryController.getInquiryById);
router.put('/:id', validate(updateInquiryStatusSchema), inquiryController.updateInquiryStatus);
router.delete('/:id', inquiryController.deleteInquiry);

export default router;

