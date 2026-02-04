import { Service } from '../models/Service.model';
import { ServiceCategory } from '../models/ServiceCategory.model';
import {
  ServiceCreateRequest,
  ServiceUpdateRequest,
  ServiceQueryParams,
  ServiceResponse,
  ServiceCategoryCreateRequest,
  ServiceCategoryResponse,
} from '../types/service.types';
import { PAGINATION } from '../config/constants';
import mongoose from 'mongoose';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ensureUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await Service.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export const createService = async (data: ServiceCreateRequest): Promise<ServiceResponse> => {
  const slug = data.slug || generateSlug(data.title);

  // Check if slug already exists
  const existingService = await Service.findOne({ slug });
  if (existingService) {
    throw new Error('A service with this title already exists');
  }

  const serviceData: any = {
    ...data,
    slug,
    status: data.status || 'published',
  };

  // Handle category - can be ObjectId, category slug/id, or categoryName string
  if (data.category) {
    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(data.category)) {
      serviceData.category = new mongoose.Types.ObjectId(data.category);
    } else {
      // Try to find category by slug or id
      const categoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: data.category.toLowerCase() },
          { id: data.category.toLowerCase() },
        ],
      });
      if (categoryDoc) {
        serviceData.category = categoryDoc._id;
      } else {
        // Fallback to categoryName string (for backward compatibility)
        serviceData.categoryName = data.category;
      }
    }
  }

  // Handle subcategory similarly
  if ((data as any).subcategory) {
    const subcategory = (data as any).subcategory;
    if (mongoose.Types.ObjectId.isValid(subcategory)) {
      serviceData.subcategory = new mongoose.Types.ObjectId(subcategory);
    } else {
      const subcategoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: subcategory.toLowerCase() },
          { id: subcategory.toLowerCase() },
        ],
      });
      if (subcategoryDoc) {
        serviceData.subcategory = subcategoryDoc._id;
      }
    }
  }

  if (data.relatedServices && data.relatedServices.length > 0) {
    serviceData.relatedServices = data.relatedServices.map((id) => new mongoose.Types.ObjectId(id));
  }

  const service = await Service.create(serviceData);

  return service.toObject() as unknown as ServiceResponse;
};

export const createServiceDraft = async (data: ServiceUpdateRequest): Promise<ServiceResponse> => {
  const baseSlug = data.slug || (data.title ? generateSlug(data.title) : `draft-${new mongoose.Types.ObjectId().toString()}`);
  const slug = await ensureUniqueSlug(baseSlug);
  const lastSavedAtInput = data.draftMeta?.lastSavedAt;
  const parsedLastSavedAt = lastSavedAtInput ? new Date(lastSavedAtInput) : new Date();
  const lastSavedAt = Number.isNaN(parsedLastSavedAt.getTime()) ? new Date() : parsedLastSavedAt;
  const serviceData: any = {
    ...data,
    slug,
    status: 'draft',
    draftMeta: {
      completionStep: data.draftMeta?.completionStep || 0,
      lastSavedAt,
    },
  };

  if (data.category) {
    if (mongoose.Types.ObjectId.isValid(data.category)) {
      serviceData.category = new mongoose.Types.ObjectId(data.category);
    } else {
      const categoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: data.category.toLowerCase() },
          { id: data.category.toLowerCase() },
        ],
      });
      if (categoryDoc) {
        serviceData.category = categoryDoc._id;
      } else {
        serviceData.categoryName = data.category;
      }
    }
  }

  if ((data as any).subcategory) {
    const subcategory = (data as any).subcategory;
    if (mongoose.Types.ObjectId.isValid(subcategory)) {
      serviceData.subcategory = new mongoose.Types.ObjectId(subcategory);
    } else {
      const subcategoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: subcategory.toLowerCase() },
          { id: subcategory.toLowerCase() },
        ],
      });
      if (subcategoryDoc) {
        serviceData.subcategory = subcategoryDoc._id;
      } else {
        serviceData.subcategory = subcategory;
      }
    }
  }

  if (data.relatedServices && data.relatedServices.length > 0) {
    serviceData.relatedServices = data.relatedServices.map((id) => new mongoose.Types.ObjectId(id));
  }

  const service = await Service.create(serviceData);
  return service.toObject() as unknown as ServiceResponse;
};

export const updateServiceDraft = async (id: string, data: ServiceUpdateRequest): Promise<ServiceResponse> => {
  const service = await Service.findById(id);

  if (!service) {
    throw new Error('Service not found');
  }

  if (service.status === 'published') {
    throw new Error('Cannot update a published service via draft endpoint');
  }

  if (data.title && data.title !== service.title && !data.slug) {
    const baseSlug = generateSlug(data.title);
    data.slug = await ensureUniqueSlug(baseSlug, id);
  }

  if (data.relatedServices && data.relatedServices.length > 0) {
    data.relatedServices = data.relatedServices.map((rid) => new mongoose.Types.ObjectId(rid)) as any;
  }

  if (data.category) {
    if (mongoose.Types.ObjectId.isValid(data.category)) {
      (data as any).category = new mongoose.Types.ObjectId(data.category);
    } else {
      const categoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: data.category.toLowerCase() },
          { id: data.category.toLowerCase() },
        ],
      });
      if (categoryDoc) {
        (data as any).category = categoryDoc._id;
      } else {
        (data as any).categoryName = data.category;
      }
    }
  }

  if ((data as any).subcategory) {
    const subcategory = (data as any).subcategory;
    if (mongoose.Types.ObjectId.isValid(subcategory)) {
      (data as any).subcategory = new mongoose.Types.ObjectId(subcategory);
    } else {
      const subcategoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: subcategory.toLowerCase() },
          { id: subcategory.toLowerCase() },
        ],
      });
      if (subcategoryDoc) {
        (data as any).subcategory = subcategoryDoc._id;
      }
    }
  }

  const lastSavedAtInput = data.draftMeta?.lastSavedAt;
  const parsedLastSavedAt = lastSavedAtInput ? new Date(lastSavedAtInput) : new Date();
  const lastSavedAt = Number.isNaN(parsedLastSavedAt.getTime()) ? new Date() : parsedLastSavedAt;

  (data as any).status = 'draft';
  (data as any).draftMeta = {
    completionStep: data.draftMeta?.completionStep ?? service.draftMeta?.completionStep ?? 0,
    lastSavedAt,
  };

  Object.assign(service, data);
  await service.save();

  return service.toObject() as unknown as ServiceResponse;
};

