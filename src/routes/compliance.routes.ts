import { Router } from 'express';
import * as complianceController from '../controllers/compliance.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createComplianceDeadlineSchema,
  updateComplianceDeadlineSchema,
  createComplianceDocumentSchema,
  updateComplianceDocumentSchema,
  complianceQuerySchema,
} from '../validations/compliance.validations';
import { singleDocumentUpload } from '../middlewares/upload.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Deadline routes
// Public reads used by the public site (/compliance page): deadlines are public data.
router.get('/deadlines/upcoming', complianceController.getUpcomingDeadlines);
router.get('/deadlines', validate(complianceQuerySchema), complianceController.getComplianceDeadlines);
// Admin writes
router.post('/deadlines', authenticate, authorize('admin'), validate(createComplianceDeadlineSchema), complianceController.createComplianceDeadline);
router.put('/deadlines/:id', authenticate, authorize('admin'), validate(updateComplianceDeadlineSchema), complianceController.updateComplianceDeadline);
router.delete('/deadlines/:id', authenticate, authorize('admin'), complianceController.deleteComplianceDeadline);

// Document routes
// Public read used by the public site (/compliance page): document list.
router.get('/documents', validate(complianceQuerySchema), complianceController.getComplianceDocuments);
// Admin writes
router.post('/documents', authenticate, authorize('admin'), singleDocumentUpload, validate(createComplianceDocumentSchema), complianceController.createComplianceDocument);
router.put('/documents/:id', authenticate, authorize('admin'), validate(updateComplianceDocumentSchema), complianceController.updateComplianceDocument);
router.delete('/documents/:id', authenticate, authorize('admin'), complianceController.deleteComplianceDocument);

// Stats route - used by the public site (/compliance page), stays public.
router.get('/stats', complianceController.getComplianceStats);

export default router;
