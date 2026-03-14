import Product, { IProduct } from '../models/Product';
import { ApiError } from '../utils/ApiError';

// ─── Query Options ───────────────────────────────────────────
export interface ProductQueryOptions {
  category?: string;
  search?: string;     // Full-text search on name + description
  sku?: string;        // Exact or prefix SKU match
  page?: number;
  limit?: number;
  sort?: string;       // e.g. 'name', '-createdAt'
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ─── List Products (with filtering, search, pagination) ──────
export const listProducts = async (
  options: ProductQueryOptions
): Promise<PaginatedResult<IProduct>> => {
  const {
    category,
    search,
    sku,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = options;

  // Build filter
  const filter: Record<string, any> = {};

  if (category) {
    filter.category = category;
  }

  if (sku) {
    // Support both exact and prefix search: "ELEC" matches "ELEC-KB-001"
    filter.sku = { $regex: `^${sku.toUpperCase()}`, $options: 'i' };
  }

  if (search) {
    // MongoDB text index search on name + description
    filter.$text = { $search: search };
  }

  // Pagination
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  const skip = (pageNum - 1) * limitNum;

  // Build sort object from string ("-createdAt" → { createdAt: -1 })
  const sortObj: Record<string, 1 | -1> = {};
  if (sort.startsWith('-')) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const [data, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
};

// ─── Get Product by ID ───────────────────────────────────────
export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

// ─── Get Product by SKU ──────────────────────────────────────
export const getProductBySku = async (sku: string): Promise<IProduct> => {
  const product = await Product.findOne({ sku: sku.toUpperCase() });
  if (!product) {
    throw new ApiError(404, `Product with SKU '${sku.toUpperCase()}' not found`);
  }
  return product;
};

// ─── Create Product ──────────────────────────────────────────
export const createProduct = async (data: {
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderLevel?: number;
  description?: string;
}): Promise<IProduct> => {
  // Check for duplicate SKU
  const existing = await Product.findOne({ sku: data.sku.toUpperCase() });
  if (existing) {
    throw new ApiError(409, `Product with SKU '${data.sku.toUpperCase()}' already exists`);
  }

  const product = await Product.create(data);
  return product;
};

// ─── Update Product ──────────────────────────────────────────
export const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    sku: string;
    category: string;
    unit: string;
    reorderLevel: number;
    description: string;
  }>
): Promise<IProduct> => {
  // If updating SKU, check for duplicates
  if (data.sku) {
    const existing = await Product.findOne({
      sku: data.sku.toUpperCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new ApiError(409, `SKU '${data.sku.toUpperCase()}' is already in use`);
    }
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

// ─── Delete Product ──────────────────────────────────────────
export const deleteProduct = async (id: string): Promise<IProduct> => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};