export const getServiceDraftById = async (id: string): Promise<ServiceResponse> => {
  const service = await Service.findOne({ _id: id, status: 'draft' })
    .populate('relatedServices', '_id slug title shortDescription')
    .lean();

  if (!service) {
    throw new Error('Service draft not found');
  }

  return service as unknown as ServiceResponse;
};

export const getServiceDrafts = async (query: ServiceQueryParams): Promise<ServiceResponse[]> => {
  const filter: any = { status: 'draft' };

  if (query.category) {
    const categoryQuery = query.category.toLowerCase();
    const categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: categoryQuery },
        { id: categoryQuery },
      ],
    }).lean();

    if (categoryDoc) {
      const categoryId = categoryDoc._id;
      const categoryIdString = categoryId.toString();
      filter.$or = [
        { category: categoryIdString },
        { category: categoryId },
        { category: categoryDoc.slug },
        { category: categoryDoc.id },
        ...(categoryDoc.title ? [{ categoryName: { $regex: categoryDoc.title, $options: 'i' } }] : []),
      ];
    } else {
      filter.$or = [
        { category: categoryQuery },
        { categoryName: { $regex: categoryQuery, $options: 'i' } },
      ];
    }
  }

  const drafts = await Service.find(filter)
    .sort({ updatedAt: -1 })
    .lean();

  return drafts as unknown as ServiceResponse[];
};

export const publishServiceDraft = async (id: string): Promise<ServiceResponse> => {
  const service = await Service.findById(id);

  if (!service) {
    throw new Error('Service draft not found');
  }

  if (service.status !== 'draft') {
    throw new Error('Service is already published');
  }

  if (!service.title || !service.shortDescription || !service.longDescription || !service.iconName) {
    throw new Error('Missing required fields to publish the service');
  }

  if (!service.price || service.price.min === undefined || service.price.max === undefined) {
    throw new Error('Price information is required to publish the service');
  }

  if (!service.duration) {
    throw new Error('Duration is required to publish the service');
  }

  if (!service.category && !service.categoryName) {
    throw new Error('Category is required to publish the service');
  }

  const newSlug = service.slug || generateSlug(service.title);
  const ensuredSlug = await ensureUniqueSlug(newSlug, id);
  service.slug = ensuredSlug;
  service.status = 'published';
  service.draftMeta = {
    ...(service.draftMeta || {}),
    lastSavedAt: new Date(),
  };

  await service.save();
  return service.toObject() as unknown as ServiceResponse;
};

export const deleteServiceDraft = async (id: string): Promise<void> => {
  const service = await Service.findOne({ _id: id, status: 'draft' });

  if (!service) {
    throw new Error('Service draft not found');
  }

  await Service.deleteOne({ _id: id });
};

