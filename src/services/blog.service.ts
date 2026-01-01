import { Blog } from '../models/Blog.model';
import { BlogCreateRequest, BlogUpdateRequest, BlogQueryParams, BlogResponse } from '../types/blog.types';
import { PAGINATION } from '../config/constants';

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
    throw new Error('A blog with this title already exists');
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
    throw new Error('Blog not found');
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
    throw new Error('Blog not found');
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
    throw new Error('Blog not found');
  }

  // Generate new slug if title changed
  if (data.title && data.title !== blog.title) {
    const newSlug = generateSlug(data.title);
    const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
    if (existingBlog) {
      throw new Error('A blog with this title already exists');
    }
    data.slug = newSlug;
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
    throw new Error('Blog not found');
  }
};

