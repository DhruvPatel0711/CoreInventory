import { Router } from 'express';
import * as warehouseController from '../controllers/warehouse.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Basic list
router.get('/', authenticate, warehouseController.listWarehouses);

// Warehouse visualization API
router.get('/:id/locations', authenticate, warehouseController.getWarehouseLocations);

// Edit/Create endpoints
router.post('/', authenticate, warehouseController.createWarehouse);
router.put('/:id', authenticate, warehouseController.updateWarehouse);
router.post('/racks', authenticate, warehouseController.createRack);

export default router;