export const getServices = async (query: ServiceQueryParams) => {
  // If no pagination params, return all services (or default to 1000)
  const usePagination = query.page !== undefined || query.limit !== undefined;
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = usePagination 
    ? Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
    : 1000; // Default to 1000 if no pagination specified
  const skip = usePagination ? (page - 1) * limit : 0;

  const filter: any = {};
  let categoriesByType: any[] = []; // Store for later use
  let isCategoryTypeQuery = false;

  // Handle category filtering - can be category slug, id, categoryType, or categoryName
  if (query.category) {
    const categoryQuery = query.category.toLowerCase();
    
    // First try to find category by slug or id
    const categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: categoryQuery },
        { id: categoryQuery },
      ],
    }).lean();

    // Check if it's a categoryType query (if no specific category found)
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: categoryQuery,
      }).lean();
      isCategoryTypeQuery = categoriesByType.length > 0;
    }

    if (categoryDoc) {
      // Filter by specific category - categories are stored as string ObjectIds
      const categoryId = categoryDoc._id;
      const categoryIdString = categoryId.toString();
      
      // Build filter to match category - prioritize string format since that's how it's stored
      filter.$or = [
        { category: categoryIdString }, // Match string ObjectId (primary match)
        { category: categoryId }, // Match ObjectId reference (if stored as ObjectId)
      ];
      
      // Also check categoryName and category slug/id for backward compatibility
      if (categoryDoc.title) {
        filter.$or.push(
          { categoryName: { $regex: categoryDoc.title, $options: 'i' } }
        );
      }
      if (categoryDoc.slug) {
        filter.$or.push(
          { category: categoryDoc.slug },
          { categoryName: { $regex: categoryDoc.slug, $options: 'i' } }
        );
      }
      if (categoryDoc.id) {
        filter.$or.push(
          { category: categoryDoc.id },
          { categoryName: { $regex: categoryDoc.id, $options: 'i' } }
        );
      }
    } else if (categoriesByType.length > 0) {
      // Filter by categoryType - match all categories with this type
      // Use regex matching to avoid type coercion issues with Mixed type field
      filter.$or = [];
      
      categoriesByType.forEach((cat: any) => {
        const categoryId = cat._id;
        // Get string representation
        const categoryIdString = categoryId.toString ? categoryId.toString() : String(categoryId);
        
        // Use regex to match the category ID (avoids type coercion issues)
        // Escape special regex characters in the ObjectId string
        const escapedId = categoryIdString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or.push(
          { category: { $regex: `^${escapedId}$`, $options: 'i' } }, // Exact match with regex
          { category: categoryIdString }, // Direct string match
          { category: categoryId } // ObjectId match
        );
        
        // Also match by category name, slug, and id
        if (cat.title) {
          filter.$or.push({ categoryName: { $regex: cat.title, $options: 'i' } });
        }
        if (cat.slug) {
          filter.$or.push({ category: cat.slug });
        }
        if (cat.id) {
          filter.$or.push({ category: cat.id });
        }
      });
    } else {
      // Fallback to categoryName string matching (for backward compatibility)
      filter.$or = [
        { categoryName: { $regex: query.category, $options: 'i' } },
        { category: { $regex: query.category, $options: 'i' } },
      ];
    }
  }

  // Search functionality
  if (query.search) {
    filter.$or = [
      ...(filter.$or || []),
      { $text: { $search: query.search } },
      { title: { $regex: query.search, $options: 'i' } },
      { shortDescription: { $regex: query.search, $options: 'i' } },
      { longDescription: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (!query.includeDrafts) {
    filter.$or = [
      ...(filter.$or || []),
      { status: 'published' },
      { status: { $exists: false } },
    ];
  }

  // Build query - don't use populate for category/subcategory as they might be strings
  // We'll handle population manually in the transformation
  // For categoryType queries, fetch all services and filter after transformation
  let serviceQuery = isCategoryTypeQuery 
    ? Service.find(query.includeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] }) // Fetch all for categoryType filtering
    : Service.find(filter); // Use filter for specific category queries
  
  serviceQuery = serviceQuery
    .populate('relatedServices', '_id slug title shortDescription')
    .sort({ createdAt: -1 });

  // Apply pagination only if specified and not a categoryType query
  if (usePagination && !isCategoryTypeQuery) {
    serviceQuery = serviceQuery.skip(skip).limit(limit);
  }

  const [services, total, allCategories] = await Promise.all([
    serviceQuery.lean(),
    isCategoryTypeQuery ? Service.countDocuments(query.includeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] }) : Service.countDocuments(filter),
    ServiceCategory.find().lean(), // Fetch all categories once for efficient lookup
  ]);

  // Create lookup maps for categories by _id, slug, id, and categoryType
  const categoryById = new Map();
  const categoryBySlug = new Map();
  const categoryByIdString = new Map();
  const categoryByType = new Map();

  allCategories.forEach((cat: any) => {
    const categoryData = {
      _id: cat._id.toString(),
      id: cat.id,
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      iconName: cat.iconName,
      heroTitle: cat.heroTitle,
      heroDescription: cat.heroDescription,
      categoryType: cat.categoryType,
    };

    categoryById.set(cat._id.toString(), categoryData);
    categoryBySlug.set(cat.slug?.toLowerCase(), categoryData);
    categoryByIdString.set(cat.id?.toLowerCase(), categoryData);
    if (cat.categoryType) {
      categoryByType.set(cat.categoryType.toLowerCase(), categoryData);
    }
  });

  // Transform services to match required response format
  let transformedServices = services.map((service: any) => {
    const transformed: any = {
      _id: service._id.toString(),
      slug: service.slug,
      title: service.title,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      iconName: service.iconName,
      price: service.price,
      duration: service.duration,
      features: service.features || [],
      benefits: service.benefits || [],
      requirements: service.requirements || [],
      process: service.process || [],
      faqs: service.faqs || [],
      relatedServices: (service.relatedServices || []).map((s: any) => 
        typeof s === 'object' ? s._id.toString() : s.toString()
      ),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };

    // Handle category - check if it's ObjectId or string
    let categoryInfo: any = null;
    
    if (service.category) {
      const categoryValue = service.category;
      
      // Check if it's an ObjectId
      if (mongoose.Types.ObjectId.isValid(categoryValue) && typeof categoryValue !== 'string') {
        categoryInfo = categoryById.get(categoryValue.toString());
      } else {
        // It's a string - try to find by slug, id, or categoryType
        const categoryStr = categoryValue.toString().toLowerCase();
        categoryInfo = categoryBySlug.get(categoryStr) || 
                      categoryByIdString.get(categoryStr) || 
                      categoryByType.get(categoryStr);
      }
      
      if (categoryInfo) {
        transformed.category = categoryInfo._id;
        // Get full category document to check for subServices
        const fullCategoryDoc = allCategories.find((cat: any) => 
          cat._id.toString() === categoryInfo._id || 
          cat.slug?.toLowerCase() === categoryInfo.slug?.toLowerCase() ||
          cat.id?.toLowerCase() === categoryInfo.id?.toLowerCase()
        );
        const hasSubcategories = fullCategoryDoc?.subServices && fullCategoryDoc.subServices.length > 0;
        const itemsCount = hasSubcategories 
          ? (fullCategoryDoc.subServices as any[]).length 
          : 0; // Will be calculated separately if needed
        
        transformed.categoryInfo = {
          _id: categoryInfo._id,
          id: categoryInfo.id,
          slug: categoryInfo.slug,
          title: categoryInfo.title,
          categoryType: categoryInfo.categoryType,
          hasSubcategories,
          itemsCount,
        };
      } else {
        // No matching category found, use the value as-is
        transformed.category = typeof categoryValue === 'object' ? categoryValue.toString() : categoryValue;
      }
    } else if (service.categoryName) {
      // Fallback to categoryName
      const categoryStr = service.categoryName.toLowerCase();
      categoryInfo = categoryBySlug.get(categoryStr) || 
                    categoryByIdString.get(categoryStr) || 
                    categoryByType.get(categoryStr);
      
      if (categoryInfo) {
        transformed.category = categoryInfo._id;
        // Get full category document to check for subServices
        const fullCategoryDoc = allCategories.find((cat: any) => 
          cat._id.toString() === categoryInfo._id || 
          cat.slug?.toLowerCase() === categoryInfo.slug?.toLowerCase() ||
          cat.id?.toLowerCase() === categoryInfo.id?.toLowerCase()
        );
        const hasSubcategories = fullCategoryDoc?.subServices && fullCategoryDoc.subServices.length > 0;
        const itemsCount = hasSubcategories 
          ? (fullCategoryDoc.subServices as any[]).length 
          : 0;
        
        transformed.categoryInfo = {
          _id: categoryInfo._id,
          id: categoryInfo.id,
          slug: categoryInfo.slug,
          title: categoryInfo.title,
          categoryType: categoryInfo.categoryType,
          hasSubcategories,
          itemsCount,
        };
      } else {
        transformed.category = service.categoryName;
      }
    }

    // Handle subcategory similarly
    if (service.subcategory) {
      const subcategoryValue = service.subcategory;
      let subcategoryInfo = null;
      
      if (mongoose.Types.ObjectId.isValid(subcategoryValue) && typeof subcategoryValue !== 'string') {
        subcategoryInfo = categoryById.get(subcategoryValue.toString());
      } else {
        const subcategoryStr = subcategoryValue.toString().toLowerCase();
        subcategoryInfo = categoryBySlug.get(subcategoryStr) || 
                         categoryByIdString.get(subcategoryStr);
      }
      
      if (subcategoryInfo) {
        transformed.subcategory = subcategoryInfo._id;
        transformed.subcategoryInfo = {
          _id: subcategoryInfo._id,
          id: subcategoryInfo.id,
          slug: subcategoryInfo.slug,
          title: subcategoryInfo.title,
        };
      } else {
        transformed.subcategory = typeof subcategoryValue === 'object' ? subcategoryValue.toString() : subcategoryValue;
      }
    }

    return transformed;
  });

  // If filtering by categoryType, filter after populating category info
  if (isCategoryTypeQuery && categoriesByType.length > 0) {
    const categoryTypeIds = new Set(categoriesByType.map((cat: any) => cat._id.toString()));
    transformedServices = transformedServices.filter((service: any) => {
      const serviceCategoryId = service.categoryInfo?._id || service.category;
      return serviceCategoryId && categoryTypeIds.has(serviceCategoryId.toString());
    });
  }

  return {
    services: transformedServices,
    pagination: usePagination
      ? {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      : {
          page: 1,
          limit: total,
          total,
          totalPages: 1,
        },
  };
};

