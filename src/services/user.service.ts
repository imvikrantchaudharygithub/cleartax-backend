import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import {
  UserCreateRequest,
  UserUpdateRequest,
  UserRoleUpdateRequest,
  UserQueryParams,
  UserResponse,
} from '../types/user.types';
import { PAGINATION } from '../config/constants';
import { AppError } from '../middlewares/error.middleware';

export const createUser = async (data: UserCreateRequest): Promise<UserResponse> => {
  // Reject duplicate email or phone with a clear message (model also enforces uniqueness)
  const existing = await User.findOne({
    $or: [{ email: data.email }, { phone: data.phone }],
  });

  if (existing) {
    throw new AppError(
      existing.email === data.email.toLowerCase()
        ? 'Email already registered'
        : 'Phone number already registered',
      409
    );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    role: data.role || 'admin',
    isActive: true,
  });

  // Never return the password hash
  const { password, ...safe } = user.toObject();
  return safe as unknown as UserResponse;
};

export const getUsers = async (query: UserQueryParams) => {
  const page = query.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users as unknown as UserResponse[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id: string): Promise<UserResponse> => {
  const user = await User.findById(id).select('-password').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as UserResponse;
};

export const updateUser = async (id: string, data: UserUpdateRequest): Promise<UserResponse> => {
  const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as UserResponse;
};

export const updateUserRole = async (id: string, data: UserRoleUpdateRequest): Promise<UserResponse> => {
  const user = await User.findByIdAndUpdate(id, { role: data.role }, { new: true })
    .select('-password')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as UserResponse;
};

export const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }
};

