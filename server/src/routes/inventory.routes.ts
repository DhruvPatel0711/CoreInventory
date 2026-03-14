import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/inventory              — All stock levels (with product + location details)
// GET /api/inventory/:productId   — Stock breakdown for a single product
router.get('/', authenticate, inventoryController.listInventory);
router.get('/:productId', authenticate, inventoryController.getProductInventory);

export default router;
