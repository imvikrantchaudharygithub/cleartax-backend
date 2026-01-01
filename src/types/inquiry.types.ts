export interface InquiryCreateRequest {
  name: string;
  phone: string;
  email: string;
  businessType: 'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other';
  message: string;
  serviceId?: string;
  sourcePage: string;
  type: 'callback' | 'query';
}

export interface InquiryResponse {
  _id: string;
  name: string;
  phone: string;
  email: string;
  businessType: string;
  message: string;
  sourcePage: string;
  type: 'callback' | 'query';
  status: 'pending' | 'contacted' | 'resolved' | 'archived';
  serviceId?: string | {
    _id: string;
    slug: string;
    title: string;
  };
  category?: {
    _id: string;
    id?: string;
    slug: string;
    title: string;
    categoryType?: string;
  };
  subcategory?: {
    _id: string;
    id?: string;
    slug: string;
    title: string;
    categoryType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InquiryQueryParams {
  page?: number;
  limit?: number;
  type?: 'callback' | 'query';
  status?: 'pending' | 'contacted' | 'resolved' | 'archived';
  sourcePage?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface InquiryStats {
  total: number;
  pending: number;
  contacted: number;
  resolved: number;
  archived: number;
  byType: {
    callback: number;
    query: number;
  };
  bySourcePage: Record<string, number>;
}

