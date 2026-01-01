import { z } from 'zod';

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    category: z.string().min(1, 'Category is required'),
    author: z.object({
      name: z.string().min(1, 'Author name is required'),
      avatar: z.string().min(1, 'Author avatar is required'),
    }),
    date: z.string().or(z.date()),
    readTime: z.string().min(1, 'Read time is required'),
    excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long'),
    content: z.string().min(1, 'Content is required'),
    image: z.string().url('Invalid image URL').optional(),
    featured: z.boolean().optional().default(false),
  }),
});

export const updateBlogSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Blog ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    category: z.string().min(1).optional(),
    author: z
      .object({
        name: z.string().min(1),
        avatar: z.string().min(1),
      })
      .optional(),
    date: z.string().or(z.date()).optional(),
    readTime: z.string().min(1).optional(),
    excerpt: z.string().min(1).max(500).optional(),
    content: z.string().min(1).optional(),
    image: z.string().url().optional(),
    featured: z.boolean().optional(),
  }),
});

export const getBlogBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

export const blogQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    featured: z.string().transform((val) => val === 'true').optional(),
    sortBy: z.enum(['date', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

