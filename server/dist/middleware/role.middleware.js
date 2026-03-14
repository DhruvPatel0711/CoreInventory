"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorise = void 0;
const ApiError_1 = require("../utils/ApiError");
// ─── Role-Based Access Control Middleware ────────────────────
// Usage:
//   router.delete('/products/:id', authenticate, authorise('admin', 'manager'), controller);
const authorise = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ApiError_1.ApiError(401, 'Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError_1.ApiError(403, `Role '${req.user.role}' is not authorised to access this resource`));
        }
        next();
    };
};
exports.authorise = authorise;
//# sourceMappingURL=role.middleware.js.map