import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';

const router = Router();

// ─── Health Check ────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CoreInventory API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── Mount Module Routes ─────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Add remaining module routes here as you build them:
//   router.use('/receipts',    receiptRoutes);
//   router.use('/deliveries',  deliveryRoutes);
//   router.use('/transfers',   transferRoutes);
//   router.use('/adjustments', adjustmentRoutes);
//   router.use('/warehouses',  warehouseRoutes);
//   router.use('/inventory',   inventoryRoutes);
//   router.use('/analytics',   analyticsRoutes);

export default router;

