import { Callback } from '../models/Callback.model';
import {
  CallbackCreateRequest,
  CallbackUpdateRequest,
  CallbackResponse,
  CallbackQueryParams,
  CallbackStats,
} from '../types/callback.types';
import { PAGINATION } from '../config/constants';
import mongoose from 'mongoose';

/**
 * Parse category and subcategory from sourcePage URL
 * Examples:
 * - /services/gst/registration -> category: 'gst'
 * - /services/ipo/financial-due-diligence/peer-comparison -> category: 'ipo', subcategory: 'financial-due-diligence'
 * - /services/ipo/financial-due-diligence -> category: 'ipo', subcategory: 'financial-due-diligence'
 */
const parseSourcePage = (sourcePage: string): { category?: string; subcategory?: string } => {
  const result: { category?: string; subcategory?: string } = {};
  
  // Match pattern: /services/{category}/{subcategory?}/{service?}
  const match = sourcePage.match(/^\/services\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/);
  
  if (match) {
    const category = match[1];
    const secondSegment = match[2];
    const thirdSegment = match[3];
    
    // Known complex categories that have subcategories
    const complexCategories = ['ipo', 'legal', 'banking-finance'];
    
    if (complexCategories.includes(category)) {
      // If it's a complex category, the second segment is likely a subcategory
      if (secondSegment && !thirdSegment) {
        // Pattern: /services/ipo/financial-due-diligence
        result.category = category;
        result.subcategory = secondSegment;
      } else if (secondSegment && thirdSegment) {
        // Pattern: /services/ipo/financial-due-diligence/service-slug
        result.category = category;
        result.subcategory = secondSegment;
      } else {
        // Pattern: /services/ipo (just category)
        result.category = category;
      }
    } else {
      // Simple category - second segment is likely a service slug
      result.category = category;
    }
  }
  
  return result;
};

export const createCallback = async (data: CallbackCreateRequest): Promise<CallbackResponse> => {
  // Auto-populate category and subcategory from sourcePage if not provided
  let category = data.category;
  let subcategory = data.subcategory;
  
  if (!category || !subcategory) {
    const parsed = parseSourcePage(data.sourcePage);
    category = category || parsed.category;
    subcategory = subcategory || parsed.subcategory;
  }
  
  // Convert serviceId to ObjectId if provided
  let serviceId: mongoose.Types.ObjectId | string | undefined = data.serviceId;
  if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
    serviceId = new mongoose.Types.ObjectId(serviceId);
  }
  
  const callbackData: any = {
    name: data.name,
    phone: data.phone,
    email: data.email.toLowerCase(),
    sourcePage: data.sourcePage,
    status: 'pending',
    category,
    subcategory,
    serviceId,
  };
  
  if (data.businessType) {
    callbackData.businessType = data.businessType;
  }
  
  if (data.message) {
    callbackData.message = data.message;
  }
  
  const callback = await Callback.create(callbackData);
  
  return {
    _id: callback._id.toString(),
    name: callback.name,
    phone: callback.phone,
    email: callback.email,
    businessType: callback.businessType,
    message: callback.message,
    sourcePage: callback.sourcePage,
    category: callback.category,
    subcategory: callback.subcategory,
    serviceId: callback.serviceId ? (typeof callback.serviceId === 'object' ? callback.serviceId.toString() : callback.serviceId) : null,
    status: callback.status,
    createdAt: callback.createdAt,
    updatedAt: callback.updatedAt,
  };
};

