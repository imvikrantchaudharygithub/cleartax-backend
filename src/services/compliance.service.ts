import { ComplianceDeadline } from '../models/ComplianceDeadline.model';
import { ComplianceDocument } from '../models/ComplianceDocument.model';
import {
  ComplianceDeadlineCreateRequest,
  ComplianceDeadlineUpdateRequest,
  ComplianceDeadlineResponse,
  ComplianceDocumentCreateRequest,
  ComplianceDocumentUpdateRequest,
  ComplianceDocumentResponse,
  ComplianceStats,
  ComplianceQueryParams,
} from '../types/compliance.types';
import { PAGINATION } from '../config/constants';
import mongoose from 'mongoose';

export const createComplianceDeadline = async (
  data: ComplianceDeadlineCreateRequest
): Promise<ComplianceDeadlineResponse> => {
  const deadlineData: any = {
    ...data,
    dueDate: typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate,
  };

  if (data.userId) {
    deadlineData.userId = new mongoose.Types.ObjectId(data.userId);
  }

  const deadline = await ComplianceDeadline.create(deadlineData);
  return deadline.toObject() as unknown as ComplianceDeadlineResponse;
};

export const getComplianceDeadlines = async (query: ComplianceQueryParams) => {
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  const [deadlines, total] = await Promise.all([
    ComplianceDeadline.find(filter)
      .populate('userId', 'fullName email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ComplianceDeadline.countDocuments(filter),
  ]);

  return {
    deadlines: deadlines as unknown as ComplianceDeadlineResponse[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUpcomingDeadlines = async (limit: number = 10): Promise<ComplianceDeadlineResponse[]> => {
  const now = new Date();
  const deadlines = await ComplianceDeadline.find({
    status: { $in: ['urgent', 'upcoming'] },
    dueDate: { $gte: now },
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean();

  return deadlines as unknown as ComplianceDeadlineResponse[];
};

export const updateComplianceDeadline = async (
  id: string,
  data: ComplianceDeadlineUpdateRequest
): Promise<ComplianceDeadlineResponse> => {
  if (data.dueDate && typeof data.dueDate === 'string') {
    data.dueDate = new Date(data.dueDate) as any;
  }

  const deadline = await ComplianceDeadline.findByIdAndUpdate(id, data, { new: true }).lean();

  if (!deadline) {
    throw new Error('Compliance deadline not found');
  }

  return deadline as unknown as ComplianceDeadlineResponse;
};

export const deleteComplianceDeadline = async (id: string): Promise<void> => {
  const deadline = await ComplianceDeadline.findByIdAndDelete(id);

  if (!deadline) {
    throw new Error('Compliance deadline not found');
  }
};

// Document methods
export const createComplianceDocument = async (
  data: ComplianceDocumentCreateRequest
): Promise<ComplianceDocumentResponse> => {
  const documentData: any = {
    ...data,
    uploadDate: typeof data.uploadDate === 'string' ? new Date(data.uploadDate) : data.uploadDate,
    status: 'pending',
  };

  if (data.userId) {
    documentData.userId = new mongoose.Types.ObjectId(data.userId);
  }

  const document = await ComplianceDocument.create(documentData);
  return document.toObject() as unknown as ComplianceDocumentResponse;
};

export const getComplianceDocuments = async (query: ComplianceQueryParams) => {
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.status) {
    filter.status = query.status;
  }

  const [documents, total] = await Promise.all([
    ComplianceDocument.find(filter)
      .populate('userId', 'fullName email')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ComplianceDocument.countDocuments(filter),
  ]);

  return {
    documents: documents as unknown as ComplianceDocumentResponse[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateComplianceDocument = async (
  id: string,
  data: ComplianceDocumentUpdateRequest
): Promise<ComplianceDocumentResponse> => {
  const document = await ComplianceDocument.findByIdAndUpdate(id, data, { new: true }).lean();

  if (!document) {
    throw new Error('Compliance document not found');
  }

  return document as unknown as ComplianceDocumentResponse;
};

export const deleteComplianceDocument = async (id: string): Promise<void> => {
  const document = await ComplianceDocument.findByIdAndDelete(id);

  if (!document) {
    throw new Error('Compliance document not found');
  }
};

export const getComplianceStats = async (): Promise<ComplianceStats> => {
  const [filingsDue, completed, documents] = await Promise.all([
    ComplianceDeadline.countDocuments({ status: { $in: ['urgent', 'upcoming'] } }),
    ComplianceDeadline.countDocuments({ status: 'completed' }),
    ComplianceDocument.countDocuments(),
  ]);

  return {
    filingsDue,
    completed,
    documents,
    lastUpdated: new Date().toISOString(),
  };
};

