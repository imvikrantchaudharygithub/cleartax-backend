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

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
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

