import { Router } from 'express';
import * as serviceController from '../controllers/service.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  createServiceCategorySchema,
  updateServiceCategorySchema,
  createServiceBySubcategorySchema,
  updateServiceByCategorySchema,
  updateServiceBySubcategorySchema,
  createServiceDraftSchema,
  updateServiceDraftSchema,
  publishServiceDraftSchema,
} from '../validations/service.validations';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { publicCache } from '../middlewares/cache.middleware';

const router = Router();

// Public GET routes (edge-cached; drafts stay uncached)
router.get('/', publicCache, validate(serviceQuerySchema), serviceController.getServices);
router.get('/categories', publicCache, serviceController.getServiceCategories);
router.get('/categories/:id', publicCache, serviceController.getServiceCategoryById);
router.get('/draft/:id', serviceController.getServiceDraftById);
router.get('/drafts', serviceController.getServiceDrafts);
router.get('/:category', publicCache, serviceController.getServicesByCategory);
router.get('/:category/:subcategory', publicCache, serviceController.getServicesBySubcategory);
router.get('/:category/:subcategory/:slug', publicCache, serviceController.getServiceBySubcategorySlug);
router.get('/:category/:slug', publicCache, serviceController.getServiceBySlug);

// Protected routes — admin only
// Draft management
router.post('/draft', authenticate, authorize('admin'), validate(createServiceDraftSchema), serviceController.createServiceDraft);
router.put('/draft/:id', authenticate, authorize('admin'), validate(updateServiceDraftSchema), serviceController.updateServiceDraft);
router.delete('/draft/:id', authenticate, authorize('admin'), serviceController.deleteServiceDraft);
router.post('/publish/:id', authenticate, authorize('admin'), validate(publishServiceDraftSchema), serviceController.publishServiceDraft);
router.post('/unpublish/:id', authenticate, authorize('admin'), serviceController.unpublishService);

// Category CRUD — must come before generic /:category routes
router.post('/categories', authenticate, authorize('admin'), validate(createServiceCategorySchema), serviceController.createServiceCategory);
router.put('/categories/:id', authenticate, authorize('admin'), validate(updateServiceCategorySchema), serviceController.updateServiceCategory);
router.delete('/categories/:id', authenticate, authorize('admin'), serviceController.deleteServiceCategory);

// Service CRUD
router.post('/', authenticate, authorize('admin'), validate(createServiceSchema), serviceController.createService);
router.put('/:id', authenticate, authorize('admin'), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, authorize('admin'), serviceController.deleteService);

// Service CRUD by category/subcategory
router.post('/:category/:subcategory/:slug', authenticate, authorize('admin'), validate(createServiceBySubcategorySchema), serviceController.createServiceBySubcategory);
router.put('/:category/:subcategory/:slug', authenticate, authorize('admin'), validate(updateServiceBySubcategorySchema), serviceController.updateServiceBySubcategory);
router.delete('/:category/:subcategory/:slug', authenticate, authorize('admin'), serviceController.deleteServiceBySubcategory);
router.put('/:category/:slug', authenticate, authorize('admin'), validate(updateServiceByCategorySchema), serviceController.updateServiceByCategory);
router.delete('/:category/:slug', authenticate, authorize('admin'), serviceController.deleteServiceByCategory);

export default router;
