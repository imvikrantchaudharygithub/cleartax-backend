export interface ComplianceDeadlineCreateRequest {
  title: string;
  description: string;
  dueDate: Date;
  status: 'urgent' | 'upcoming' | 'completed';
  category: 'GST' | 'Income Tax' | 'TDS' | 'Other';
  userId?: string;
}

export interface ComplianceDeadlineUpdateRequest extends Partial<ComplianceDeadlineCreateRequest> {}

export interface ComplianceDeadlineResponse {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'urgent' | 'upcoming' | 'completed';
  category: 'GST' | 'Income Tax' | 'TDS' | 'Other';
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceDocumentCreateRequest {
  name: string;
  type: string;
  uploadDate: Date;
  size: string;
  fileUrl: string;
  userId?: string;
}

export interface ComplianceDocumentUpdateRequest {
  name?: string;
  type?: string;
  status?: 'verified' | 'pending' | 'rejected';
}

export interface ComplianceDocumentResponse {
  _id: string;
  name: string;
  type: string;
  uploadDate: Date;
  size: string;
  status: 'verified' | 'pending' | 'rejected';
  fileUrl: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceStats {
  filingsDue: number;
  completed: number;
  documents: number;
  lastUpdated: string;
}

export interface ComplianceQueryParams {
  page?: number;
  limit?: number;
  status?: 'urgent' | 'upcoming' | 'completed';
  category?: 'GST' | 'Income Tax' | 'TDS' | 'Other';
}

