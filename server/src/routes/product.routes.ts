import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import Product from '../models/Product';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── GET /api/products — List all products ──────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search, page = '1', limit = '20' } = req.query;

    // Build filter
    const filter: Record<string, any> = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search as string };

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  })
);

// ─── GET /api/products/:id — Get single product ─────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    res.json({ success: true, data: product });
  })
);

// ─── POST /api/products — Create product (auth required) ────
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  })
);

// ─── PUT /api/products/:id — Update product (auth required) ─
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    res.json({ success: true, data: product });
  })
);

// ─── DELETE /api/products/:id — Delete product (auth required)
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    res.json({ success: true, message: 'Product deleted' });
  })
);

export default router;
