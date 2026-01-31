import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/service.service';
import { Service } from '../models/Service.model';
import { ServiceCategory } from '../models/ServiceCategory.model';
import mongoose from 'mongoose';

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await serviceService.getServices(req.query as any);
    res.status(200).json({
      success: true,
      data: result.services,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getServicesBySubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, subcategory } = req.params;
    const includeDrafts = req.query.includeDrafts === 'true';
    const statusFilter = includeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] };
    
    // First, verify the category exists (could be slug, id, or categoryType)
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
      
      if (categoriesByType.length > 0) {
        // Find the subcategory within categories of this type
        const subcategoryCategory = categoriesByType.find(
          (cat: any) => cat.slug?.toLowerCase() === subcategory.toLowerCase() || 
                       cat.id?.toLowerCase() === subcategory.toLowerCase()
        );
        
        if (subcategoryCategory) {
          // Found subcategory as a category - get all services in this subcategory category
          const categoryId = subcategoryCategory._id;
          const categoryIdString = categoryId.toString();
          
          // Find parent category (one with subServices) or create virtual parent
          const parentCategory = categoriesByType.find((cat: any) => 
            cat.subServices && Array.isArray(cat.subServices) && cat.subServices.length > 0
          ) || null;
          
          // Comprehensive query to find all services belonging to this subcategory category
          // Since category is Mixed type, we need to check all possible formats
          const queryConditions: any[] = [
            // Match by category field (as ObjectId string)
            { category: categoryIdString },
            // Match by category field (as ObjectId)
            { category: categoryId },
            // Match by category field (as new ObjectId)
            { category: new mongoose.Types.ObjectId(categoryIdString) },
            // Match by subcategory field (as ObjectId string)
            { subcategory: categoryIdString },
            // Match by subcategory field (as ObjectId)
            { subcategory: categoryId },
            // Match by subcategory field (as new ObjectId)
            { subcategory: new mongoose.Types.ObjectId(categoryIdString) },
            // Match by categoryName (for backward compatibility)
            { categoryName: { $regex: subcategoryCategory.title, $options: 'i' } },
            // Match by slug/id in category field (if stored as string)
            { category: subcategoryCategory.slug },
            { category: subcategoryCategory.id },
            // Also try matching with string representation variations
            { category: subcategoryCategory.slug.toLowerCase() },
            { category: subcategoryCategory.id.toLowerCase() },
            // IMPORTANT: Handle services with category as categoryType string (e.g., "ipo")
            // AND check if they should belong to this subcategory based on slug pattern
            // This handles the case where services have category: "ipo" but no subcategory link
            // CRITICAL: Only match services that DON'T have a subcategory field set
            // This prevents services with explicit subcategory from appearing in multiple subcategories
            {
              $and: [
                { category: subcategoryCategory.categoryType }, // category is "banking-finance" (string)
                // Only match if subcategory field is missing, null, or empty (legacy services)
                { $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] },
                {
                  $or: [
                    // Try to match by slug containing subcategory keywords
                    { slug: { $regex: subcategoryCategory.slug.replace(/-/g, '[-_]?'), $options: 'i' } },
                    { slug: { $regex: subcategoryCategory.id.replace(/-/g, '[-_]?'), $options: 'i' } },
                    // Match by title containing subcategory keywords
                    { title: { $regex: subcategoryCategory.title.split(' ').join('|'), $options: 'i' } },
                  ],
                },
              ],
            },
          ];
          
          // Try to find services with a more flexible query
          let services = await Service.find({
            ...statusFilter,
            $or: queryConditions,
          })
            .populate('relatedServices', '_id slug title shortDescription')
            .sort({ createdAt: -1 })
            .lean();
          
          // If no services found, try a more aggressive search
          // Check if category field might be stored as a string that contains the ID
          if (services.length === 0) {
            // Try finding by checking if category field contains the ID in any form
            services = await Service.find({
              ...statusFilter,
              $or: [
                { $expr: { $eq: [{ $toString: '$category' }, categoryIdString] } },
                { $expr: { $eq: [{ $toString: '$subcategory' }, categoryIdString] } },
                { category: { $regex: categoryIdString.replace(/^0+/, ''), $options: 'i' } },
                { subcategory: { $regex: categoryIdString.replace(/^0+/, ''), $options: 'i' } },
              ],
            })
              .populate('relatedServices', '_id slug title shortDescription')
              .sort({ createdAt: -1 })
              .lean();
          }
          
          // If still no services, try to find by checking all services and filtering in memory
          // This is a fallback for edge cases
          if (services.length === 0) {
            const allServices = await Service.find({
              ...statusFilter,
            })
              .populate('relatedServices', '_id slug title shortDescription')
              .sort({ createdAt: -1 })
              .lean();
            
            services = allServices.filter((service: any) => {
              const serviceCategory = service.category?.toString() || service.category || '';
              const serviceSubcategory = service.subcategory?.toString() || service.subcategory || '';
              
              // Normalize all values for comparison
              const normalizedCategoryId = categoryIdString.toLowerCase().trim();
              const normalizedServiceCategory = String(serviceCategory).toLowerCase().trim();
              const normalizedServiceSubcategory = String(serviceSubcategory).toLowerCase().trim();
              
              // Also check if category/subcategory is an ObjectId that matches
              let categoryMatches = false;
              let subcategoryMatches = false;
              
              if (service.category) {
                try {
                  const catId = typeof service.category === 'object' && service.category.toString 
                    ? service.category.toString() 
                    : String(service.category);
                  categoryMatches = catId.toLowerCase().trim() === normalizedCategoryId;
                } catch (e) {
                  categoryMatches = normalizedServiceCategory === normalizedCategoryId;
                }
              }
              
              if (service.subcategory) {
                try {
                  const subId = typeof service.subcategory === 'object' && service.subcategory.toString 
                    ? service.subcategory.toString() 
                    : String(service.subcategory);
                  subcategoryMatches = subId.toLowerCase().trim() === normalizedCategoryId;
                } catch (e) {
                  subcategoryMatches = normalizedServiceSubcategory === normalizedCategoryId;
                }
              }
              
              // IMPORTANT: Handle services with category as categoryType string (e.g., "ipo")
              // Check if service has category: "ipo" (string) and try to match to subcategory
              const hasCategoryTypeString = normalizedServiceCategory === subcategoryCategory.categoryType?.toLowerCase();
              let matchesSubcategoryByContent = false;
              
              if (hasCategoryTypeString && !categoryMatches && !subcategoryMatches) {
                // Service has category: "ipo" but not linked to subcategory
                // Try to match by slug/title keywords
                const subcategorySlug = subcategoryCategory.slug?.toLowerCase() || '';
                const subcategoryId = subcategoryCategory.id?.toLowerCase() || '';
                const subcategoryTitle = subcategoryCategory.title?.toLowerCase() || '';
                const serviceSlug = service.slug?.toLowerCase() || '';
                const serviceTitle = service.title?.toLowerCase() || '';
                
                // Extract keywords from subcategory (e.g., "financial-due-diligence" -> ["financial", "due", "diligence"])
                const subcategoryKeywords = [
                  ...subcategorySlug.split('-'),
                  ...subcategoryId.split('-'),
                  ...subcategoryTitle.split(' '),
                ].filter(k => k.length > 2); // Only meaningful keywords
                
                // Check if service slug/title contains subcategory keywords
                matchesSubcategoryByContent = subcategoryKeywords.some(keyword => 
                  serviceSlug.includes(keyword) || serviceTitle.includes(keyword)
                );
              }
              
              return (
                categoryMatches ||
                subcategoryMatches ||
                normalizedServiceCategory === normalizedCategoryId ||
                normalizedServiceSubcategory === normalizedCategoryId ||
                service.categoryName?.toLowerCase() === subcategoryCategory.title.toLowerCase() ||
                service.categoryName?.toLowerCase() === subcategoryCategory.slug?.toLowerCase() ||
                service.categoryName?.toLowerCase() === subcategoryCategory.id?.toLowerCase() ||
                matchesSubcategoryByContent
              );
            });
          }
          
          const transformedServices = services.map((service: any) => ({
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
            category: parentCategory ? parentCategory._id.toString() : categoryIdString,
            categoryInfo: parentCategory ? {
              _id: parentCategory._id.toString(),
              id: parentCategory.id,
              slug: parentCategory.slug,
              title: parentCategory.title,
              categoryType: parentCategory.categoryType,
            } : {
              _id: `virtual-${category.toLowerCase()}`,
              id: category.toLowerCase(),
              slug: category.toLowerCase(),
              title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
              categoryType: category.toLowerCase(),
            },
            subcategory: categoryIdString,
            subcategoryInfo: {
              _id: categoryIdString,
              id: subcategoryCategory.id,
              slug: subcategoryCategory.slug,
              title: subcategoryCategory.title,
            },
          }));
          
          // Get subcategories count for parent category
          const parentSubcategoriesCount = parentCategory 
            ? (parentCategory.subServices ? (parentCategory.subServices as any[]).length : 0)
            : categoriesByType.length; // If no parent, count all categories of this type
          
          res.status(200).json({
            success: true,
            data: transformedServices,
            category: parentCategory ? {
              _id: parentCategory._id.toString(),
              id: parentCategory.id,
              slug: parentCategory.slug,
              title: parentCategory.title,
              categoryType: parentCategory.categoryType,
              itemsCount: parentSubcategoriesCount,
            } : {
              _id: `virtual-${category.toLowerCase()}`,
              id: category.toLowerCase(),
              slug: category.toLowerCase(),
              title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
              categoryType: category.toLowerCase(),
              itemsCount: parentSubcategoriesCount,
            },
            subcategory: {
              _id: categoryIdString,
              id: subcategoryCategory.id,
              slug: subcategoryCategory.slug,
              title: subcategoryCategory.title,
              description: subcategoryCategory.description || '',
              iconName: subcategoryCategory.iconName,
              heroTitle: subcategoryCategory.heroTitle,
              heroDescription: subcategoryCategory.heroDescription,
              categoryType: subcategoryCategory.categoryType,
              itemsCount: transformedServices.length, // Number of services in this subcategory
            },
          });
          return;
        } else {
          // Check if subcategory is a service in subServices
          for (const cat of categoriesByType) {
            const subServices = (cat.subServices || []) as any[];
            const subcategoryService = subServices.find(
              (sub: any) => sub.slug?.toLowerCase() === subcategory.toLowerCase()
            );
            
            if (subcategoryService) {
              // Found subcategory service - get all services with this subcategory
              const services = await Service.find({
                $or: [
                  { subcategory: subcategoryService._id.toString() },
                  { subcategory: subcategoryService._id },
                  { _id: subcategoryService._id }, // Include the subcategory service itself
                ],
              })
                .populate('relatedServices', '_id slug title shortDescription')
                .sort({ createdAt: -1 })
                .lean();
              
              const transformedServices = services.map((service: any) => ({
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
                category: cat._id.toString(),
                categoryInfo: {
                  _id: cat._id.toString(),
                  id: cat.id,
                  slug: cat.slug,
                  title: cat.title,
                  categoryType: cat.categoryType,
                },
                subcategory: subcategoryService._id.toString(),
                subcategoryInfo: {
                  _id: subcategoryService._id.toString(),
                  slug: subcategoryService.slug,
                  title: subcategoryService.title,
                },
              }));
              
              // Get subcategories count for parent category
              const parentSubcategoriesCount = cat.subServices 
                ? (cat.subServices as any[]).length 
                : 0;
              
              res.status(200).json({
                success: true,
                data: transformedServices,
                category: {
                  _id: cat._id.toString(),
                  id: cat.id,
                  slug: cat.slug,
                  title: cat.title,
                  categoryType: cat.categoryType,
                  itemsCount: parentSubcategoriesCount, // Number of subcategories in parent
                },
                subcategory: {
                  _id: subcategoryService._id.toString(),
                  slug: subcategoryService.slug,
                  title: subcategoryService.title,
                  shortDescription: subcategoryService.shortDescription || '',
                  iconName: subcategoryService.iconName || '',
                  price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
                  duration: subcategoryService.duration || '',
                  itemsCount: transformedServices.length, // Number of services in this subcategory
                },
              });
              return;
            }
          }
          
          // No subcategory found in categories of this type
          // Check if any of these categories have subcategories
          const hasAnySubcategories = categoriesByType.some((cat: any) => 
            cat.subServices && Array.isArray(cat.subServices) && cat.subServices.length > 0
          );
          
          if (!hasAnySubcategories) {
            // None of the categories have subcategories, treat this as a service slug
            req.params.slug = subcategory;
            return getServiceBySlug(req, res, next);
          }
          
          res.status(404).json({
            success: false,
            message: 'Subcategory not found',
          });
          return;
        }
      }
    }
    
    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }
    
    // Check if subcategory is a category (subcategory category) or a service (in subServices)
    const subcategoryCategory = await ServiceCategory.findOne({
      $or: [
        { slug: subcategory.toLowerCase() },
        { id: subcategory.toLowerCase() },
      ],
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();
    
    if (subcategoryCategory) {
      // Subcategory is a category - get all services in this subcategory category
      const categoryId = subcategoryCategory._id;
      const categoryIdString = categoryId.toString();
      
      // Comprehensive query to find all services belonging to this subcategory category
      // Since category is Mixed type, we need to check all possible formats
      const queryConditions: any[] = [
        // Match by category field (as ObjectId string)
        { category: categoryIdString },
        // Match by category field (as ObjectId)
        { category: categoryId },
        // Match by category field (as new ObjectId)
        { category: new mongoose.Types.ObjectId(categoryIdString) },
        // Match by subcategory field (as ObjectId string)
        { subcategory: categoryIdString },
        // Match by subcategory field (as ObjectId)
        { subcategory: categoryId },
        // Match by subcategory field (as new ObjectId)
        { subcategory: new mongoose.Types.ObjectId(categoryIdString) },
        // Match by categoryName (for backward compatibility)
        { categoryName: { $regex: subcategoryCategory.title, $options: 'i' } },
        // Match by slug/id in category field (if stored as string)
        { category: subcategoryCategory.slug },
        { category: subcategoryCategory.id },
        // Also try matching with string representation variations
        { category: subcategoryCategory.slug.toLowerCase() },
        { category: subcategoryCategory.id.toLowerCase() },
        // IMPORTANT: Handle services with category as categoryType string (e.g., "ipo")
        // AND check if they should belong to this subcategory based on slug pattern
        // This handles the case where services have category: "ipo" but no subcategory link
        // CRITICAL: Only match services that DON'T have a subcategory field set
        // This prevents services with explicit subcategory from appearing in multiple subcategories
        {
          $and: [
            { category: subcategoryCategory.categoryType }, // category is "banking-finance" (string)
            // Only match if subcategory field is missing, null, or empty (legacy services)
            { $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] },
            {
              $or: [
                // Try to match by slug containing subcategory keywords
                { slug: { $regex: subcategoryCategory.slug.replace(/-/g, '[-_]?'), $options: 'i' } },
                { slug: { $regex: subcategoryCategory.id.replace(/-/g, '[-_]?'), $options: 'i' } },
                // Match by title containing subcategory keywords
                { title: { $regex: subcategoryCategory.title.split(' ').join('|'), $options: 'i' } },
              ],
            },
          ],
        },
      ];
      
      // Try to find services with a more flexible query
      let services = await Service.find({
        $or: queryConditions,
      })
        .populate('relatedServices', '_id slug title shortDescription')
        .sort({ createdAt: -1 })
        .lean();
      
      // If no services found, try a more aggressive search
      if (services.length === 0) {
        // Try finding by checking if category field contains the ID in any form
        services = await Service.find({
          $or: [
            { $expr: { $eq: [{ $toString: '$category' }, categoryIdString] } },
            { $expr: { $eq: [{ $toString: '$subcategory' }, categoryIdString] } },
            { category: { $regex: categoryIdString.replace(/^0+/, ''), $options: 'i' } },
            { subcategory: { $regex: categoryIdString.replace(/^0+/, ''), $options: 'i' } },
          ],
        })
          .populate('relatedServices', '_id slug title shortDescription')
          .sort({ createdAt: -1 })
          .lean();
      }
      
      // If still no services, try to find by checking all services and filtering in memory
      // This handles edge cases where the category field format doesn't match standard queries
      if (services.length === 0) {
        const allServices = await Service.find({})
          .populate('relatedServices', '_id slug title shortDescription')
          .sort({ createdAt: -1 })
          .lean();
        
        services = allServices.filter((service: any) => {
          const serviceCategory = service.category?.toString() || service.category || '';
          const serviceSubcategory = service.subcategory?.toString() || service.subcategory || '';
          
          // Normalize all values for comparison
          const normalizedCategoryId = categoryIdString.toLowerCase().trim();
          const normalizedServiceCategory = String(serviceCategory).toLowerCase().trim();
          const normalizedServiceSubcategory = String(serviceSubcategory).toLowerCase().trim();
          
          // Also check if category/subcategory is an ObjectId that matches
          let categoryMatches = false;
          let subcategoryMatches = false;
          
          if (service.category) {
            try {
              const catId = typeof service.category === 'object' && service.category.toString 
                ? service.category.toString() 
                : String(service.category);
              categoryMatches = catId.toLowerCase().trim() === normalizedCategoryId;
            } catch (e) {
              categoryMatches = normalizedServiceCategory === normalizedCategoryId;
            }
          }
          
          if (service.subcategory) {
            try {
              const subId = typeof service.subcategory === 'object' && service.subcategory.toString 
                ? service.subcategory.toString() 
                : String(service.subcategory);
              subcategoryMatches = subId.toLowerCase().trim() === normalizedCategoryId;
            } catch (e) {
              subcategoryMatches = normalizedServiceSubcategory === normalizedCategoryId;
            }
          }
          
          // IMPORTANT: Handle services with category as categoryType string (e.g., "ipo")
          // Check if service has category: "ipo" (string) and try to match to subcategory
          const hasCategoryTypeString = normalizedServiceCategory === subcategoryCategory.categoryType?.toLowerCase();
          let matchesSubcategoryByContent = false;
          
          if (hasCategoryTypeString && !categoryMatches && !subcategoryMatches) {
            // Service has category: "ipo" but not linked to subcategory
            // Try to match by slug/title keywords
            const subcategorySlug = subcategoryCategory.slug?.toLowerCase() || '';
            const subcategoryId = subcategoryCategory.id?.toLowerCase() || '';
            const subcategoryTitle = subcategoryCategory.title?.toLowerCase() || '';
            const serviceSlug = service.slug?.toLowerCase() || '';
            const serviceTitle = service.title?.toLowerCase() || '';
            
            // Extract keywords from subcategory (e.g., "financial-due-diligence" -> ["financial", "due", "diligence"])
            const subcategoryKeywords = [
              ...subcategorySlug.split('-'),
              ...subcategoryId.split('-'),
              ...subcategoryTitle.split(' '),
            ].filter(k => k.length > 2); // Only meaningful keywords
            
            // Check if service slug/title contains subcategory keywords
            matchesSubcategoryByContent = subcategoryKeywords.some(keyword => 
              serviceSlug.includes(keyword) || serviceTitle.includes(keyword)
            );
          }
          
          return (
            categoryMatches ||
            subcategoryMatches ||
            normalizedServiceCategory === normalizedCategoryId ||
            normalizedServiceSubcategory === normalizedCategoryId ||
            service.categoryName?.toLowerCase() === subcategoryCategory.title.toLowerCase() ||
            service.categoryName?.toLowerCase() === subcategoryCategory.slug?.toLowerCase() ||
            service.categoryName?.toLowerCase() === subcategoryCategory.id?.toLowerCase() ||
            matchesSubcategoryByContent
          );
        });
      }
      
      const transformedServices = services.map((service: any) => ({
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
        category: categoryDoc._id.toString(),
        categoryInfo: {
          _id: categoryDoc._id.toString(),
          id: categoryDoc.id,
          slug: categoryDoc.slug,
          title: categoryDoc.title,
          categoryType: categoryDoc.categoryType,
        },
        subcategory: categoryIdString,
        subcategoryInfo: {
          _id: categoryIdString,
          id: subcategoryCategory.id,
          slug: subcategoryCategory.slug,
          title: subcategoryCategory.title,
        },
      }));
      
      // Get subcategories count for parent category
      const parentSubcategoriesCount = categoryDoc.subServices 
        ? (categoryDoc.subServices as any[]).length 
        : 0;
      
      res.status(200).json({
        success: true,
        data: transformedServices,
        category: {
          _id: categoryDoc._id.toString(),
          id: categoryDoc.id,
          slug: categoryDoc.slug,
          title: categoryDoc.title,
          categoryType: categoryDoc.categoryType,
          itemsCount: parentSubcategoriesCount, // Number of subcategories in parent
        },
        subcategory: {
          _id: categoryIdString,
          id: subcategoryCategory.id,
          slug: subcategoryCategory.slug,
          title: subcategoryCategory.title,
          description: subcategoryCategory.description || '',
          iconName: subcategoryCategory.iconName,
          heroTitle: subcategoryCategory.heroTitle,
          heroDescription: subcategoryCategory.heroDescription,
          categoryType: subcategoryCategory.categoryType,
          itemsCount: transformedServices.length, // Number of services in this subcategory
        },
      });
      return;
    }
    
    // Check if category has subcategories - if not, treat this as a service slug request
    const hasSubcategories = categoryDoc.subServices && Array.isArray(categoryDoc.subServices) && categoryDoc.subServices.length > 0;
    
    if (!hasSubcategories) {
      // Category doesn't have subcategories, so treat this as a service slug
      // Redirect to getServiceBySlug handler
      req.params.slug = subcategory;
      return getServiceBySlug(req, res, next);
    }
    
    // Check if subcategory is a service in the category's subServices
    const subServices = (categoryDoc.subServices || []) as any[];
    const subcategoryService = subServices.find(
      (sub: any) => sub.slug?.toLowerCase() === subcategory.toLowerCase()
    );
    
    if (subcategoryService) {
      // Subcategory is a service - get all services with this subcategory
      const subcategoryId = subcategoryService._id.toString();
      
      const services = await Service.find({
        $or: [
          { subcategory: subcategoryId },
          { subcategory: subcategoryService._id },
          { _id: subcategoryService._id }, // Include the subcategory service itself
        ],
      })
        .populate('relatedServices', '_id slug title shortDescription')
        .sort({ createdAt: -1 })
        .lean();
      
      const transformedServices = services.map((service: any) => ({
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
        category: categoryDoc._id.toString(),
        categoryInfo: {
          _id: categoryDoc._id.toString(),
          id: categoryDoc.id,
          slug: categoryDoc.slug,
          title: categoryDoc.title,
          categoryType: categoryDoc.categoryType,
        },
        subcategory: subcategoryId,
        subcategoryInfo: {
          _id: subcategoryId,
          slug: subcategoryService.slug,
          title: subcategoryService.title,
        },
      }));
      
      // Get subcategories count for parent category
      const parentSubcategoriesCount = categoryDoc.subServices 
        ? (categoryDoc.subServices as any[]).length 
        : 0;
      
      res.status(200).json({
        success: true,
        data: transformedServices,
        category: {
          _id: categoryDoc._id.toString(),
          id: categoryDoc.id,
          slug: categoryDoc.slug,
          title: categoryDoc.title,
          categoryType: categoryDoc.categoryType,
          itemsCount: parentSubcategoriesCount, // Number of subcategories in parent
        },
        subcategory: {
          _id: subcategoryId,
          slug: subcategoryService.slug,
          title: subcategoryService.title,
          shortDescription: subcategoryService.shortDescription || '',
          iconName: subcategoryService.iconName || '',
          price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
          duration: subcategoryService.duration || '',
          itemsCount: transformedServices.length, // Number of services in this subcategory
        },
      });
      return;
    }
    
    res.status(404).json({
      success: false,
      message: 'Subcategory not found',
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceBySubcategorySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, subcategory, slug } = req.params;
    
    // First, verify the category exists and get it with subServices populated
    // Try by slug/id first, then by categoryType
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
      
      if (categoriesByType.length > 0) {
        // Find the parent category (one with subServices) or use the first one
        categoryDoc = categoriesByType.find((cat: any) => 
          cat.subServices && Array.isArray(cat.subServices) && cat.subServices.length > 0
        ) || categoriesByType[0];
      }
    }

    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // Find the subcategory - it could be:
    // 1. A Service in the category's subServices array
    // 2. A ServiceCategory itself (subcategory category)
    let subcategoryService: any = null;
    let subcategoryCategory: any = null;
    
    // First, check if subcategory is a ServiceCategory
    subcategoryCategory = await ServiceCategory.findOne({
      $or: [
        { slug: subcategory.toLowerCase() },
        { id: subcategory.toLowerCase() },
      ],
    }).lean();
    
    // If found as a category, verify it belongs to the parent category type
    if (subcategoryCategory) {
      if (subcategoryCategory.categoryType === category.toLowerCase() || 
          (categoryDoc && subcategoryCategory.categoryType === categoryDoc.categoryType)) {
        // This is a valid subcategory category
        // Now find the service within this subcategory category
      } else {
        subcategoryCategory = null; // Not a valid subcategory for this category
      }
    }
    
    // If not found as a category, check if it's a Service in subServices
    if (!subcategoryCategory) {
      const subcategoryServices = (categoryDoc.subServices || []) as any[];
      subcategoryService = subcategoryServices.find(
        (sub: any) => sub.slug?.toLowerCase() === subcategory.toLowerCase()
      );

      // If not found in the main category, search in all categories of the same type
      if (!subcategoryService && categoriesByType.length > 0) {
        for (const cat of categoriesByType) {
          const subServices = (cat.subServices || []) as any[];
          const found = subServices.find(
            (sub: any) => sub.slug?.toLowerCase() === subcategory.toLowerCase()
          );
          if (found) {
            subcategoryService = found;
            categoryDoc = cat; // Update categoryDoc to the one containing the subcategory
            break;
          }
        }
      }
    }

    // If still not found, try to find it as a ServiceCategory in all categories of the type
    if (!subcategoryCategory && !subcategoryService && categoriesByType.length > 0) {
      for (const cat of categoriesByType) {
        if (cat.slug?.toLowerCase() === subcategory.toLowerCase() || 
            cat.id?.toLowerCase() === subcategory.toLowerCase()) {
          subcategoryCategory = cat;
          break;
        }
      }
    }

    if (!subcategoryService && !subcategoryCategory) {
      res.status(404).json({
        success: false,
        message: 'Subcategory not found in the specified category',
      });
      return;
    }

    // Determine the subcategory ID for querying
    const subcategoryId = subcategoryCategory 
      ? subcategoryCategory._id.toString() 
      : subcategoryService._id.toString();
    
    // Build comprehensive query to find service by slug AND verify it belongs to subcategory
    // This is more reliable than finding by slug first and then validating
    let service: any = null;
    
    if (subcategoryCategory) {
      // Subcategory is a category - find service by slug that belongs to this subcategory category
      const categoryId = subcategoryCategory._id;
      const categoryIdString = categoryId.toString();
      
      // Comprehensive query to find service by slug AND belonging to subcategory
      const serviceQuery: any = {
        slug: slug.toLowerCase(),
        $or: [
          // Match by category field (as ObjectId string)
          { category: categoryIdString },
          // Match by category field (as ObjectId)
          { category: categoryId },
          // Match by category field (as new ObjectId)
          { category: new mongoose.Types.ObjectId(categoryIdString) },
          // Match by subcategory field (as ObjectId string)
          { subcategory: categoryIdString },
          // Match by subcategory field (as ObjectId)
          { subcategory: categoryId },
          // Match by subcategory field (as new ObjectId)
          { subcategory: new mongoose.Types.ObjectId(categoryIdString) },
          // Match by categoryName (for backward compatibility)
          { categoryName: { $regex: subcategoryCategory.title, $options: 'i' } },
          // Match by slug/id in category field (if stored as string)
          { category: subcategoryCategory.slug },
          { category: subcategoryCategory.id },
          // Also try matching with string representation variations
          { category: subcategoryCategory.slug.toLowerCase() },
          { category: subcategoryCategory.id.toLowerCase() },
          // Match categoryType string (e.g., "banking-finance", "ipo")
          { category: subcategoryCategory.categoryType?.toLowerCase() },
        ],
      };
      
      // If subcategory has categoryType, also check if service has category as that type
      if (subcategoryCategory.categoryType) {
        serviceQuery.$or.push(
          { category: subcategoryCategory.categoryType.toLowerCase() }
        );
      }
      
      service = await Service.findOne(serviceQuery)
        .populate('relatedServices', '_id slug title shortDescription')
        .lean();
      
      // If not found with strict query, try finding by slug only and validate
      if (!service) {
        const serviceBySlug: any = await serviceService.getServiceBySlug(slug, subcategoryCategory.slug);
        
        // Validate it belongs to this subcategory
        const serviceCategoryId = serviceBySlug.category?.toString() || serviceBySlug.categoryInfo?._id || '';
        const serviceCategoryRaw = serviceBySlug.category;
        const serviceSubcategoryValue = serviceBySlug.subcategory?.toString() || serviceBySlug.subcategoryInfo?._id || '';
        
        // Check if it matches
        if (serviceCategoryId === categoryIdString || 
            serviceSubcategoryValue === categoryIdString ||
            (typeof serviceCategoryRaw === 'string' && 
             serviceCategoryRaw.toLowerCase() === subcategoryCategory.categoryType?.toLowerCase())) {
          service = serviceBySlug;
        }
      }
    } else {
      // Subcategory is a service - find the requested service
      service = await serviceService.getServiceBySlug(slug, category);
      
      // Verify it's related to the subcategory service
      const serviceSubcategoryValue = service.subcategory?.toString() || service.subcategoryInfo?._id || '';
      if (serviceSubcategoryValue !== subcategoryId && service._id.toString() !== subcategoryId) {
        service = null;
      }
    }
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found in the specified subcategory',
      });
      return;
    }

    // Build response with category and subcategory information
    const response: any = {
      success: true,
      data: service,
    };

    // Include category information
    if (service.categoryInfo) {
      response.category = service.categoryInfo;
    }

    // Get items count for subcategory
    let subcategoryItemsCount = 0;
    if (subcategoryCategory) {
      const categoryId = subcategoryCategory._id;
      const categoryIdString = categoryId.toString();
      
      subcategoryItemsCount = await Service.countDocuments({
        $or: [
          { category: categoryIdString },
          { category: categoryId },
          { category: new mongoose.Types.ObjectId(categoryIdString) },
          { subcategory: categoryIdString },
          { subcategory: categoryId },
          { subcategory: new mongoose.Types.ObjectId(categoryIdString) },
          { categoryName: { $regex: subcategoryCategory.title, $options: 'i' } },
          { category: subcategoryCategory.slug },
          { category: subcategoryCategory.id },
          { category: subcategoryCategory.slug.toLowerCase() },
          { category: subcategoryCategory.id.toLowerCase() },
          ...(subcategoryCategory.categoryType ? [{ category: subcategoryCategory.categoryType.toLowerCase() }] : []),
        ],
      });
    } else if (subcategoryService) {
      subcategoryItemsCount = await Service.countDocuments({
        $or: [
          { subcategory: subcategoryService._id.toString() },
          { subcategory: subcategoryService._id },
          { _id: subcategoryService._id },
        ],
      });
    }
    
    // Get items count for category if available
    if (response.category) {
      const categoryDocForCount = await ServiceCategory.findById(response.category._id).lean();
      if (categoryDocForCount) {
        const parentSubcategoriesCount = categoryDocForCount.subServices ? (categoryDocForCount.subServices as any[]).length : 0;
        response.category.hasSubcategories = parentSubcategoriesCount > 0;
        response.category.itemsCount = parentSubcategoriesCount;
      }
    } else if (categoryDoc) {
      // If no category in service, use the categoryDoc we found
      const parentSubcategoriesCount = categoryDoc.subServices ? (categoryDoc.subServices as any[]).length : 0;
      response.category = {
        _id: categoryDoc._id.toString(),
        id: categoryDoc.id,
        slug: categoryDoc.slug,
        title: categoryDoc.title,
        categoryType: categoryDoc.categoryType,
        hasSubcategories: parentSubcategoriesCount > 0,
        itemsCount: parentSubcategoriesCount,
      };
    }
    
    // Include subcategory information
    if (subcategoryCategory) {
      // Subcategory is a category
      response.subcategory = {
        _id: subcategoryCategory._id.toString(),
        id: subcategoryCategory.id,
        slug: subcategoryCategory.slug,
        title: subcategoryCategory.title,
        description: subcategoryCategory.description || '',
        iconName: subcategoryCategory.iconName || '',
        heroTitle: subcategoryCategory.heroTitle || '',
        heroDescription: subcategoryCategory.heroDescription || '',
        categoryType: subcategoryCategory.categoryType,
        itemsCount: subcategoryItemsCount,
      };
    } else if (subcategoryService) {
      // Subcategory is a service
      response.subcategory = {
        _id: subcategoryService._id.toString(),
        slug: subcategoryService.slug,
        title: subcategoryService.title,
        shortDescription: subcategoryService.shortDescription || '',
        iconName: subcategoryService.iconName || '',
        price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
        duration: subcategoryService.duration || '',
        itemsCount: subcategoryItemsCount,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug, category } = req.params;
    
    // First, try to find the category (could be slug, id, or categoryType)
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
      
      if (categoriesByType.length > 0) {
        // Check if slug matches a category (subcategory) within this categoryType
        const subcategoryCategory = categoriesByType.find(
          (cat: any) => cat.slug?.toLowerCase() === slug.toLowerCase() || 
                       cat.id?.toLowerCase() === slug.toLowerCase()
        );
        
        if (subcategoryCategory) {
          // Found! This is a subcategory category - return it with its services
          const categoryId = subcategoryCategory._id;
          const categoryIdString = categoryId.toString();
          
          // First, check if category has subServices (these are the items/services for this subcategory)
          const subServices = (subcategoryCategory.subServices || []) as any[];
          let services: any[] = [];
          
          if (subServices.length > 0) {
            // Use the subServices directly - these are the services/items for this subcategory
            services = subServices.map((sub: any) => {
              if (typeof sub === 'object' && sub._id) {
                // Already populated
                return sub;
              } else {
                // Need to fetch the service
                return null;
              }
            }).filter(Boolean);
            
            // If subServices are ObjectIds, fetch them
            if (services.length === 0 && subServices.length > 0) {
              const serviceIds = subServices.map((sub: any) => 
                typeof sub === 'object' ? sub._id : sub
              );
              services = await Service.find({
                _id: { $in: serviceIds },
              })
                .populate('relatedServices', '_id slug title shortDescription')
                .sort({ createdAt: -1 })
                .lean();
            }
          } else {
            // No subServices, find services by category field
            services = await Service.find({
              $or: [
                { category: categoryIdString }, // Match string ObjectId (primary)
                { category: categoryId }, // Match ObjectId
                { category: new mongoose.Types.ObjectId(categoryIdString) }, // Match as ObjectId
                { subcategory: categoryIdString }, // Also check subcategory field
                { subcategory: categoryId }, // Match subcategory as ObjectId
                { categoryName: { $regex: subcategoryCategory.title, $options: 'i' } }, // Match by category name
              ],
            })
              .populate('relatedServices', '_id slug title shortDescription')
              .sort({ createdAt: -1 })
              .lean();
          }
          
          const transformedServices = services.map((service: any) => ({
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
            category: subcategoryCategory._id.toString(),
            categoryInfo: {
              _id: subcategoryCategory._id.toString(),
              id: subcategoryCategory.id,
              slug: subcategoryCategory.slug,
              title: subcategoryCategory.title,
              categoryType: subcategoryCategory.categoryType,
            },
          }));
          
          // Calculate itemsCount for subcategory
          const subcategoryItemsCount = transformedServices.length;
          const hasSubcategories = subcategoryCategory.subServices && subcategoryCategory.subServices.length > 0;
          
          const response: any = {
            success: true,
            data: transformedServices,
            category: {
              _id: subcategoryCategory._id.toString(),
              id: subcategoryCategory.id,
              slug: subcategoryCategory.slug,
              title: subcategoryCategory.title,
              description: subcategoryCategory.description,
              iconName: subcategoryCategory.iconName,
              heroTitle: subcategoryCategory.heroTitle,
              heroDescription: subcategoryCategory.heroDescription,
              categoryType: subcategoryCategory.categoryType,
              hasSubcategories,
              itemsCount: hasSubcategories ? (subcategoryCategory.subServices as any[]).length : subcategoryItemsCount,
            },
          };
          
          // Include subcategories if they exist
          if (hasSubcategories) {
            // Get items count for each subcategory
            const subcategoryPromises = (subcategoryCategory.subServices as any[]).map(async (sub: any) => {
              const subId = typeof sub === 'object' ? sub._id.toString() : sub.toString();
              const itemsCount = await Service.countDocuments({
                $or: [
                  { category: subId },
                  { subcategory: subId },
                ],
              });
              
              return {
                _id: typeof sub === 'object' ? sub._id.toString() : sub.toString(),
                slug: typeof sub === 'object' ? sub.slug : '',
                title: typeof sub === 'object' ? sub.title : '',
                shortDescription: typeof sub === 'object' ? (sub.shortDescription || '') : '',
                iconName: typeof sub === 'object' ? (sub.iconName || '') : '',
                price: typeof sub === 'object' ? (sub.price || { min: 0, max: 0, currency: 'INR' }) : { min: 0, max: 0, currency: 'INR' },
                duration: typeof sub === 'object' ? (sub.duration || '') : '',
                itemsCount,
              };
            });
            
            response.subcategories = await Promise.all(subcategoryPromises);
          }
          
          res.status(200).json(response);
          return;
        }
        
        // Check if slug matches a subcategory service in any of these categories
        for (const cat of categoriesByType) {
          const subcategoryServices = (cat.subServices || []) as any[];
          const subcategoryService = subcategoryServices.find(
            (sub: any) => sub.slug?.toLowerCase() === slug.toLowerCase()
          );
          
          if (subcategoryService) {
            // Found! This is a subcategory service
            // Get items count for category and subcategory
            const parentSubcategoriesCount = cat.subServices ? (cat.subServices as any[]).length : 0;
            const subcategoryItemsCount = await Service.countDocuments({
              $or: [
                { subcategory: subcategoryService._id.toString() },
                { subcategory: subcategoryService._id },
                { _id: subcategoryService._id },
              ],
            });
            
            const response: any = {
              success: true,
              data: {
                _id: subcategoryService._id.toString(),
                slug: subcategoryService.slug,
                title: subcategoryService.title,
                shortDescription: subcategoryService.shortDescription || '',
                longDescription: subcategoryService.longDescription || '',
                iconName: subcategoryService.iconName || '',
                price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
                duration: subcategoryService.duration || '',
                features: subcategoryService.features || [],
                benefits: subcategoryService.benefits || [],
                requirements: subcategoryService.requirements || [],
                process: subcategoryService.process || [],
                faqs: subcategoryService.faqs || [],
                relatedServices: subcategoryService.relatedServices || [],
                createdAt: subcategoryService.createdAt,
                updatedAt: subcategoryService.updatedAt,
                category: cat._id.toString(),
                categoryInfo: {
                  _id: cat._id.toString(),
                  id: cat.id,
                  slug: cat.slug,
                  title: cat.title,
                  description: cat.description,
                  iconName: cat.iconName,
                  heroTitle: cat.heroTitle,
                  heroDescription: cat.heroDescription,
                  categoryType: cat.categoryType,
                },
              },
              category: {
                _id: cat._id.toString(),
                id: cat.id,
                slug: cat.slug,
                title: cat.title,
                description: cat.description,
                iconName: cat.iconName,
                heroTitle: cat.heroTitle,
                heroDescription: cat.heroDescription,
                categoryType: cat.categoryType,
                hasSubcategories: parentSubcategoriesCount > 0,
                itemsCount: parentSubcategoriesCount,
              },
              subcategory: {
                _id: subcategoryService._id.toString(),
                slug: subcategoryService.slug,
                title: subcategoryService.title,
                shortDescription: subcategoryService.shortDescription || '',
                iconName: subcategoryService.iconName || '',
                price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
                duration: subcategoryService.duration || '',
                itemsCount: subcategoryItemsCount,
              },
            };
            
            res.status(200).json(response);
            return;
          }
        }
        
        // If no subcategory found, use first category as fallback
        categoryDoc = categoriesByType[0];
      }
    } else {
      // Category found by slug/id - check if slug is also a category (subcategory)
      const subcategoryCategory = await ServiceCategory.findOne({
        $or: [
          { slug: slug.toLowerCase() },
          { id: slug.toLowerCase() },
        ],
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
      
      if (subcategoryCategory) {
        // Slug is a category - return that category with its services
        const categoryId = subcategoryCategory._id;
        const categoryIdString = categoryId.toString();
        
        // First, check if category has subServices (these are the items/services for this subcategory)
        const subServices = (subcategoryCategory.subServices || []) as any[];
        let services: any[] = [];
        
        if (subServices.length > 0) {
          // Use the subServices directly - these are the services/items for this subcategory
          services = subServices.map((sub: any) => {
            if (typeof sub === 'object' && sub._id) {
              // Already populated
              return sub;
            } else {
              // Need to fetch the service
              return null;
            }
          }).filter(Boolean);
          
          // If subServices are ObjectIds, fetch them
          if (services.length === 0 && subServices.length > 0) {
            const serviceIds = subServices.map((sub: any) => 
              typeof sub === 'object' ? sub._id : sub
            );
            services = await Service.find({
              _id: { $in: serviceIds },
            })
              .populate('relatedServices', '_id slug title shortDescription')
              .sort({ createdAt: -1 })
              .lean();
          }
        } else {
          // No subServices, find services by category field
          services = await Service.find({
            $or: [
              { category: categoryIdString }, // Match string ObjectId (primary)
              { category: categoryId }, // Match ObjectId
              { category: new mongoose.Types.ObjectId(categoryIdString) }, // Match as ObjectId
              { subcategory: categoryIdString }, // Also check subcategory field
              { subcategory: categoryId }, // Match subcategory as ObjectId
              { categoryName: { $regex: subcategoryCategory.title, $options: 'i' } }, // Match by category name
            ],
          })
            .populate('relatedServices', '_id slug title shortDescription')
            .sort({ createdAt: -1 })
            .lean();
        }
        
        const transformedServices = services.map((service: any) => ({
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
          category: subcategoryCategory._id.toString(),
          categoryInfo: {
            _id: subcategoryCategory._id.toString(),
            id: subcategoryCategory.id,
            slug: subcategoryCategory.slug,
            title: subcategoryCategory.title,
            categoryType: subcategoryCategory.categoryType,
          },
        }));
        
        // Calculate itemsCount for subcategory
        const subcategoryItemsCount = transformedServices.length;
        const hasSubcategories = subcategoryCategory.subServices && subcategoryCategory.subServices.length > 0;
        
        // Build complete response with category details
        const response: any = {
          success: true,
          data: transformedServices,
          category: {
            _id: subcategoryCategory._id.toString(),
            id: subcategoryCategory.id,
            slug: subcategoryCategory.slug,
            title: subcategoryCategory.title,
            description: subcategoryCategory.description || '',
            iconName: subcategoryCategory.iconName,
            heroTitle: subcategoryCategory.heroTitle,
            heroDescription: subcategoryCategory.heroDescription,
            categoryType: subcategoryCategory.categoryType,
            createdAt: subcategoryCategory.createdAt,
            updatedAt: subcategoryCategory.updatedAt,
            hasSubcategories,
            itemsCount: hasSubcategories ? (subcategoryCategory.subServices as any[]).length : subcategoryItemsCount,
          },
        };
        
        // Include subcategories (subServices) if they exist
        // subServices are Services listed in this category's subServices array
        if (hasSubcategories) {
          // Get items count for each subcategory
          const subServicesArrayPromises = (subcategoryCategory.subServices as any[]).map(async (sub: any) => {
            const subId = typeof sub === 'object' ? sub._id.toString() : sub.toString();
            const itemsCount = await Service.countDocuments({
              $or: [
                { category: subId },
                { subcategory: subId },
              ],
            });
            
            if (typeof sub === 'object' && sub._id) {
              // Already populated
              return {
                _id: sub._id.toString(),
                slug: sub.slug,
                title: sub.title,
                shortDescription: sub.shortDescription || '',
                iconName: sub.iconName || '',
                price: sub.price || { min: 0, max: 0, currency: 'INR' },
                duration: sub.duration || '',
                itemsCount,
              };
            }
            return null;
          });
          
          const subServicesArray = (await Promise.all(subServicesArrayPromises)).filter(Boolean);
          if (subServicesArray.length > 0) {
            response.subcategories = subServicesArray;
          }
        }
        
        res.status(200).json(response);
        return;
      }
      
      // Check if slug is a subcategory service
      const subcategoryServices = (categoryDoc.subServices || []) as any[];
      const subcategoryService = subcategoryServices.find(
        (sub: any) => sub.slug?.toLowerCase() === slug.toLowerCase()
      );
      
      if (subcategoryService) {
        // This is a subcategory service - return it
        // Get items count for category and subcategory
        const parentSubcategoriesCount = categoryDoc.subServices ? (categoryDoc.subServices as any[]).length : 0;
        const subcategoryItemsCount = await Service.countDocuments({
          $or: [
            { subcategory: subcategoryService._id.toString() },
            { subcategory: subcategoryService._id },
            { _id: subcategoryService._id },
          ],
        });
        
        const response: any = {
          success: true,
          data: {
            _id: subcategoryService._id.toString(),
            slug: subcategoryService.slug,
            title: subcategoryService.title,
            shortDescription: subcategoryService.shortDescription || '',
            longDescription: subcategoryService.longDescription || '',
            iconName: subcategoryService.iconName || '',
            price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
            duration: subcategoryService.duration || '',
            features: subcategoryService.features || [],
            benefits: subcategoryService.benefits || [],
            requirements: subcategoryService.requirements || [],
            process: subcategoryService.process || [],
            faqs: subcategoryService.faqs || [],
            relatedServices: subcategoryService.relatedServices || [],
            createdAt: subcategoryService.createdAt,
            updatedAt: subcategoryService.updatedAt,
            category: categoryDoc._id.toString(),
            categoryInfo: {
              _id: categoryDoc._id.toString(),
              id: categoryDoc.id,
              slug: categoryDoc.slug,
              title: categoryDoc.title,
              description: categoryDoc.description,
              iconName: categoryDoc.iconName,
              heroTitle: categoryDoc.heroTitle,
              heroDescription: categoryDoc.heroDescription,
              categoryType: categoryDoc.categoryType,
            },
          },
          category: {
            _id: categoryDoc._id.toString(),
            id: categoryDoc.id,
            slug: categoryDoc.slug,
            title: categoryDoc.title,
            description: categoryDoc.description,
            iconName: categoryDoc.iconName,
            heroTitle: categoryDoc.heroTitle,
            heroDescription: categoryDoc.heroDescription,
            categoryType: categoryDoc.categoryType,
            hasSubcategories: parentSubcategoriesCount > 0,
            itemsCount: parentSubcategoriesCount,
          },
          subcategory: {
            _id: subcategoryService._id.toString(),
            slug: subcategoryService.slug,
            title: subcategoryService.title,
            shortDescription: subcategoryService.shortDescription || '',
            iconName: subcategoryService.iconName || '',
            price: subcategoryService.price || { min: 0, max: 0, currency: 'INR' },
            duration: subcategoryService.duration || '',
            itemsCount: subcategoryItemsCount,
          },
        };
        
        res.status(200).json(response);
        return;
      }
    }
    
    // If not a subcategory category or service, treat it as a regular service
    try {
      const service = await serviceService.getServiceBySlug(slug, category);
      
      // Verify category matches if provided
      if (category && categoryDoc) {
        const serviceAny = service as any;
        const serviceCategoryId = serviceAny.categoryInfo?._id || serviceAny.category?.toString() || '';
        const categoryId = categoryDoc._id.toString();
        
        // Check if category matches
        if (serviceCategoryId.toString() !== categoryId) {
          res.status(404).json({
            success: false,
            message: 'Service not found in the specified category',
          });
          return;
        }
      }

      // Build response
      const response: any = {
        success: true,
        data: service,
      };

      // Include category information if available
      const serviceAny = service as any;
      if (serviceAny.categoryInfo) {
        response.category = serviceAny.categoryInfo;
      }

      // Include subcategories if they exist
      if (service.subcategories && service.subcategories.length > 0) {
        response.subcategories = service.subcategories;
      }

      res.status(200).json(response);
    } catch (serviceError: any) {
      // If service not found, return appropriate error
      if (serviceError.message === 'Service not found') {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      } else {
        throw serviceError;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const getServicesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params;
    const includeDrafts = req.query.includeDrafts === 'true';
    const result = await serviceService.getServicesByCategory(category, includeDrafts);
    
    // Build response with category info and subcategories if available
    const response: any = {
      success: true,
      data: result.services,
    };

    // Include category information
    if (result.category) {
      response.category = result.category;
    }

    // Include subcategories if they exist
    if (result.subcategories && result.subcategories.length > 0) {
      response.subcategories = result.subcategories;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getServiceCategories = async (_req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await serviceService.getServiceCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceCategoryById = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = _req.params;
    const category = await serviceService.getServiceCategoryById(id);
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.createService(req.body);
    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createServiceDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.createServiceDraft(req.body);
    res.status(201).json({
      success: true,
      data: service,
      message: 'Service draft created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await serviceService.updateServiceDraft(id, req.body);
    res.status(200).json({
      success: true,
      data: service,
      message: 'Service draft updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceDraftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await serviceService.getServiceDraftById(id);
    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceDrafts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drafts = await serviceService.getServiceDrafts(req.query as any);
    res.status(200).json({
      success: true,
      data: drafts,
    });
  } catch (error) {
    next(error);
  }
};

export const publishServiceDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await serviceService.publishServiceDraft(id);
    res.status(200).json({
      success: true,
      data: service,
      message: 'Service published successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteServiceDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await serviceService.deleteServiceDraft(id);
    res.status(200).json({
      success: true,
      message: 'Service draft deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createServiceBySubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, subcategory, slug } = req.params;
    
    // Verify category exists (could be slug, id, or categoryType)
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    }).lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      }).lean();
      
      if (categoriesByType.length > 0) {
        // Find the parent category (one with subServices) or use the first one
        categoryDoc = categoriesByType.find((cat: any) => 
          cat.subServices && Array.isArray(cat.subServices) && cat.subServices.length > 0
        ) || categoriesByType[0];
      }
    }

    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // Verify subcategory exists
    let subcategoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: subcategory.toLowerCase() },
        { id: subcategory.toLowerCase() },
      ],
    }).lean();

    // If not found, check if it's a service in the category's subServices
    if (!subcategoryDoc && categoryDoc.subServices && categoryDoc.subServices.length > 0) {
      const subcategoryService = await Service.findById(categoryDoc.subServices[0]).lean();
      if (subcategoryService && subcategoryService.slug === subcategory.toLowerCase()) {
        // Subcategory is a service, not a category
        subcategoryDoc = null; // Will handle this case differently
      }
    }

    // If subcategory not found as category, check in all categories of the same type
    if (!subcategoryDoc && categoriesByType.length > 0) {
      subcategoryDoc = categoriesByType.find((cat: any) => 
        cat.slug?.toLowerCase() === subcategory.toLowerCase() || 
        cat.id?.toLowerCase() === subcategory.toLowerCase()
      ) || null;
    }

    if (!subcategoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
      return;
    }

    // Verify subcategory belongs to the category type
    if (subcategoryDoc.categoryType !== categoryDoc.categoryType && 
        subcategoryDoc.categoryType !== category.toLowerCase()) {
      res.status(400).json({
        success: false,
        message: 'Subcategory does not belong to the specified category',
      });
      return;
    }

    // Prepare service data with category and subcategory
    const serviceData = {
      ...req.body,
      slug: slug.toLowerCase(), // Use slug from params
      category: categoryDoc._id.toString(), // Use category ObjectId
      subcategory: subcategoryDoc._id.toString(), // Use subcategory ObjectId
    };

    // Check if service with this slug already exists
    const existingService = await Service.findOne({ slug: slug.toLowerCase() });
    if (existingService) {
      res.status(409).json({
        success: false,
        message: 'A service with this slug already exists',
      });
      return;
    }

    // Create the service
    const service = await serviceService.createService(serviceData as any);
    
    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully',
      category: {
        _id: categoryDoc._id.toString(),
        id: categoryDoc.id,
        slug: categoryDoc.slug,
        title: categoryDoc.title,
        categoryType: categoryDoc.categoryType,
      },
      subcategory: {
        _id: subcategoryDoc._id.toString(),
        id: subcategoryDoc.id,
        slug: subcategoryDoc.slug,
        title: subcategoryDoc.title,
        categoryType: subcategoryDoc.categoryType,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createServiceCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await serviceService.createServiceCategory(req.body);
    res.status(201).json({
      success: true,
      data: category,
      message: 'Service category created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await serviceService.updateService(id, req.body);
    res.status(200).json({
      success: true,
      data: service,
      message: 'Service updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await serviceService.deleteService(id);
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await serviceService.updateServiceCategory(id, req.body);
    res.status(200).json({
      success: true,
      data: category,
      message: 'Service category updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteServiceCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await serviceService.deleteServiceCategory(id);
    res.status(200).json({
      success: true,
      message: 'Service category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, slug } = req.params;
    
    // Verify category exists (could be slug, id, or categoryType)
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    }).lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      }).lean();
      
      if (categoriesByType.length > 0) {
        categoryDoc = categoriesByType[0]; // Use first category of this type
      }
    }

    // Find service by slug
    const service = await Service.findOne({ slug: slug.toLowerCase() }).lean();
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    // Verify service belongs to this category
    const serviceCategoryId = service.category?.toString() || service.category;
    const serviceCategoryValue = typeof service.category === 'string' ? service.category : serviceCategoryId;
    
    let belongsToCategory = false;
    
    if (categoryDoc) {
      const categoryIdString = categoryDoc._id.toString();
      belongsToCategory = 
        serviceCategoryId === categoryIdString ||
        serviceCategoryValue === categoryIdString ||
        serviceCategoryValue === categoryDoc.slug ||
        serviceCategoryValue === categoryDoc.id ||
        (typeof service.category === 'string' && service.category.toLowerCase() === category.toLowerCase());
    } else {
      // For categoryType queries, check if service has category as string matching categoryType
      belongsToCategory = typeof service.category === 'string' && 
                         service.category.toLowerCase() === category.toLowerCase();
    }

    if (!belongsToCategory) {
      res.status(404).json({
        success: false,
        message: 'Service not found in the specified category',
      });
      return;
    }

    // Update the service
    const updatedService = await serviceService.updateService(service._id.toString(), req.body);
    
    res.status(200).json({
      success: true,
      data: updatedService,
      message: 'Service updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteServiceByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, slug } = req.params;
    
    // Verify category exists (could be slug, id, or categoryType)
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    }).lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      }).lean();
      
      if (categoriesByType.length > 0) {
        categoryDoc = categoriesByType[0]; // Use first category of this type
      }
    }

    // Find service by slug
    const service = await Service.findOne({ slug: slug.toLowerCase() }).lean();
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    // Verify service belongs to this category
    const serviceCategoryId = service.category?.toString() || service.category;
    const serviceCategoryValue = typeof service.category === 'string' ? service.category : serviceCategoryId;
    
    let belongsToCategory = false;
    
    if (categoryDoc) {
      const categoryIdString = categoryDoc._id.toString();
      belongsToCategory = 
        serviceCategoryId === categoryIdString ||
        serviceCategoryValue === categoryIdString ||
        serviceCategoryValue === categoryDoc.slug ||
        serviceCategoryValue === categoryDoc.id ||
        (typeof service.category === 'string' && service.category.toLowerCase() === category.toLowerCase());
    } else {
      // For categoryType queries, check if service has category as string matching categoryType
      belongsToCategory = typeof service.category === 'string' && 
                         service.category.toLowerCase() === category.toLowerCase();
    }

    if (!belongsToCategory) {
      res.status(404).json({
        success: false,
        message: 'Service not found in the specified category',
      });
      return;
    }

    // Delete the service
    await serviceService.deleteService(service._id.toString());
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceBySubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, subcategory, slug } = req.params;
    
    // First, verify the category exists and get it with subServices populated
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
      
      if (categoriesByType.length > 0) {
        categoryDoc = categoriesByType.find((cat: any) => 
          cat.subServices && Array.isArray(cat.subServices) && cat.subServices.length > 0
        ) || categoriesByType[0];
      }
    }

    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // Find the subcategory - it could be a ServiceCategory itself (subcategory category)
    let subcategoryCategory: any = null;
    
    subcategoryCategory = await ServiceCategory.findOne({
      $or: [
        { slug: subcategory.toLowerCase() },
        { id: subcategory.toLowerCase() },
      ],
    }).lean();
    
    // If found as a category, verify it belongs to the parent category type
    if (subcategoryCategory) {
      if (subcategoryCategory.categoryType !== category.toLowerCase() && 
          categoryDoc.categoryType !== subcategoryCategory.categoryType) {
        subcategoryCategory = null; // Not a valid subcategory for this category
      }
    }

    // Find service by slug
    const service = await Service.findOne({ slug: slug.toLowerCase() }).lean();
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    // Verify the service is related to this subcategory
    let isValidService = false;
    
    if (subcategoryCategory) {
      // Subcategory is a category - service should belong to this category
      const serviceCategoryId = service.category?.toString() || (service as any).categoryInfo?._id || '';
      const serviceCategoryRaw = service.category;
      const subcategoryId = subcategoryCategory._id.toString();
      
      // Check direct ObjectId match
      if (serviceCategoryId === subcategoryId) {
        isValidService = true;
      } 
      // Check if service has subcategory field pointing to this category
      else {
        const serviceSubcategoryValue = service.subcategory?.toString() || (service as any).subcategoryInfo?._id || '';
        if (serviceSubcategoryValue === subcategoryId) {
          isValidService = true;
        }
        // Handle services with category as categoryType string
        else if (typeof serviceCategoryRaw === 'string' && 
                 serviceCategoryRaw.toLowerCase() === subcategoryCategory.categoryType?.toLowerCase() &&
                 service.slug?.toLowerCase() === slug.toLowerCase()) {
          isValidService = true;
        }
      }
    }

    if (!isValidService) {
      res.status(404).json({
        success: false,
        message: 'Service not found in the specified subcategory',
      });
      return;
    }

    // Update the service
    const updatedService = await serviceService.updateService(service._id.toString(), req.body);
    
    res.status(200).json({
      success: true,
      data: updatedService,
      message: 'Service updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteServiceBySubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, subcategory, slug } = req.params;
    
    // First, verify the category exists and get it with subServices populated
    let categoryDoc = await ServiceCategory.findOne({
      $or: [
        { slug: category.toLowerCase() },
        { id: category.toLowerCase() },
      ],
    })
      .populate('subServices', '_id slug title shortDescription iconName price duration')
      .lean();

    let categoriesByType: any[] = [];
    
    // If not found by slug/id, try categoryType
    if (!categoryDoc) {
      categoriesByType = await ServiceCategory.find({
        categoryType: category.toLowerCase(),
      })
        .populate('subServices', '_id slug title shortDescription iconName price duration')
        .lean();
      
      if (categoriesByType.length > 0) {
        categoryDoc = categoriesByType.find((cat: any) => 
          cat.subServices && Array.isArray(cat.subServices) && cat.subServices.length > 0
        ) || categoriesByType[0];
      }
    }

    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // Find the subcategory - it could be a ServiceCategory itself (subcategory category)
    let subcategoryCategory: any = null;
    
    subcategoryCategory = await ServiceCategory.findOne({
      $or: [
        { slug: subcategory.toLowerCase() },
        { id: subcategory.toLowerCase() },
      ],
    }).lean();
    
    // If found as a category, verify it belongs to the parent category type
    if (subcategoryCategory) {
      if (subcategoryCategory.categoryType !== category.toLowerCase() && 
          categoryDoc.categoryType !== subcategoryCategory.categoryType) {
        subcategoryCategory = null; // Not a valid subcategory for this category
      }
    }

    // Find service by slug
    const service = await Service.findOne({ slug: slug.toLowerCase() }).lean();
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    // Verify the service is related to this subcategory
    let isValidService = false;
    
    if (subcategoryCategory) {
      // Subcategory is a category - service should belong to this category
      const serviceCategoryId = service.category?.toString() || (service as any).categoryInfo?._id || '';
      const serviceCategoryRaw = service.category;
      const subcategoryId = subcategoryCategory._id.toString();
      
      // Check direct ObjectId match
      if (serviceCategoryId === subcategoryId) {
        isValidService = true;
      } 
      // Check if service has subcategory field pointing to this category
      else {
        const serviceSubcategoryValue = service.subcategory?.toString() || (service as any).subcategoryInfo?._id || '';
        if (serviceSubcategoryValue === subcategoryId) {
          isValidService = true;
        }
        // Handle services with category as categoryType string
        else if (typeof serviceCategoryRaw === 'string' && 
                 serviceCategoryRaw.toLowerCase() === subcategoryCategory.categoryType?.toLowerCase() &&
                 service.slug?.toLowerCase() === slug.toLowerCase()) {
          isValidService = true;
        }
      }
    }

    if (!isValidService) {
      res.status(404).json({
        success: false,
        message: 'Service not found in the specified subcategory',
      });
      return;
    }

    // Delete the service
    await serviceService.deleteService(service._id.toString());
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

