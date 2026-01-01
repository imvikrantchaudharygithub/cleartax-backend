export interface UserResponse {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdateRequest {
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserRoleUpdateRequest {
  role: 'admin' | 'user';
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'user';
  isActive?: boolean;
  search?: string;
}

