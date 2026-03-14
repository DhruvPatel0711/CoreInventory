import { IProduct } from '../models/Product';
export interface ProductQueryOptions {
    category?: string;
    search?: string;
    sku?: string;
    page?: number;
    limit?: number;
    sort?: string;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pages: number;
}
export declare const listProducts: (options: ProductQueryOptions) => Promise<PaginatedResult<IProduct>>;
export declare const getProductById: (id: string) => Promise<IProduct>;
export declare const getProductBySku: (sku: string) => Promise<IProduct>;
export declare const createProduct: (data: {
    name: string;
    sku: string;
    category: string;
    unit: string;
    reorderLevel?: number;
    description?: string;
}) => Promise<IProduct>;
export declare const updateProduct: (id: string, data: Partial<{
    name: string;
    sku: string;
    category: string;
    unit: string;
    reorderLevel: number;
    description: string;
}>) => Promise<IProduct>;
export declare const deleteProduct: (id: string) => Promise<IProduct>;
//# sourceMappingURL=product.service.d.ts.map