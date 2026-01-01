import { z } from 'zod';

export const createCallbackSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number cannot exceed 20 characters'),
    email: z.string().email('Please provide a valid email address'),
    businessType: z.enum(['individual', 'proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited', 'other']).optional(),
    message: z.string().max(2000, 'Message cannot exceed 2000 characters').optional(),
    sourcePage: z.string().min(1, 'Source page is required'),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    serviceId: z.string().optional(),
  }),
});

export const updateCallbackSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Callback ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'contacted', 'resolved', 'archived']).optional(),
    message: z.string().max(2000, 'Message cannot exceed 2000 characters').optional(),
    businessType: z.enum(['individual', 'proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited', 'other']).optional(),
  }),
});

export const callbackQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['pending', 'contacted', 'resolved', 'archived']).optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    sourcePage: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const callbackByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Callback ID is required'),
  }),
});



