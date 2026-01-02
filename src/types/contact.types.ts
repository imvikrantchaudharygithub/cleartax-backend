export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

export interface ContactCreateRequest {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  location?: string;
  website?: string;
  socialMedia?: SocialMedia;
  businessHours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
}

export interface ContactUpdateRequest extends Partial<ContactCreateRequest> {}

export interface ContactResponse {
  _id: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  location?: string;
  website?: string;
  socialMedia?: SocialMedia;
  businessHours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
  createdAt: Date;
  updatedAt: Date;
}

