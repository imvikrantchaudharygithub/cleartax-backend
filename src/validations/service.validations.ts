import { z } from 'zod';

const processStepSchema = z.object({
  step: z.number().int().positive(),
  title: z.string().min(1, 'Step title is required'),
  description: z.string().min(1, 'Step description is required'),
  duration: z.string().min(1, 'Step duration is required'),
});

const faqSchema = z.object({
  id: z.string().min(1, 'FAQ ID is required'),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    shortDescription: z.string().min(1, 'Short description is required').max(500, 'Short description too long'),
    longDescription: z.string().min(1, 'Long description is required'),
    iconName: z.string().min(1, 'Icon name is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.object({
      min: z.number().min(0, 'Minimum price must be positive'),
      max: z.number().min(0, 'Maximum price must be positive'),
      currency: z.string().default('INR'),
    }),
    duration: z.string().min(1, 'Duration is required'),
    features: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    process: z.array(processStepSchema).default([]),
    faqs: z.array(faqSchema).default([]),
    relatedServices: z.array(z.string()).optional(),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Service ID is required'),
  }),
  body: createServiceSchema.shape.body.partial(),
});

export const serviceQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const createServiceCategorySchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Category ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    iconName: z.string().min(1, 'Icon name is required'),
    heroTitle: z.string().min(1, 'Hero title is required'),
    heroDescription: z.string().min(1, 'Hero description is required'),
    categoryType: z.enum(['simple', 'banking-finance', 'ipo', 'legal']),
    subServices: z.array(z.string()).optional(),
  }),
});

export const createServiceBySubcategorySchema = z.object({
  params: z.object({
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().min(1, 'Subcategory is required'),
    slug: z.string().min(1, 'Slug is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    shortDescription: z.string().min(1, 'Short description is required').max(500, 'Short description too long'),
    longDescription: z.string().min(1, 'Long description is required'),
    iconName: z.string().min(1, 'Icon name is required'),
    price: z.object({
      min: z.number().min(0, 'Minimum price must be positive'),
      max: z.number().min(0, 'Maximum price must be positive'),
      currency: z.string().default('INR'),
    }),
    duration: z.string().min(1, 'Duration is required'),
    features: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    process: z.array(processStepSchema).default([]),
    faqs: z.array(faqSchema).default([]),
    relatedServices: z.array(z.string()).optional(),
  }),
});

export const updateServiceCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
  body: createServiceCategorySchema.shape.body.partial(),
});

export const updateServiceByCategorySchema = z.object({
  params: z.object({
    category: z.string().min(1, 'Category is required'),
    slug: z.string().min(1, 'Slug is required'),
  }),
  body: createServiceSchema.shape.body.partial(),
});

export const updateServiceBySubcategorySchema = z.object({
  params: z.object({
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().min(1, 'Subcategory is required'),
    slug: z.string().min(1, 'Slug is required'),
  }),
  body: createServiceSchema.shape.body.partial(),
});

