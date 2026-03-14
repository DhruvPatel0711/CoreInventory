import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

// ─── Role-Based Access Control Middleware ────────────────────
// Usage:
//   router.delete('/products/:id', authenticate, authorise('admin', 'manager'), controller);

export const authorise = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorised to access this resource`
        )
      );
    }

    next();
  };
};