export const getServiceBySlug = async (
  slug: string,
  _category?: string,
  includeDrafts = false
): Promise<ServiceResponse & { category?: any; subcategories?: ServiceResponse[] }> => {
  let service = await Service.findOne(includeDrafts ? { slug } : { slug, status: 'published' })
    .populate('relatedServices', '_id slug title shortDescription')
    .lean();

  if (!service && _category) {
    // Fallback: request slug may be longer than stored slug (e.g. "revocation-of-gst-registration" vs "revocation")
    const categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: _category.toLowerCase() },
        { id: _category.toLowerCase() },
        { categoryType: _category.toLowerCase() },
      ],
    }).lean();
    if (categoryDoc) {
      const categoryId = categoryDoc._id.toString();
      const statusFilter = includeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] };
      const inCategory = await Service.find({
        ...statusFilter,
        $or: [
          { category: categoryId },
          { category: new mongoose.Types.ObjectId(categoryId) },
          { category: _category.toLowerCase() },
        ],
      })
        .populate('relatedServices', '_id slug title shortDescription')
        .lean();
      const slugLower = slug.toLowerCase();
      const matches = (inCategory as any[]).filter(
        (s: any) => slugLower === (s.slug || '').toLowerCase() || slugLower.startsWith((s.slug || '').toLowerCase() + '-')
      );
      if (matches.length > 0) {
        const best = matches.reduce((a, b) => ((a.slug || '').length >= (b.slug || '').length ? a : b));
        service = best as any;
      }
    }
  }
  if (!service) {
    throw new Error('Service not found');
  }

  // Get category information
  let categoryData: any = null;
  let subcategories: ServiceResponse[] = [];

  if (service.category) {
    const categoryValue = service.category;
    let categoryIdString: string;
    
    if (typeof categoryValue === 'object' && categoryValue.toString) {
      categoryIdString = categoryValue.toString();
    } else {
      categoryIdString = String(categoryValue);
    }

    // Find the category document - handle both ObjectId and string ObjectId
    let categoryDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(categoryIdString)) {
      categoryDoc = await ServiceCategory.findById(categoryIdString)
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
    }
    
    // If not found by ObjectId, try to find by slug or id
    if (!categoryDoc) {
      categoryDoc = await ServiceCategory.findOne({
        $or: [
          { slug: categoryIdString.toLowerCase() },
          { id: categoryIdString.toLowerCase() },
        ],
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
    }

    if (categoryDoc) {
      categoryData = {
        _id: categoryDoc._id.toString(),
        id: categoryDoc.id,
        slug: categoryDoc.slug,
        title: categoryDoc.title,
        description: categoryDoc.description,
        iconName: categoryDoc.iconName,
        heroTitle: categoryDoc.heroTitle,
        heroDescription: categoryDoc.heroDescription,
        categoryType: categoryDoc.categoryType,
      };

      // Include subcategories if they exist
      if (categoryDoc.subServices && categoryDoc.subServices.length > 0) {
        subcategories = (categoryDoc.subServices as any[]).map((subService: any) => ({
          _id: subService._id.toString(),
          slug: subService.slug,
          title: subService.title,
          shortDescription: subService.shortDescription || '',
          iconName: subService.iconName || '',
          price: subService.price || { min: 0, max: 0, currency: 'INR' },
          duration: subService.duration || '',
        })) as unknown as ServiceResponse[];
      }
    }
  }

  // Transform service with category info
  const transformed: any = {
    _id: service._id.toString(),
    slug: service.slug,
    title: service.title,
    shortDescription: service.shortDescription,
    longDescription: service.longDescription,
    iconName: service.iconName,
    price: service.price,
    duration: service.duration,
    features: service.features || [],
    benefits: service.benefits || [],
    requirements: service.requirements || [],
    process: service.process || [],
    faqs: service.faqs || [],
    relatedServices: (service.relatedServices || []).map((s: any) => 
      typeof s === 'object' ? s._id.toString() : s.toString()
    ),
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };

  // Add category information
  if (categoryData) {
    transformed.category = service.category.toString();
    transformed.categoryInfo = categoryData;
    
    // Add subcategories if they exist
    if (subcategories.length > 0) {
      transformed.subcategories = subcategories;
    }
  }

  // Handle subcategory if exists
  if (service.subcategory) {
    const subcategoryValue = service.subcategory;
    transformed.subcategory = typeof subcategoryValue === 'object' 
      ? subcategoryValue.toString() 
      : subcategoryValue.toString();
  }

  return transformed;
};

