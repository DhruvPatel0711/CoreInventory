import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.get('/dashboard', authenticate, analyticsController.getDashboard);
router.get('/health', authenticate, analyticsController.getHealth);
router.get('/movements', authenticate, analyticsController.getMovementTrends);

export default router;
