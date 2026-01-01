import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from '../validations/team.validations';
import { singleImageUpload } from '../middlewares/upload.middleware';

const router = Router();

// Public routes
router.get('/', teamController.getTeamMembers);
router.get('/:id', teamController.getTeamMemberById);

// Protected routes (admin only) - AUTH TEMPORARILY DISABLED
// router.post('/', authenticate, authorize('admin'), singleImageUpload, validate(createTeamMemberSchema), teamController.createTeamMember);
// router.put('/:id', authenticate, authorize('admin'), singleImageUpload, validate(updateTeamMemberSchema), teamController.updateTeamMember);
// router.delete('/:id', authenticate, authorize('admin'), teamController.deleteTeamMember);
router.post('/', singleImageUpload, validate(createTeamMemberSchema), teamController.createTeamMember);
router.put('/:id', singleImageUpload, validate(updateTeamMemberSchema), teamController.updateTeamMember);
router.delete('/:id', teamController.deleteTeamMember);

export default router;