export const getServicesByCategory = async (
  category: string,
  includeDrafts = false
): Promise<{
  services: ServiceResponse[];
  category: any;
  subcategories?: (ServiceResponse & { itemsCount?: number })[];
}> => {
  const serviceBaseFilter = includeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }, { status: null }] };
  // First try to find by slug or id (specific category)
  let categoryDoc = await ServiceCategory.findOne({
    $or: [
      { slug: category.toLowerCase() },
      { id: category.toLowerCase() },
    ],
  }).populate('subServices', '_id slug title shortDescription iconName price duration').lean();

  // If not found by slug/id, check if it's a categoryType query
  let categoriesByType: any[] = [];
  let isCategoryTypeQuery = false;
  
  if (!categoryDoc) {
    categoriesByType = await ServiceCategory.find({
      categoryType: category.toLowerCase(),
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();
    
    if (categoriesByType.length > 0) {
      isCategoryTypeQuery = true;
      
      // For categoryType queries, ALWAYS create a virtual parent and treat all categories as subcategories
      // This ensures consistent behavior: when querying by categoryType (e.g., "ipo", "banking-finance"),
      // we show all categories of that type as subcategories, regardless of their internal structure
      // The subServices within individual categories are for listing services within that subcategory,
      // not for determining the parent structure
      const categoryTypeLower = category.toLowerCase() as 'simple' | 'banking-finance' | 'ipo' | 'legal';
      categoryDoc = {
        _id: null as any, // Virtual parent
        id: category.toLowerCase(),
        slug: category.toLowerCase(),
        title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
        description: `All ${category} services`,
        iconName: categoriesByType[0].iconName || '',
        heroTitle: `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Services`,
        heroDescription: `Comprehensive ${category} services`,
        categoryType: categoryTypeLower,
        subServices: categoriesByType.map((cat: any) => cat._id), // All categories as subcategories
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
  }

  if (!categoryDoc) {
    // Fallback: try to find services by category string directly
    const services = await Service.find({ 
      ...(includeDrafts ? {} : { status: 'published' }),
      $or: [
        { category: category },
        { categoryName: { $regex: category, $options: 'i' } },
      ]
    }).sort({ createdAt: -1 }).lean();
    return {
      services: services as unknown as ServiceResponse[],
      category: null,
    };
  }

  // Get category ID for filtering services
  // Handle virtual parent category (where _id is null)
  const categoryId = categoryDoc._id;
  const categoryIdString = categoryId ? categoryId.toString() : `virtual-${category.toLowerCase()}`;

  // Check if category has subServices (subcategories)
  let hasSubcategories = categoryDoc.subServices && Array.isArray(categoryDoc.subServices) && categoryDoc.subServices.length > 0;
  
  // Find services in this category - handle both ObjectId and string formats
  // Also match by categoryName for backward compatibility
  // If category has subcategories, we still want to check for direct services
  // (some categories might have both subcategories and direct services)
  // For virtual parent categories, search by categoryType string
  const queryConditions: any[] = [
    { categoryName: { $regex: categoryDoc.title, $options: 'i' } }, // Match by title
    { category: categoryDoc.slug }, // Match by slug (unique per category)
  ];
  
  // Only add ObjectId-based queries if categoryId is not null (not a virtual parent)
  if (categoryId) {
    queryConditions.push(
      { category: categoryIdString }, // Match string ObjectId (primary)
      { category: categoryId }, // Match ObjectId
      { category: new mongoose.Types.ObjectId(categoryIdString) }, // Match as ObjectId
      // Services under subcategories often have category: parentType and subcategory: this category's ObjectId
      { subcategory: categoryIdString },
      { subcategory: categoryId },
      { subcategory: new mongoose.Types.ObjectId(categoryIdString) },
      // Match subcategory stored as string slug (unique per category; avoid id to prevent over-match)
      { subcategory: categoryDoc.slug },
      // Type-safe match: coerce DB value to string (handles Mixed ObjectId vs string)
      { $expr: { $eq: [{ $toString: '$subcategory' }, categoryIdString] } },
      { $expr: { $eq: [{ $toString: '$category' }, categoryIdString] } }
    );
  } else {
    // For virtual parent, also search by categoryType string
    queryConditions.push(
      { category: category.toLowerCase() } // Match by categoryType string (e.g., "banking-finance")
    );
  }
  
  let services = await Service.find({
    ...serviceBaseFilter,
    $or: queryConditions,
  })
    .populate('relatedServices', '_id slug title shortDescription')
    .sort({ createdAt: -1 })
    .lean();

  // Fallback: when no services matched, try explicit subcategory/category refs only (no slug/title regex to avoid over-count)
  if (services.length === 0 && categoryId) {
    const fallbackConditions: any[] = [
      { subcategory: categoryDoc.slug },
      { category: categoryDoc.slug },
    ];
    if (categoryDoc.categoryType) {
      const ct = categoryDoc.categoryType;
      fallbackConditions.push(
        { category: ct, subcategory: categoryIdString },
        { category: ct, subcategory: categoryId },
        { category: ct, subcategory: categoryDoc.slug }
      );
    }
    const fallbackServices = await Service.find({
      ...serviceBaseFilter,
      $or: fallbackConditions,
    })
      .populate('relatedServices', '_id slug title shortDescription')
      .sort({ createdAt: -1 })
      .lean();
    if (fallbackServices.length > 0) {
      services = fallbackServices;
    }
  }

  // Second fallback: when still 0 and this is a subcategory (has categoryType), match by slug pattern
  // IMPORTANT: Use the SAME regex pattern as the controller (lines 95-110 in service.controller.ts)
  if (services.length === 0 && categoryId && categoryDoc.categoryType && categoryDoc.slug) {
    const ct = categoryDoc.categoryType;
    const slugPattern = categoryDoc.slug.replace(/-/g, '[-_]?');
    const titlePattern = categoryDoc.title ? categoryDoc.title.split(' ').join('|') : '';
    
    const fallbackServices = await Service.find({
      ...serviceBaseFilter,
      $and: [
        { category: ct },
        { $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] },
        {
          $or: [
            { slug: { $regex: slugPattern, $options: 'i' } },
            ...(categoryDoc.id ? [{ slug: { $regex: categoryDoc.id.replace(/-/g, '[-_]?'), $options: 'i' } }] : []),
            ...(titlePattern ? [{ title: { $regex: titlePattern, $options: 'i' } }] : []),
          ],
        },
      ],
    })
      .populate('relatedServices', '_id slug title shortDescription')
      .sort({ createdAt: -1 })
      .lean();
    if (fallbackServices.length > 0) {
      services = fallbackServices;
    }
  }

  

  // Transform services with category info
  const transformedServices = services.map((service: any) => {
    const transformed: any = {
      _id: service._id.toString(),
      slug: service.slug,
      title: service.title,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      iconName: service.iconName,
      price: service.price,
      duration: service.duration,
      features: service.features || [],
      benefits: service.benefits || [],
      requirements: service.requirements || [],
      process: service.process || [],
      faqs: service.faqs || [],
      relatedServices: (service.relatedServices || []).map((s: any) => 
        typeof s === 'object' ? s._id.toString() : s.toString()
      ),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      category: categoryIdString || category.toLowerCase(),
      categoryInfo: {
        _id: categoryIdString,
        id: categoryDoc.id,
        slug: categoryDoc.slug,
        title: categoryDoc.title,
        categoryType: categoryDoc.categoryType,
      },
    };

    // Handle subcategory if exists
    if (service.subcategory) {
      const subcategoryValue = service.subcategory;
      if (mongoose.Types.ObjectId.isValid(subcategoryValue) && typeof subcategoryValue !== 'string') {
        // Would need to lookup subcategory, but for now just include the value
        transformed.subcategory = subcategoryValue.toString();
      } else {
        transformed.subcategory = subcategoryValue.toString();
      }
    }

    return transformed;
  });

  // Prepare category data
  // Handle virtual parent category (when categoryType query returns all categories as subcategories)
  const categoryData: any = {
    _id: categoryDoc._id ? categoryIdString : `virtual-${category.toLowerCase()}`,
    id: categoryDoc.id || category.toLowerCase(),
    slug: categoryDoc.slug || category.toLowerCase(),
    title: categoryDoc.title,
    description: categoryDoc.description,
    iconName: categoryDoc.iconName,
    heroTitle: categoryDoc.heroTitle,
    heroDescription: categoryDoc.heroDescription,
    categoryType: categoryDoc.categoryType,
  };

  // Include subcategories if they exist
  let subcategories: (ServiceResponse & { itemsCount?: number })[] = [];
  
  // If this is a categoryType query and we created a virtual parent, use all categories as subcategories
  if (isCategoryTypeQuery && !categoryDoc._id && categoriesByType.length > 0) {
    // All categories of this type are subcategories
    const subcategoryPromises = categoriesByType.map(async (cat: any) => {
      const categoryId = cat._id.toString();
      
      // Count services in this subcategory category
      // Handle services with category as ObjectId, string ObjectId, or categoryType string
      // Base query: match by ObjectId refs and slugs
      // For subcategories with categoryType, use a COMBINED approach:
      // 1. First count services linked by ID (explicit linkage)
      // 2. Then add services matched by slug pattern (implicit linkage)
      let itemsCount = 0;
      if (cat.categoryType && cat.slug) {
        // Step 1: Count services explicitly linked by subcategory ID
        const byIdQuery = {
          ...serviceBaseFilter,
          $or: [
            { category: cat._id },
            { category: categoryId },
            { category: new mongoose.Types.ObjectId(categoryId) },
            { subcategory: cat._id },
            { subcategory: categoryId },
            { subcategory: new mongoose.Types.ObjectId(categoryId) },
            { $expr: { $eq: [{ $toString: '$category' }, categoryId] } },
            { $expr: { $eq: [{ $toString: '$subcategory' }, categoryId] } },
          ],
        };
        const byIdCount = await Service.countDocuments(byIdQuery);
        
        // Step 2: Count services with slug/title pattern matching (but NOT already linked)
        const slugPattern = cat.slug.replace(/-/g, '[-_]?');
        const titlePattern = cat.title ? cat.title.split(' ').join('|') : '';
        
        const byPatternCount = await Service.countDocuments({
          ...serviceBaseFilter,
          $and: [
            { category: cat.categoryType },
            { $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] },
            {
              $or: [
                { slug: { $regex: slugPattern, $options: 'i' } },
                ...(cat.id ? [{ slug: { $regex: cat.id.replace(/-/g, '[-_]?'), $options: 'i' } }] : []),
                ...(titlePattern ? [{ title: { $regex: titlePattern, $options: 'i' } }] : []),
              ],
            },
          ],
        });
        
        itemsCount = byIdCount + byPatternCount;
        
        // Final fallback: Use controller's comprehensive query (all conditions from service.controller.ts lines 69-111)
        if (itemsCount === 0) {
          const comprehensiveQuery = {
            ...serviceBaseFilter,
            $or: [
              // Match by ID variations
              { category: categoryId },
              { category: cat._id },
              { subcategory: categoryId },
              { subcategory: cat._id },
              // Match by slug/id string
              { category: cat.slug },
              { category: cat.id },
              { subcategory: cat.slug },
              { subcategory: cat.id },
              // Match by title regex
              { categoryName: { $regex: cat.title, $options: 'i' } },
            ],
          };
          itemsCount = await Service.countDocuments(comprehensiveQuery);
        }
      } else {
        // For regular subcategories without categoryType, use the standard query
        const countQuery = {
          ...serviceBaseFilter,
          $or: [
            { category: cat._id },
            { category: categoryId },
            { category: new mongoose.Types.ObjectId(categoryId) },
            { subcategory: cat._id },
            { subcategory: categoryId },
            { subcategory: new mongoose.Types.ObjectId(categoryId) },
            { categoryName: { $regex: cat.title, $options: 'i' } },
            { category: cat.slug },
            { subcategory: cat.slug },
            { $expr: { $eq: [{ $toString: '$subcategory' }, categoryId] } },
            { $expr: { $eq: [{ $toString: '$category' }, categoryId] } },
          ],
        };
        itemsCount = await Service.countDocuments(countQuery);
      }
      
      return {
        _id: cat._id.toString(),
        slug: cat.slug,
        title: cat.title,
        shortDescription: cat.description || '',
        longDescription: cat.description || '', // Use description as longDescription
        iconName: cat.iconName || '',
        category: cat._id.toString(),
        price: { min: 0, max: 0, currency: 'INR' }, // Categories don't have prices
        duration: '',
        features: [],
        benefits: [],
        requirements: [],
        process: [],
        faqs: [],
        relatedServices: [],
        createdAt: cat.createdAt || new Date(),
        updatedAt: cat.updatedAt || new Date(),
        itemsCount, // Number of services in this subcategory
      } as ServiceResponse & { itemsCount: number };
    });
    
    subcategories = await Promise.all(subcategoryPromises) as (ServiceResponse & { itemsCount: number })[];
    // Update hasSubcategories flag
    hasSubcategories = subcategories.length > 0;
  } else if (hasSubcategories) {
    // Get items count for each subcategory
    const subcategoryPromises = (categoryDoc.subServices as any[]).map(async (subService: any) => {
      const subcategoryId = subService._id.toString();
      
      // For subcategories with categoryType, ALWAYS use the controller's query logic
      let itemsCount = 0;
      if ((subService as any).categoryType && subService.slug) {
        const slugPattern = subService.slug.replace(/-/g, '[-_]?');
        const titlePattern = subService.title ? subService.title.split(' ').join('|') : '';
        
        itemsCount = await Service.countDocuments({
          ...serviceBaseFilter,
          $and: [
            { category: (subService as any).categoryType },
            { $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] },
            {
              $or: [
                { slug: { $regex: slugPattern, $options: 'i' } },
                ...(subService.id ? [{ slug: { $regex: subService.id.replace(/-/g, '[-_]?'), $options: 'i' } }] : []),
                ...(titlePattern ? [{ title: { $regex: titlePattern, $options: 'i' } }] : []),
              ],
            },
          ],
        });
      } else {
        // For regular subcategories without categoryType, use the standard query
        itemsCount = await Service.countDocuments({
          ...serviceBaseFilter,
          $or: [
            { category: subService._id },
            { category: subcategoryId },
            { category: new mongoose.Types.ObjectId(subcategoryId) },
            { subcategory: subService._id },
            { subcategory: subcategoryId },
            { subcategory: new mongoose.Types.ObjectId(subcategoryId) },
            { categoryName: { $regex: subService.title || subService.shortDescription || '', $options: 'i' } },
            { category: subService.slug },
            { subcategory: subService.slug },
            { $expr: { $eq: [{ $toString: '$subcategory' }, subcategoryId] } },
            { $expr: { $eq: [{ $toString: '$category' }, subcategoryId] } },
          ],
        });
      }
      
      return {
        _id: subService._id.toString(),
        slug: subService.slug,
        title: subService.title,
        shortDescription: subService.shortDescription || '',
        longDescription: subService.longDescription || subService.shortDescription || '',
        iconName: subService.iconName || '',
        category: subService.category?.toString() || '',
        price: subService.price || { min: 0, max: 0, currency: 'INR' },
        duration: subService.duration || '',
        features: subService.features || [],
        benefits: subService.benefits || [],
        requirements: subService.requirements || [],
        process: subService.process || [],
        faqs: subService.faqs || [],
        relatedServices: subService.relatedServices?.map((s: any) => typeof s === 'object' ? s._id.toString() : s.toString()) || [],
        createdAt: subService.createdAt || new Date(),
        updatedAt: subService.updatedAt || new Date(),
        itemsCount, // Number of services in this subcategory
      } as ServiceResponse & { itemsCount: number };
    });
    
    subcategories = await Promise.all(subcategoryPromises) as (ServiceResponse & { itemsCount: number })[];
  }

  // Calculate itemsCount for category
  // If has subcategories: count = number of subcategories
  // If no subcategories: count = number of services directly in category
  const itemsCount = hasSubcategories ? subcategories.length : transformedServices.length;

  // Add hasSubcategories and itemsCount to category data
  categoryData.hasSubcategories = hasSubcategories;
  categoryData.itemsCount = itemsCount;

  return {
    services: transformedServices,
    category: categoryData,
    subcategories: subcategories.length > 0 ? subcategories : undefined,
  };
};

