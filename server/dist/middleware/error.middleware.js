"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const env_1 = require("../config/env");
// ─── Global Error Handler ────────────────────────────────────
// Must have 4 parameters so Express recognises it as an error handler.
const errorHandler = (err, _req, res, _next) => {
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let stack;
    if (err instanceof ApiError_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        message = err.message;
    }
    // Only expose stack traces in development
    if (env_1.env.NODE_ENV === 'development') {
        stack = err.stack;
    }
    console.error(`❌  [${statusCode}] ${message}`);
    if (stack)
        console.error(stack);
    res.status(statusCode).json({
        success: false,
        message,
        ...(stack && { stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map