import { Inquiry } from '../models/Inquiry.model';
import {
  InquiryCreateRequest,
  InquiryQueryParams,
  InquiryResponse,
  InquiryStats,
} from '../types/inquiry.types';
import { PAGINATION } from '../config/constants';
import { sendInquiryNotification } from './email.service';
import mongoose from 'mongoose';

export const createInquiry = async (data: InquiryCreateRequest): Promise<InquiryResponse> => {
  const inquiryData: any = {
    ...data,
    status: 'pending',
  };

  if (data.serviceId) {
    inquiryData.serviceId = new mongoose.Types.ObjectId(data.serviceId);
  }

  const inquiry = await Inquiry.create(inquiryData);

  // Send email notification (non-blocking)
  sendInquiryNotification({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    type: data.type,
  }).catch((error) => {
    console.error('Failed to send inquiry notification email:', error);
  });

  return inquiry.toObject() as unknown as InquiryResponse;
};

export const getInquiries = async (query: InquiryQueryParams) => {
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.sourcePage) {
    filter.sourcePage = query.sourcePage;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .populate('serviceId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  return {
    inquiries: inquiries as unknown as InquiryResponse[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getInquiryById = async (id: string): Promise<InquiryResponse> => {
  const inquiry = await Inquiry.findById(id).populate('serviceId', 'title slug').lean();

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  return inquiry as unknown as InquiryResponse;
};

export const updateInquiryStatus = async (
  id: string,
  status: 'pending' | 'contacted' | 'resolved' | 'archived'
): Promise<InquiryResponse> => {
  const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true }).lean();

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  return inquiry as unknown as InquiryResponse;
};

export const deleteInquiry = async (id: string): Promise<void> => {
  const inquiry = await Inquiry.findByIdAndDelete(id);

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }
};

export const getInquiryStats = async (): Promise<InquiryStats> => {
  const [
    total,
    pending,
    contacted,
    resolved,
    archived,
    callback,
    query,
    bySourcePage,
  ] = await Promise.all([
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'pending' }),
    Inquiry.countDocuments({ status: 'contacted' }),
    Inquiry.countDocuments({ status: 'resolved' }),
    Inquiry.countDocuments({ status: 'archived' }),
    Inquiry.countDocuments({ type: 'callback' }),
    Inquiry.countDocuments({ type: 'query' }),
    Inquiry.aggregate([
      {
        $group: {
          _id: '$sourcePage',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const sourcePageMap: Record<string, number> = {};
  bySourcePage.forEach((item) => {
    sourcePageMap[item._id] = item.count;
  });

  return {
    total,
    pending,
    contacted,
    resolved,
    archived,
    byType: {
      callback,
      query,
    },
    bySourcePage: sourcePageMap,
  };
};

