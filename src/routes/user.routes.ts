import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  userQuerySchema,
} from '../validations/user.validations';

const router = Router();

// All user-management routes require an authenticated admin (JWT issued at login)
router.use(authenticate, authorize('admin'));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', validate(userQuerySchema), userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.put('/:id/role', validate(updateUserRoleSchema), userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

export default router;

