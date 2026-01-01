import { z } from 'zod';

export const createComplianceDeadlineSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    dueDate: z.string().or(z.date()),
    status: z.enum(['urgent', 'upcoming', 'completed']),
    category: z.enum(['GST', 'Income Tax', 'TDS', 'Other']),
    userId: z.string().optional(),
  }),
});

export const updateComplianceDeadlineSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Deadline ID is required'),
  }),
  body: createComplianceDeadlineSchema.shape.body.partial(),
});

export const createComplianceDocumentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Document name is required').max(200, 'Name too long'),
    type: z.string().min(1, 'Document type is required'),
    uploadDate: z.string().or(z.date()),
    size: z.string().min(1, 'File size is required'),
    fileUrl: z.string().url('Invalid file URL'),
    userId: z.string().optional(),
  }),
});

export const updateComplianceDocumentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    type: z.string().min(1).optional(),
    status: z.enum(['verified', 'pending', 'rejected']).optional(),
  }),
});

export const complianceQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['urgent', 'upcoming', 'completed']).optional(),
    category: z.enum(['GST', 'Income Tax', 'TDS', 'Other']).optional(),
  }),
});

