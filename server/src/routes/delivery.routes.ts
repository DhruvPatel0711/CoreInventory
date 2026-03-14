import { Router } from 'express';
import * as deliveryController from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, deliveryController.createDelivery);
router.get('/', authenticate, deliveryController.listDeliveries);

export default router;
