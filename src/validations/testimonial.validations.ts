import { z } from 'zod';

export const createTestimonialSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Testimonial ID is required'),
    companyName: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
    companyLogo: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid company logo URL',
      }),
    testimonial: z.string().min(1, 'Testimonial text is required').max(1000, 'Testimonial too long'),
    personName: z.string().min(1, 'Person name is required').max(100, 'Person name too long'),
    personRole: z.string().min(1, 'Person role is required').max(100, 'Person role too long'),
    personAvatar: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid person avatar URL',
      }),
    rating: z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    featured: z.coerce.boolean().optional(),
    order: z.coerce.number().optional(),
  }),
});

export const updateTestimonialSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Testimonial ID is required'),
  }),
  body: createTestimonialSchema.shape.body.partial(),
});

