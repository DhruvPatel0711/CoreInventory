import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

// ─── Global Error Handler ────────────────────────────────────
// Must have 4 parameters so Express recognises it as an error handler.

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Only expose stack traces in development
  if (env.NODE_ENV === 'development') {
    stack = err.stack;
  }

  console.error(`❌  [${statusCode}] ${message}`);
  if (stack) console.error(stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(stack && { stack }),
  });
};
