import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createInquirySchema,
  inquiryQuerySchema,
  updateInquiryStatusSchema,
} from '../validations/inquiry.validations';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public route — anyone can submit an inquiry
router.post('/', validate(createInquirySchema), inquiryController.createInquiry);

// Protected routes — admin only
router.get('/', authenticate, authorize('admin'), validate(inquiryQuerySchema), inquiryController.getInquiries);
router.get('/stats', authenticate, authorize('admin'), inquiryController.getInquiryStats);
router.get('/:id', authenticate, authorize('admin'), inquiryController.getInquiryById);
router.put('/:id', authenticate, authorize('admin'), validate(updateInquiryStatusSchema), inquiryController.updateInquiryStatus);
router.delete('/:id', authenticate, authorize('admin'), inquiryController.deleteInquiry);

export default router;
