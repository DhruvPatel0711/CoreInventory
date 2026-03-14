import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as authService from '../services/auth.service';

// ─── POST /api/auth/register ─────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const normalizedRole =
    role === 'admin' || role === 'manager' || role === 'staff' ? role : undefined;

  const result = await authService.register({
    name,
    email,
    password,
    role: normalizedRole,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
});

// ─── POST /api/auth/login ────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const result = await authService.login({ email, password });

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// ─── GET /api/auth/me ────────────────────────────────────────
// Protected: requires authenticate middleware
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user?._id);
  const user = await authService.getProfile(userId);

  res.json({
    success: true,
    data: user,
  });
});

// ─── POST /api/auth/request-otp ──────────────────────────────
export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  const result = await authService.requestOtp(email);
  res.json({ success: true, ...result });
});

// ─── POST /api/auth/reset-password ───────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Email, OTP, and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const result = await authService.resetPassword({ email, otp, newPassword });
  res.json({ success: true, ...result });
});

// ─── PUT /api/auth/change-password ───────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user?._id);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const result = await authService.changePassword(userId, { currentPassword, newPassword });
  res.json({ success: true, ...result });
});
