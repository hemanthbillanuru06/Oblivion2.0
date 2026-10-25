import { Router } from 'express';
import {
  enrollFreeCourse,
  getMyEnrollments,
  checkEnrollment,
} from '../controllers/enrollmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticateToken, getMyEnrollments);
router.get('/check/:courseId', authenticateToken, checkEnrollment);
router.post('/free/:courseId', authenticateToken, enrollFreeCourse);

export default router;
