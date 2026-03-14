import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────
router.post('/register', authController.register);
router.post('/login', authController.login);

// ─── Protected Routes ────────────────────────────────────────
router.get('/me', authenticate, authController.getMe);

export default router;
