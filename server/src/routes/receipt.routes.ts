import { Router } from 'express';
import * as receiptController from '../controllers/receipt.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, receiptController.createReceipt);
router.get('/', authenticate, receiptController.listReceipts);

export default router;
