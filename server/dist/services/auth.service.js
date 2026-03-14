"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = __importDefault(require("../models/User"));
const ApiError_1 = require("../utils/ApiError");
// ─── Generate JWT ────────────────────────────────────────────
const generateToken = (user) => {
    const payload = {
        id: String(user._id),
        role: user.role,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
};
// ─── Build safe user response (no password) ──────────────────
const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
// ─── Register ────────────────────────────────────────────────
const register = async (data) => {
    // 1. Check for existing user
    const existingUser = await User_1.default.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
        throw new ApiError_1.ApiError(409, 'An account with this email already exists');
    }
    // 2. Create user (password is hashed by pre-save hook)
    const user = await User_1.default.create({
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
exports.register = register;
// ─── Login ───────────────────────────────────────────────────
const login = async (data) => {
    // 1. Find user by email (include password field for comparison)
    const user = await User_1.default.findOne({ email: data.email.toLowerCase() }).select('+password');
    if (!user) {
        throw new ApiError_1.ApiError(401, 'Invalid email or password');
    }
    // 2. Compare password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, 'Invalid email or password');
    }
    // 3. Generate token
    const token = generateToken(user);
    return {
        user: sanitizeUser(user),
        token,
    };
};
exports.login = login;
// ─── Get Current User Profile ────────────────────────────────
const getProfile = async (userId) => {
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(404, 'User not found');
    }
    return sanitizeUser(user);
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.service.js.map