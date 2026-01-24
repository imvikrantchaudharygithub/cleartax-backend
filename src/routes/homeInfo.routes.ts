import { Router } from 'express';
import { getHomeInfoController, updateHomeInfoController } from '../controllers/homeInfo.controller';
import { authenticate as protect, authorize } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();

// Public routes
router.get('/', getHomeInfoController);

// Protected routes (Admin only)
router.put(
  '/',
  // protect,
  // authorize(USER_ROLES.ADMIN),
  uploadImage.any(),
  updateHomeInfoController
);

export default router;
