import { Router } from 'express';
import * as adjustmentController from '../controllers/adjustment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, adjustmentController.createAdjustment);
router.get('/', authenticate, adjustmentController.listAdjustments);

export default router;
