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

const router = Router();

// Public GET routes
router.get('/', validate(serviceQuerySchema), serviceController.getServices);
router.get('/categories', serviceController.getServiceCategories);
router.get('/categories/:id', serviceController.getServiceCategoryById);
router.post('/draft', validate(createServiceDraftSchema), serviceController.createServiceDraft);
router.put('/draft/:id', validate(updateServiceDraftSchema), serviceController.updateServiceDraft);
router.get('/draft/:id', serviceController.getServiceDraftById);
router.get('/drafts', serviceController.getServiceDrafts);
router.delete('/draft/:id', serviceController.deleteServiceDraft);
router.post('/publish/:id', validate(publishServiceDraftSchema), serviceController.publishServiceDraft);
// Category CRUD routes must come before generic /:category route to avoid conflicts
router.put('/categories/:id', validate(updateServiceCategorySchema), serviceController.updateServiceCategory);
router.delete('/categories/:id', serviceController.deleteServiceCategory);
router.get('/:category', serviceController.getServicesByCategory);
router.get('/:category/:subcategory', serviceController.getServicesBySubcategory); // Get all items/services of a subcategory
// Service CRUD by category/subcategory routes - PUT/DELETE must come before GET routes with same pattern
router.put('/:category/:subcategory/:slug', validate(updateServiceBySubcategorySchema), serviceController.updateServiceBySubcategory); // Update subcategory item
router.delete('/:category/:subcategory/:slug', serviceController.deleteServiceBySubcategory); // Delete subcategory item
router.get('/:category/:subcategory/:slug', serviceController.getServiceBySubcategorySlug); // Subcategory item details
router.put('/:category/:slug', validate(updateServiceByCategorySchema), serviceController.updateServiceByCategory); // Update category item
router.delete('/:category/:slug', serviceController.deleteServiceByCategory); // Delete category item
router.get('/:category/:slug', serviceController.getServiceBySlug); // Category item details

// Protected POST/PUT/DELETE routes (admin only) - AUTH TEMPORARILY DISABLED
// router.post('/', authenticate, authorize('admin'), validate(createServiceSchema), serviceController.createService);
// router.post('/categories', authenticate, authorize('admin'), validate(createServiceCategorySchema), serviceController.createServiceCategory);
// router.post('/:category/:subcategory/:slug', authenticate, authorize('admin'), validate(createServiceBySubcategorySchema), serviceController.createServiceBySubcategory);
// router.put('/:id', authenticate, authorize('admin'), validate(updateServiceSchema), serviceController.updateService);
// router.delete('/:id', authenticate, authorize('admin'), serviceController.deleteService);
router.post('/', validate(createServiceSchema), serviceController.createService);
router.post('/categories', validate(createServiceCategorySchema), serviceController.createServiceCategory);
router.post('/:category/:subcategory/:slug', validate(createServiceBySubcategorySchema), serviceController.createServiceBySubcategory); // Create service with category and subcategory
router.put('/:id', validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router;

