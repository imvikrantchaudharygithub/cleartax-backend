export interface CallbackCreateRequest {
  name: string;
  phone: string;
  email: string;
  businessType?: 'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other';
  message?: string;
  sourcePage: string;
  category?: string;
  subcategory?: string;
  serviceId?: string;
}

export interface CallbackUpdateRequest {
  status?: 'pending' | 'contacted' | 'resolved' | 'archived';
  message?: string;
  businessType?: 'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other';
}

export interface CallbackResponse {
  _id: string;
  name: string;
  phone: string;
  email: string;
  businessType?: string;
  message?: string;
  sourcePage: string;
  category?: string;
  subcategory?: string;
  serviceId?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallbackQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'contacted' | 'resolved' | 'archived';
  category?: string;
  subcategory?: string;
  sourcePage?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CallbackStats {
  total: number;
  pending: number;
  contacted: number;
  resolved: number;
  archived: number;
  byCategory: Record<string, number>;
  bySubcategory: Record<string, number>;
  bySourcePage: Record<string, number>;
}
