import { Request, Response, NextFunction } from 'express';

// ─── Async Handler ───────────────────────────────────────────
// Wraps async route handlers so thrown errors are forwarded to
// Express error middleware instead of causing unhandled rejections.
//
// Usage:
//   router.get('/items', asyncHandler(async (req, res) => { … }));

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (fn: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
