import { Request, Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
    sort?: string;
}
export interface TypedRequest<TBody = any> extends Request {
    body: TBody;
}
export type TypedResponse<T = any> = Response<ApiResponse<T>>;
//# sourceMappingURL=index.d.ts.map