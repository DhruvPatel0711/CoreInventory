import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import receiptRoutes from './receipt.routes';
import deliveryRoutes from './delivery.routes';
import transferRoutes from './transfer.routes';
import adjustmentRoutes from './adjustment.routes';
import warehouseRoutes from './warehouse.routes';
import inventoryRoutes from './inventory.routes';
import analyticsRoutes from './analytics.routes';

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
router.use('/receipts', receiptRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

