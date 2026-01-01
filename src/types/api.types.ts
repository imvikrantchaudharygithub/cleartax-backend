/**
 * API Configuration and Type Definitions
 * Use these types in your frontend for type-safe API integration
 */

// Base API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  endpoints: {
    auth: {
      register: { method: 'POST', url: '/auth/register' },
      login: { method: 'POST', url: '/auth/login' },
      refresh: { method: 'POST', url: '/auth/refresh' },
      me: { method: 'GET', url: '/auth/me' },
    },
    blog: {
      list: { method: 'GET', url: '/blog' },
      featured: { method: 'GET', url: '/blog/featured' },
      recent: { method: 'GET', url: '/blog/recent' },
      getBySlug: { method: 'GET', url: '/blog/:slug' },
      related: { method: 'GET', url: '/blog/:slug/related' },
      create: { method: 'POST', url: '/blog' },
      update: { method: 'PUT', url: '/blog/:id' },
      delete: { method: 'DELETE', url: '/blog/:id' },
    },
    services: {
      list: { method: 'GET', url: '/services' },
      categories: { method: 'GET', url: '/services/categories' },
      categoryById: { method: 'GET', url: '/services/categories/:id' },
      byCategory: { method: 'GET', url: '/services/:category' },
      getBySlug: { method: 'GET', url: '/services/:category/:slug' },
      create: { method: 'POST', url: '/services' },
      createCategory: { method: 'POST', url: '/services/categories' },
      update: { method: 'PUT', url: '/services/:id' },
      delete: { method: 'DELETE', url: '/services/:id' },
    },
    inquiries: {
      create: { method: 'POST', url: '/inquiries' },
      list: { method: 'GET', url: '/inquiries' },
      stats: { method: 'GET', url: '/inquiries/stats' },
      getById: { method: 'GET', url: '/inquiries/:id' },
      update: { method: 'PUT', url: '/inquiries/:id' },
      delete: { method: 'DELETE', url: '/inquiries/:id' },
    },
    team: {
      list: { method: 'GET', url: '/team' },
      getById: { method: 'GET', url: '/team/:id' },
      create: { method: 'POST', url: '/team' },
      update: { method: 'PUT', url: '/team/:id' },
      delete: { method: 'DELETE', url: '/team/:id' },
    },
    compliance: {
      deadlines: {
        list: { method: 'GET', url: '/compliance/deadlines' },
        upcoming: { method: 'GET', url: '/compliance/deadlines/upcoming' },
        create: { method: 'POST', url: '/compliance/deadlines' },
        update: { method: 'PUT', url: '/compliance/deadlines/:id' },
        delete: { method: 'DELETE', url: '/compliance/deadlines/:id' },
      },
      documents: {
        list: { method: 'GET', url: '/compliance/documents' },
        create: { method: 'POST', url: '/compliance/documents' },
        update: { method: 'PUT', url: '/compliance/documents/:id' },
        delete: { method: 'DELETE', url: '/compliance/documents/:id' },
      },
      stats: { method: 'GET', url: '/compliance/stats' },
    },
    calculators: {
      incomeTax: { method: 'POST', url: '/calculators/income-tax' },
      gst: { method: 'POST', url: '/calculators/gst' },
      emi: { method: 'POST', url: '/calculators/emi' },
      hra: { method: 'POST', url: '/calculators/hra' },
      tds: { method: 'POST', url: '/calculators/tds' },
      history: { method: 'GET', url: '/calculators/history' },
    },
    users: {
      list: { method: 'GET', url: '/users' },
      getById: { method: 'GET', url: '/users/:id' },
      update: { method: 'PUT', url: '/users/:id' },
      updateRole: { method: 'PUT', url: '/users/:id/role' },
      delete: { method: 'DELETE', url: '/users/:id' },
    },
  },
} as const;

