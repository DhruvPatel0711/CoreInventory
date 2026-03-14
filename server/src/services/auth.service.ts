import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User, { IUser } from '../models/User';
import { ApiError } from '../utils/ApiError';

// ─── Token Payload ───────────────────────────────────────────
interface TokenPayload {
  id: string;
  role: string;
}

// ─── Generate JWT ────────────────────────────────────────────
const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: String(user._id),
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

// ─── Build safe user response (no password) ──────────────────
const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ─── Register ────────────────────────────────────────────────
export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'staff';
}) => {
  // 1. Check for existing user
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // 2. Create user (password is hashed by pre-save hook)
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'staff',
  });

  // 3. Generate token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

// ─── Login ───────────────────────────────────────────────────
export const login = async (data: { email: string; password: string }) => {
  // 1. Find user by email (include password field for comparison)
  const user = await User.findOne({ email: data.email.toLowerCase() }).select(
    '+password'
  );

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 2. Compare password
  const isPasswordValid = await user.comparePassword(data.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Generate token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

// ─── Get Current User Profile ────────────────────────────────
export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sanitizeUser(user);
};
