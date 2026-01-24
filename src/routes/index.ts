import { Router } from 'express';
import authRoutes from './auth.routes';
import blogRoutes from './blog.routes';
import serviceRoutes from './service.routes';
import callbackRoutes from './callback.routes';
import inquiryRoutes from './inquiry.routes';
import userRoutes from './user.routes';
import teamRoutes from './team.routes';
import testimonialRoutes from './testimonial.routes';
import contactRoutes from './contact.routes';
import complianceRoutes from './compliance.routes';
import calculatorRoutes from './calculator.routes';
import homeInfoRoutes from './homeInfo.routes';
import { apiRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Apply rate limiting to all API routes
router.use(apiRateLimiter);

// Route definitions
router.use('/auth', authRoutes);
router.use('/blog', blogRoutes);
router.use('/services', serviceRoutes);
router.use('/callbacks', callbackRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/users', userRoutes);
router.use('/team', teamRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/contact', contactRoutes);
router.use('/compliance', complianceRoutes);
router.use('/calculators', calculatorRoutes);
router.use('/home-info', homeInfoRoutes);

export default router;

