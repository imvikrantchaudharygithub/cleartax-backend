import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  reorderTeamSchema,
} from '../validations/team.validations';
import { singleFileUpload } from '../middlewares/upload.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', teamController.getTeamMembers);
router.get('/:id', teamController.getTeamMemberById);

// Protected routes — admin only
// NOTE: /reorder must be declared before /:id so it isn't captured as an id param.
router.put('/reorder', authenticate, authorize('admin'), validate(reorderTeamSchema), teamController.reorderTeamMembers);
router.post('/', authenticate, authorize('admin'), singleFileUpload, validate(createTeamMemberSchema), teamController.createTeamMember);
router.put('/:id', authenticate, authorize('admin'), singleFileUpload, validate(updateTeamMemberSchema), teamController.updateTeamMember);
router.delete('/:id', authenticate, authorize('admin'), teamController.deleteTeamMember);

export default router;