export const updateService = async (id: string, data: ServiceUpdateRequest): Promise<ServiceResponse> => {
  const service = await Service.findById(id);

  if (!service) {
    throw new Error('Service not found');
  }

  // Generate new slug if title changed
  if (data.title && data.title !== service.title) {
    const newSlug = generateSlug(data.title);
    const existingService = await Service.findOne({ slug: newSlug, _id: { $ne: id } });
    if (existingService) {
      throw new Error('A service with this title already exists');
    }
    data.slug = newSlug;
  }

  if (data.relatedServices && data.relatedServices.length > 0) {
    data.relatedServices = data.relatedServices.map((id) => new mongoose.Types.ObjectId(id)) as any;
  }

  Object.assign(service, data);
  await service.save();

  return service.toObject() as unknown as ServiceResponse;
};

export const deleteService = async (id: string): Promise<void> => {
  const service = await Service.findByIdAndDelete(id);

  if (!service) {
    throw new Error('Service not found');
  }
};

// Service Category methods
export const createServiceCategory = async (
  data: ServiceCategoryCreateRequest
): Promise<ServiceCategoryResponse> => {
  const slug = generateSlug(data.title);

  // Check if id or slug already exists
  const existing = await ServiceCategory.findOne({
    $or: [{ id: data.id }, { slug }],
  });

  if (existing) {
    throw new Error('A service category with this ID or title already exists');
  }

  const categoryData: any = {
    ...data,
    slug,
  };

  if (data.subServices && data.subServices.length > 0) {
    categoryData.subServices = data.subServices.map((id) => new mongoose.Types.ObjectId(id));
  }

  const category = await ServiceCategory.create(categoryData);

  return category.toObject() as unknown as ServiceCategoryResponse;
};

