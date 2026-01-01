import { Request, Response, NextFunction } from 'express';
import * as blogService from '../services/blog.service';

export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await blogService.getBlogs(req.query as any);
    res.status(200).json({
      success: true,
      data: result.blogs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await blogService.getBlogBySlug(slug);
    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedBlog = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blog = await blogService.getFeaturedBlog();
    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const blogs = await blogService.getRecentBlogs(limit);
    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
    const blogs = await blogService.getRelatedBlogs(slug, limit);
    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blog = await blogService.createBlog(req.body);
    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await blogService.updateBlog(id, req.body);
    res.status(200).json({
      success: true,
      data: blog,
      message: 'Blog updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await blogService.deleteBlog(id);
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