// Standard API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Blog Types
export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogQueryParams extends PaginationParams {
  category?: string;
  search?: string;
  featured?: boolean;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogCreateRequest {
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image?: string;
  featured?: boolean;
}

// Service Types
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

export interface Service {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: ProcessStep[];
  faqs: FAQ[];
  relatedServices: string[] | Service[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  categoryType: 'simple' | 'banking-finance' | 'ipo' | 'legal';
  subServices: string[] | Service[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceQueryParams extends PaginationParams {
  category?: string;
  search?: string;
}

// Inquiry Types
export interface Inquiry {
  _id: string;
  name: string;
  phone: string;
  email: string;
  businessType: 'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other';
  message: string;
  sourcePage: string;
  type: 'callback' | 'query';
  status: 'pending' | 'contacted' | 'resolved' | 'archived';
  serviceId?: string | Service;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryCreateRequest {
  name: string;
  email: string;
  phone: string;
  businessType: 'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other';
  message: string;
  serviceId?: string;
  sourcePage: string;
  type: 'callback' | 'query';
}

export interface InquiryQueryParams extends PaginationParams {
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

// Team Types
export interface TeamMember {
  _id: string;
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  createdAt: string;
  updatedAt: string;
}

// Compliance Types
export interface ComplianceDeadline {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'urgent' | 'upcoming' | 'completed';
  category: 'GST' | 'Income Tax' | 'TDS' | 'Other';
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceDocument {
  _id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'verified' | 'pending' | 'rejected';
  fileUrl: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceStats {
  filingsDue: number;
  completed: number;
  documents: number;
  lastUpdated: string;
}

export interface ComplianceQueryParams extends PaginationParams {
  status?: 'urgent' | 'upcoming' | 'completed';
  category?: 'GST' | 'Income Tax' | 'TDS' | 'Other';
}

// Calculator Types
export interface IncomeTaxInput {
  financialYear: string;
  incomeType: 'salary' | 'business' | 'investment' | 'other';
  grossIncome: number;
  age: number;
  deductions: {
    section80C: number;
    section80D: number;
    section80E: number;
    others: number;
  };
  state: string;
  surcharge: boolean;
}

export interface IncomeTaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBreakdown: {
    slab: string;
    rate: number;
    amount: number;
  }[];
  baseTax: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
}

export interface GSTInput {
  calculationType: 'add' | 'remove';
  amount: number;
  gstRate: 5 | 12 | 18 | 28;
  transactionType: 'b2b' | 'b2c';
  interstate: boolean;
}

export interface GSTResult {
  originalAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  effectiveRate: number;
}

export interface EMIInput {
  loanAmount: number;
  interestRate: number;
  loanDuration: number;
  loanType: 'home' | 'auto' | 'personal' | 'education';
  processingFee?: number;
  insurance?: number;
  prepayment?: number;
}

export interface EMIResult {
  principal: number;
  interestRate: number;
  tenure: number;
  emi: number;
  totalInterest: number;
  totalAmount: number;
  processingFee: number;
  insurance: number;
  totalCost: number;
  prepayment?: {
    amount: number;
    newEMI: number;
    interestSaved: number;
  };
}

export interface HRAInput {
  basicSalary: number;
  da: number;
  hraReceived: number;
  cityType: 'metro' | 'non-metro';
  rentPaid: number;
  spouseIncome?: number;
}

export interface HRAResult {
  basicSalary: number;
  da: number;
  hraReceived: number;
  rentPaid: number;
  cityType: 'metro' | 'non-metro';
  exemption1: number;
  exemption2: number;
  exemption3: number;
  hraExemption: number;
  taxableHRA: number;
}

export interface TDSInput {
  tdsType: 'salary' | 'professional' | 'contract' | 'rent' | 'commission' | 'interest' | 'dividend';
  amount: number;
  hasPAN: boolean;
  financialYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  specialCategory?: boolean;
}

export interface TDSResult {
  tdsType: string;
  amount: number;
  tdsRate: number;
  tdsAmount: number;
  hasPAN: boolean;
  surcharge: number;
  cess: number;
  totalTDS: number;
}

export interface CalculatorHistory {
  _id: string;
  calculatorType: 'income-tax' | 'gst' | 'emi' | 'hra' | 'tds';
  inputData: Record<string, any>;
  result: Record<string, any>;
  userId?: string;
  createdAt: string;
}

// User Types
export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryParams extends PaginationParams {
  role?: 'admin' | 'user';
  isActive?: boolean;
  search?: string;
}

// Auth Types
export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: 'admin' | 'user';
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

