import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middlewares/validation.middleware';
import { updateContactSchema } from '../validations/contact.validations';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { publicCache } from '../middlewares/cache.middleware';

const router = Router();

// Public route (edge-cached)
router.get('/', publicCache, contactController.getContact);

// Protected route — admin only
router.put('/', authenticate, authorize('admin'), validate(updateContactSchema), contactController.updateContact);

export default router;
