import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  updateUserSchema,
  updateUserRoleSchema,
  userQuerySchema,
} from '../validations/user.validations';

const router = Router();

// All routes require admin authentication - AUTH TEMPORARILY DISABLED
// router.use(authenticate, authorize('admin'));

router.get('/', validate(userQuerySchema), userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.put('/:id/role', validate(updateUserRoleSchema), userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

export default router;

