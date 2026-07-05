import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { RegisterRequest, LoginRequest, AuthResponse, JWTPayload } from '../types/auth.types';
import { JWT_CONFIG } from '../config/constants';
import { AppError } from '../middlewares/error.middleware';

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { phone: data.phone }],
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new AppError('Email already registered', 409);
    }
    throw new AppError('Phone number already registered', 409);
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  // Create user
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    role: 'user',
    isActive: true,
  });

  // Generate tokens
  const tokens = generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    ...tokens,
  };
};

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  // Find user by email
  const user = await User.findOne({ email: data.email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is inactive. Please contact support.', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokens = generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    ...tokens,
  };
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as JWTPayload;

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new access token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: String(JWT_CONFIG.ACCESS_TOKEN_EXPIRE) } as jwt.SignOptions
    );

    return { accessToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401);
    }
    throw error;
  }
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    _id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const generateTokens = (payload: JWTPayload): { accessToken: string; refreshToken: string } => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured');
  }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRE,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRE,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

