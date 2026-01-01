// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRE: process.env.JWT_EXPIRE || '24h',
  REFRESH_TOKEN_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

// Inquiry statuses
export const INQUIRY_STATUS = {
  PENDING: 'pending',
  CONTACTED: 'contacted',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
} as const;

// Inquiry types
export const INQUIRY_TYPE = {
  CALLBACK: 'callback',
  QUERY: 'query',
} as const;

// Compliance deadline statuses
export const COMPLIANCE_STATUS = {
  URGENT: 'urgent',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
} as const;

// Compliance categories
export const COMPLIANCE_CATEGORY = {
  GST: 'GST',
  INCOME_TAX: 'Income Tax',
  TDS: 'TDS',
  OTHER: 'Other',
} as const;

// Document statuses
export const DOCUMENT_STATUS = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const;

// Cloudinary folders
export const CLOUDINARY_FOLDERS = {
  BLOG_IMAGES: 'cleartax/blog',
  TEAM_AVATARS: 'cleartax/team',
  COMPLIANCE_DOCS: 'cleartax/compliance',
} as const;

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100000, // 100000 requests per window (increased for data migration)
} as const;

