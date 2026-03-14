import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as productService from '../services/product.service';

// ─── GET /api/products ───────────────────────────────────────
// Query params: ?category=Electronics&search=keyboard&sku=ELEC&page=1&limit=20&sort=-createdAt
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, sku, page, limit, sort } = req.query;

  const result = await productService.listProducts({
    category: category as string,
    search: search as string,
    sku: sku as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    sort: sort as string,
  });

  res.json({
    success: true,
    ...result,
  });
});

// ─── GET /api/products/sku/:sku ──────────────────────────────
export const getProductBySku = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySku(req.params.sku as string);

  res.json({
    success: true,
    data: product,
  });
});

// ─── GET /api/products/:id ───────────────────────────────────
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id as string);

  res.json({
    success: true,
    data: product,
  });
});

// ─── POST /api/products ──────────────────────────────────────
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, sku, category, unit, reorderLevel, description } = req.body;

  if (!name || !sku || !category || !unit) {
    throw new ApiError(400, 'Name, SKU, category, and unit are required');
  }

  const product = await productService.createProduct({
    name,
    sku,
    category,
    unit,
    reorderLevel,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Product created',
    data: product,
  });
});

// ─── PUT /api/products/:id ───────────────────────────────────
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id as string, req.body);

  res.json({
    success: true,
    message: 'Product updated',
    data: product,
  });
});

// ─── DELETE /api/products/:id ────────────────────────────────
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id as string);

  res.json({
    success: true,
    message: 'Product deleted',
  });
});
