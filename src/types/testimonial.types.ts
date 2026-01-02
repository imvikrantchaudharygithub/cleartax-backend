export interface TestimonialCreateRequest {
  id: string;
  companyName: string;
  companyLogo?: string;
  testimonial: string;
  personName: string;
  personRole: string;
  personAvatar?: string;
  rating: number;
  featured?: boolean;
  order?: number;
}

export interface TestimonialUpdateRequest extends Partial<TestimonialCreateRequest> {}

export interface TestimonialResponse {
  _id: string;
  id: string;
  companyName: string;
  companyLogo?: string;
  testimonial: string;
  personName: string;
  personRole: string;
  personAvatar?: string;
  rating: number;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

