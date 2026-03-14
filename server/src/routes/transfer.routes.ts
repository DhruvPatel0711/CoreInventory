import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, transferController.createTransfer);
router.get('/', authenticate, transferController.listTransfers);

export default router;
