import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPurchaseHistory,
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/order', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/history', authenticateToken, getPurchaseHistory);

export default router;
