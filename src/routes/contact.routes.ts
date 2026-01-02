import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middlewares/validation.middleware';
import { updateContactSchema } from '../validations/contact.validations';

const router = Router();

// Public route
router.get('/', contactController.getContact);

// Protected route (admin only) - AUTH TEMPORARILY DISABLED
// router.put('/', authenticate, authorize('admin'), validate(updateContactSchema), contactController.updateContact);
router.put('/', validate(updateContactSchema), contactController.updateContact);

export default router;

