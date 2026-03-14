import { Request, Response } from 'express';

// ─── Express Custom Types ────────────────────────────────────

// Standard API response envelope
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

// Pagination query params
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
}

// Typed request with body
export interface TypedRequest<TBody = any> extends Request {
  body: TBody;
}

// Typed response helper
export type TypedResponse<T = any> = Response<ApiResponse<T>>;