export const getCallbacks = async (query: CallbackQueryParams) => {
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;
  
  const filter: any = {};
  
  // Filter by status
  if (query.status) {
    filter.status = query.status;
  }
  
  // Filter by category
  if (query.category) {
    filter.category = query.category.toLowerCase();
  }
  
  // Filter by subcategory
  if (query.subcategory) {
    filter.subcategory = query.subcategory.toLowerCase();
  }
  
  // Filter by sourcePage
  if (query.sourcePage) {
    filter.sourcePage = { $regex: query.sourcePage, $options: 'i' };
  }
  
  // Filter by date range
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }
  
  // Search filter
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
      { message: { $regex: query.search, $options: 'i' } },
    ];
  }
  
  const [callbacks, total] = await Promise.all([
    Callback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Callback.countDocuments(filter),
  ]);
  
  const transformedCallbacks: CallbackResponse[] = callbacks.map((callback: any) => ({
    _id: callback._id.toString(),
    name: callback.name,
    phone: callback.phone,
    email: callback.email,
    businessType: callback.businessType,
    message: callback.message,
    sourcePage: callback.sourcePage,
    category: callback.category,
    subcategory: callback.subcategory,
    serviceId: callback.serviceId ? (typeof callback.serviceId === 'object' ? callback.serviceId.toString() : callback.serviceId) : null,
    status: callback.status,
    createdAt: callback.createdAt,
    updatedAt: callback.updatedAt,
  }));
  
  return {
    callbacks: transformedCallbacks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCallbackById = async (id: string): Promise<CallbackResponse> => {
  let callback = null;
  
  // Try to find by MongoDB _id
  if (mongoose.Types.ObjectId.isValid(id)) {
    callback = await Callback.findById(id).lean();
  }
  
  if (!callback) {
    throw new Error('Callback request not found');
  }
  
  return {
    _id: callback._id.toString(),
    name: callback.name,
    phone: callback.phone,
    email: callback.email,
    businessType: callback.businessType,
    message: callback.message,
    sourcePage: callback.sourcePage,
    category: callback.category,
    subcategory: callback.subcategory,
    serviceId: callback.serviceId ? (typeof callback.serviceId === 'object' ? callback.serviceId.toString() : callback.serviceId) : null,
    status: callback.status,
    createdAt: callback.createdAt,
    updatedAt: callback.updatedAt,
  };
};

export const updateCallback = async (id: string, data: CallbackUpdateRequest): Promise<CallbackResponse> => {
  let callback = null;
  
  // Try to find by MongoDB _id
  if (mongoose.Types.ObjectId.isValid(id)) {
    callback = await Callback.findById(id);
  }
  
  if (!callback) {
    throw new Error('Callback request not found');
  }
  
  // Update fields
  if (data.status !== undefined) {
    callback.status = data.status;
  }
  
  if (data.message !== undefined) {
    callback.message = data.message;
  }
  
  if (data.businessType !== undefined) {
    callback.businessType = data.businessType;
  }
  
  await callback.save();
  
  return {
    _id: callback._id.toString(),
    name: callback.name,
    phone: callback.phone,
    email: callback.email,
    businessType: callback.businessType,
    message: callback.message,
    sourcePage: callback.sourcePage,
    category: callback.category,
    subcategory: callback.subcategory,
    serviceId: callback.serviceId ? (typeof callback.serviceId === 'object' ? callback.serviceId.toString() : callback.serviceId) : null,
    status: callback.status,
    createdAt: callback.createdAt,
    updatedAt: callback.updatedAt,
  };
};

export const deleteCallback = async (id: string): Promise<void> => {
  let callback = null;
  
  // Try to find by MongoDB _id
  if (mongoose.Types.ObjectId.isValid(id)) {
    callback = await Callback.findByIdAndDelete(id);
  }
  
  if (!callback) {
    throw new Error('Callback request not found');
  }
};

export const getCallbackStats = async (): Promise<CallbackStats> => {
  const [total, pending, contacted, resolved, archived, allCallbacks] = await Promise.all([
    Callback.countDocuments({}),
    Callback.countDocuments({ status: 'pending' }),
    Callback.countDocuments({ status: 'contacted' }),
    Callback.countDocuments({ status: 'resolved' }),
    Callback.countDocuments({ status: 'archived' }),
    Callback.find({}).select('category subcategory sourcePage').lean(),
  ]);
  
  // Calculate by category
  const byCategory: Record<string, number> = {};
  allCallbacks.forEach((callback: any) => {
    if (callback.category) {
      byCategory[callback.category] = (byCategory[callback.category] || 0) + 1;
    }
  });
  
  // Calculate by subcategory
  const bySubcategory: Record<string, number> = {};
  allCallbacks.forEach((callback: any) => {
    if (callback.subcategory) {
      bySubcategory[callback.subcategory] = (bySubcategory[callback.subcategory] || 0) + 1;
    }
  });
  
  // Calculate by sourcePage
  const bySourcePage: Record<string, number> = {};
  allCallbacks.forEach((callback: any) => {
    if (callback.sourcePage) {
      bySourcePage[callback.sourcePage] = (bySourcePage[callback.sourcePage] || 0) + 1;
    }
  });
  
  return {
    total,
    pending,
    contacted,
    resolved,
    archived,
    byCategory,
    bySubcategory,
    bySourcePage,
  };
};



