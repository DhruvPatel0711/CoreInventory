"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const User_1 = __importDefault(require("../models/User"));
// ─── JWT Authentication Middleware ───────────────────────────
const authenticate = async (req, _res, next) => {
    try {
        // 1. Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError_1.ApiError(401, 'Authentication required — no token provided');
        }
        const token = authHeader.split(' ')[1];
        // 2. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // 3. Attach user to request (exclude password)
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            throw new ApiError_1.ApiError(401, 'User belonging to this token no longer exists');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError) {
            next(error);
        }
        else {
            next(new ApiError_1.ApiError(401, 'Invalid or expired token'));
        }
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map