export const getServiceCategories = async (): Promise<ServiceCategoryResponse[]> => {
  const categories = await ServiceCategory.find().populate('subServices').sort({ createdAt: -1 }).lean();
  return categories as unknown as ServiceCategoryResponse[];
};

export const getServiceCategoryById = async (id: string): Promise<ServiceCategoryResponse> => {
  // Try to find by MongoDB _id first, then by slug, then by id field
  let category = null;
  
  if (mongoose.Types.ObjectId.isValid(id)) {
    category = await ServiceCategory.findById(id).populate('subServices').lean();
  }
  
  if (!category) {
    category = await ServiceCategory.findOne({
      $or: [
        { slug: id.toLowerCase() },
        { id: id.toLowerCase() },
      ],
    }).populate('subServices').lean();
  }

  if (!category) {
    throw new Error('Service category not found');
  }

  return category as unknown as ServiceCategoryResponse;
};

export const updateServiceCategory = async (
  id: string,
  data: Partial<ServiceCategoryCreateRequest>
): Promise<ServiceCategoryResponse> => {
  // Find category by id (try MongoDB _id, then slug, then id field)
  let category = null;
  
  if (mongoose.Types.ObjectId.isValid(id)) {
    category = await ServiceCategory.findById(id);
  }
  
  if (!category) {
    category = await ServiceCategory.findOne({
      $or: [
        { slug: id.toLowerCase() },
        { id: id.toLowerCase() },
      ],
    });
  }

  if (!category) {
    throw new Error('Service category not found');
  }

  // Generate new slug if title changed
  if (data.title && data.title !== category.title) {
    const newSlug = generateSlug(data.title);
    const existingCategory = await ServiceCategory.findOne({
      slug: newSlug,
      _id: { $ne: category._id },
    });
    if (existingCategory) {
      throw new Error('A service category with this title already exists');
    }
    (data as any).slug = newSlug;
  }

  // Handle subServices array update
  if (data.subServices !== undefined) {
    if (data.subServices.length > 0) {
      (data as any).subServices = data.subServices.map((serviceId) => new mongoose.Types.ObjectId(serviceId));
    } else {
      (data as any).subServices = [];
    }
  }

  // Update category fields
  Object.assign(category, data);
  await category.save();

  // Populate subServices before returning
  await category.populate('subServices');

  return category.toObject() as unknown as ServiceCategoryResponse;
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  // Find category by id (try MongoDB _id, then slug, then id field)
  let category = null;
  
  if (mongoose.Types.ObjectId.isValid(id)) {
    category = await ServiceCategory.findById(id);
  }
  
  if (!category) {
    category = await ServiceCategory.findOne({
      $or: [
        { slug: id.toLowerCase() },
        { id: id.toLowerCase() },
      ],
    });
  }

  if (!category) {
    throw new Error('Service category not found');
  }

  // Check if category has services linked to it
  const linkedServicesCount = await Service.countDocuments({
    $or: [
      { category: category._id },
      { category: category._id.toString() },
      { subcategory: category._id },
      { subcategory: category._id.toString() },
      { category: category.slug },
      { category: category.id },
      { categoryName: { $regex: category.title, $options: 'i' } },
    ],
  });

  if (linkedServicesCount > 0) {
    throw new Error(
      `Cannot delete category: ${linkedServicesCount} service(s) are linked to this category. Please update or remove those services first.`
    );
  }

  // Delete the category
  await ServiceCategory.findByIdAndDelete(category._id);
};

