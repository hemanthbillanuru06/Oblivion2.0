import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  toggleBookmark,
  applyInstructor,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/bookmark', authenticateToken, toggleBookmark);
router.post('/apply-instructor', authenticateToken, applyInstructor);

export default router;
