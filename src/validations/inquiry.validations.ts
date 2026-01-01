import { z } from 'zod';

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    businessType: z.enum([
      'individual',
      'proprietorship',
      'partnership',
      'llp',
      'private-limited',
      'public-limited',
      'other',
    ]),
    message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
    serviceId: z.string().optional(),
    sourcePage: z.string().min(1, 'Source page is required'),
    type: z.enum(['callback', 'query']),
  }),
});

export const inquiryQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z.enum(['callback', 'query']).optional(),
    status: z.enum(['pending', 'contacted', 'resolved', 'archived']).optional(),
    sourcePage: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const updateInquiryStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Inquiry ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'contacted', 'resolved', 'archived']),
  }),
});

