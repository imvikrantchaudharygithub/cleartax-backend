import { Router } from 'express';
import { getHomeInfoController, updateHomeInfoController } from '../controllers/homeInfo.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { publicCache } from '../middlewares/cache.middleware';

const router = Router();

// Public route (edge-cached)
router.get('/', publicCache, getHomeInfoController);

// Protected route — admin only
router.put('/', authenticate, authorize('admin'), uploadImage.any(), updateHomeInfoController);

export default router;
