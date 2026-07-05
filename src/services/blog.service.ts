import { Blog } from '../models/Blog.model';
import { BlogCreateRequest, BlogUpdateRequest, BlogQueryParams, BlogResponse } from '../types/blog.types';
import { PAGINATION } from '../config/constants';
import { AppError } from '../middlewares/error.middleware';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createBlog = async (data: BlogCreateRequest): Promise<BlogResponse> => {
  const slug = generateSlug(data.title);

  // Check if slug already exists
  const existingBlog = await Blog.findOne({ slug });
  if (existingBlog) {
    throw new AppError('A blog with this title already exists', 409);
  }

  const blog = await Blog.create({
    ...data,
    slug,
    date: typeof data.date === 'string' ? new Date(data.date) : data.date,
    featured: data.featured || false,
  });

  return blog.toObject() as unknown as BlogResponse;
};

export const getBlogs = async (query: BlogQueryParams) => {
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.featured !== undefined) {
    filter.featured = query.featured;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const sort: any = {};
  if (query.sortBy === 'date') {
    sort.date = query.sortOrder === 'asc' ? 1 : -1;
  } else if (query.sortBy === 'title') {
    sort.title = query.sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.date = -1; // Default: newest first
  }

  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);

  return {
    blogs: blogs as unknown as BlogResponse[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBlogBySlug = async (slug: string): Promise<BlogResponse> => {
  const blog = await Blog.findOne({ slug }).lean();

  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  return blog as unknown as BlogResponse;
};

export const getFeaturedBlog = async (): Promise<BlogResponse | null> => {
  const blog = await Blog.findOne({ featured: true }).sort({ date: -1 }).lean();
  return blog as unknown as BlogResponse | null;
};

export const getRecentBlogs = async (limit: number = 5): Promise<BlogResponse[]> => {
  const blogs = await Blog.find()
    .sort({ date: -1 })
    .limit(limit)
    .lean();
  return blogs as unknown as BlogResponse[];
};

export const getRelatedBlogs = async (slug: string, limit: number = 3): Promise<BlogResponse[]> => {
  const currentBlog = await Blog.findOne({ slug });

  if (!currentBlog) {
    throw new AppError('Blog not found', 404);
  }

  const blogs = await Blog.find({
    _id: { $ne: currentBlog._id },
    category: currentBlog.category,
  })
    .sort({ date: -1 })
    .limit(limit)
    .lean();

  return blogs as unknown as BlogResponse[];
};

export const updateBlog = async (id: string, data: BlogUpdateRequest): Promise<BlogResponse> => {
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  // Slug is a stable, shareable URL key: once a blog is created its slug must not
  // change, even when the title is edited (changing it would break existing links
  // and SEO). Only honour an explicitly-provided slug, and keep it unique.
  if (data.slug && data.slug !== blog.slug) {
    const newSlug = generateSlug(data.slug);
    const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
    if (existingBlog) {
      throw new AppError('A blog with this slug already exists', 409);
    }
    data.slug = newSlug;
  } else {
    // Never let a title change regenerate the slug.
    delete (data as any).slug;
  }

  if (data.date && typeof data.date === 'string') {
    data.date = new Date(data.date) as any;
  }

  Object.assign(blog, data);
  await blog.save();

  return blog.toObject() as unknown as BlogResponse;
};

export const deleteBlog = async (id: string): Promise<void> => {
  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    throw new AppError('Blog not found', 404);
  }
};

