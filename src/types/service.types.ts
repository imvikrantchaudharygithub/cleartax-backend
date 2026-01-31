export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServicePrice {
  min: number;
  max: number;
  currency: string;
}

export interface DraftMeta {
  completionStep?: number;
  lastSavedAt?: Date;
}

export interface ServiceCreateRequest {
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: string;
  subcategory?: string;
  price: ServicePrice;
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: ProcessStep[];
  faqs: FAQ[];
  relatedServices?: string[];
  status?: 'draft' | 'published';
  draftMeta?: DraftMeta;
  slug?: string;
}

export interface ServiceUpdateRequest extends Partial<ServiceCreateRequest> {
  slug?: string;
}

export interface ServiceResponse {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: string;
  subcategory?: string;
  price: ServicePrice;
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: ProcessStep[];
  faqs: FAQ[];
  relatedServices: string[];
  status?: 'draft' | 'published';
  draftMeta?: DraftMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategoryCreateRequest {
  id: string;
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  categoryType: 'simple' | 'banking-finance' | 'ipo' | 'legal';
  subServices?: string[];
}

export interface ServiceCategoryUpdateRequest extends Partial<Omit<ServiceCategoryCreateRequest, 'id'>> {
  id?: string; // ID can be updated but should be validated for uniqueness
}

export interface ServiceCategoryResponse {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  categoryType: 'simple' | 'banking-finance' | 'ipo' | 'legal';
  subServices: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  category?: string; // Can be category slug, id, or categoryType
  search?: string;
  includeDrafts?: boolean;
}

