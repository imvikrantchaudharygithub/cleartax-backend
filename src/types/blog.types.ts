export interface BlogAuthor {
  name: string;
  avatar: string;
}

export interface BlogCreateRequest {
  title: string;
  category: string;
  author: BlogAuthor;
  date: Date;
  readTime: string;
  excerpt: string;
  content: string;
  image?: string;
  featured?: boolean;
}

export interface BlogUpdateRequest extends Partial<BlogCreateRequest> {
  slug?: string;
}

export interface BlogResponse {
  _id: string;
  slug: string;
  title: string;
  category: string;
  author: BlogAuthor;
  date: Date;
  readTime: string;
  excerpt: string;
  content: string;
  image?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

