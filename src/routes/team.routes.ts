import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from '../validations/team.validations';
import { singleFileUpload } from '../middlewares/upload.middleware';

const router = Router();

// Public routes
router.get('/', teamController.getTeamMembers);
router.get('/:id', teamController.getTeamMemberById);

// Protected routes (admin only) - AUTH TEMPORARILY DISABLED
// router.post('/', authenticate, authorize('admin'), singleFileUpload, validate(createTeamMemberSchema), teamController.createTeamMember);
// router.put('/:id', authenticate, authorize('admin'), singleFileUpload, validate(updateTeamMemberSchema), teamController.updateTeamMember);
// router.delete('/:id', authenticate, authorize('admin'), teamController.deleteTeamMember);
router.post('/', singleFileUpload, validate(createTeamMemberSchema), teamController.createTeamMember);
router.put('/:id', singleFileUpload, validate(updateTeamMemberSchema), teamController.updateTeamMember);
router.delete('/:id', teamController.deleteTeamMember);

export default router;

