import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Admin-only aggregate stats for the dashboard
router.get('/dashboard', authenticate, authorize('admin'), statsController.getDashboardStats);

export default router;
