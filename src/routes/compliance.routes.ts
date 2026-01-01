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

const router = Router();

// Deadline routes - AUTH TEMPORARILY DISABLED
router.get('/deadlines', validate(complianceQuerySchema), complianceController.getComplianceDeadlines);
router.get('/deadlines/upcoming', complianceController.getUpcomingDeadlines);
// router.post('/deadlines', authenticate, authorize('admin'), validate(createComplianceDeadlineSchema), complianceController.createComplianceDeadline);
// router.put('/deadlines/:id', authenticate, authorize('admin'), validate(updateComplianceDeadlineSchema), complianceController.updateComplianceDeadline);
// router.delete('/deadlines/:id', authenticate, authorize('admin'), complianceController.deleteComplianceDeadline);
router.post('/deadlines', validate(createComplianceDeadlineSchema), complianceController.createComplianceDeadline);
router.put('/deadlines/:id', validate(updateComplianceDeadlineSchema), complianceController.updateComplianceDeadline);
router.delete('/deadlines/:id', complianceController.deleteComplianceDeadline);

// Document routes - AUTH TEMPORARILY DISABLED
router.get('/documents', validate(complianceQuerySchema), complianceController.getComplianceDocuments);
// router.post('/documents', authenticate, singleDocumentUpload, validate(createComplianceDocumentSchema), complianceController.createComplianceDocument);
// router.put('/documents/:id', authenticate, authorize('admin'), validate(updateComplianceDocumentSchema), complianceController.updateComplianceDocument);
// router.delete('/documents/:id', authenticate, authorize('admin'), complianceController.deleteComplianceDocument);
router.post('/documents', singleDocumentUpload, validate(createComplianceDocumentSchema), complianceController.createComplianceDocument);
router.put('/documents/:id', validate(updateComplianceDocumentSchema), complianceController.updateComplianceDocument);
router.delete('/documents/:id', complianceController.deleteComplianceDocument);

// Stats route - AUTH TEMPORARILY DISABLED
// router.get('/stats', authenticate, complianceController.getComplianceStats);
router.get('/stats', complianceController.getComplianceStats);

export default router;

