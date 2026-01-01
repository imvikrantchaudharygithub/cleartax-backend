import { Router } from 'express';
import * as callbackController from '../controllers/callback.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createCallbackSchema,
  updateCallbackSchema,
  callbackQuerySchema,
  callbackByIdSchema,
} from '../validations/callback.validations';

const router = Router();

// Client route - Create callback request (public)
router.post('/', validate(createCallbackSchema), callbackController.createCallback);

// Admin routes - Get callbacks, stats, update, delete
// AUTH TEMPORARILY DISABLED
// router.get('/', authenticate, authorize('admin'), validate(callbackQuerySchema), callbackController.getCallbacks);
// router.get('/stats', authenticate, authorize('admin'), callbackController.getCallbackStats);
// router.get('/:id', authenticate, authorize('admin'), validate(callbackByIdSchema), callbackController.getCallbackById);
// router.put('/:id', authenticate, authorize('admin'), validate(updateCallbackSchema), callbackController.updateCallback);
// router.delete('/:id', authenticate, authorize('admin'), validate(callbackByIdSchema), callbackController.deleteCallback);

router.get('/', validate(callbackQuerySchema), callbackController.getCallbacks);
router.get('/stats', callbackController.getCallbackStats);
router.get('/:id', validate(callbackByIdSchema), callbackController.getCallbackById);
router.put('/:id', validate(updateCallbackSchema), callbackController.updateCallback);
router.delete('/:id', validate(callbackByIdSchema), callbackController.deleteCallback);

export default router;



