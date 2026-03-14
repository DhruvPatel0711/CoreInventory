import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorise } from '../middleware/role.middleware';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────
// GET  /api/products              — List products (filter, search, paginate)
// GET  /api/products/sku/:sku     — Get product by exact SKU
// GET  /api/products/:id          — Get product by ID
router.get('/', productController.listProducts);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/:id', productController.getProductById);

// ─── Protected Routes (auth required) ────────────────────────
// POST   /api/products            — Create product
// PUT    /api/products/:id        — Update product
// DELETE /api/products/:id        — Delete product (admin/manager only)
router.post('/', authenticate, productController.createProduct);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, authorise('admin', 'manager'), productController.deleteProduct);

export default router;
