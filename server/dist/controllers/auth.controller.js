"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const authService = __importStar(require("../services/auth.service"));
// ─── POST /api/auth/register ─────────────────────────────────
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, role } = req.body;
    // Basic input validation
    if (!name || !email || !password) {
        throw new ApiError_1.ApiError(400, 'Name, email, and password are required');
    }
    if (password.length < 6) {
        throw new ApiError_1.ApiError(400, 'Password must be at least 6 characters');
    }
    const result = await authService.register({ name, email, password, role });
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
    });
});
// ─── POST /api/auth/login ────────────────────────────────────
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, 'Email and password are required');
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
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = String(req.user?._id);
    const user = await authService.getProfile(userId);
    res.json({
        success: true,
        data: user,
    });
});
//# sourceMappingURL=auth.controller.js.map