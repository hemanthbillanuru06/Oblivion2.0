import { Router } from 'express';
import {
  getCoursePlayerState,
  markLessonComplete,
  markLessonIncomplete,
  updateLastAccessed,
} from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/player/:courseId', authenticateToken, getCoursePlayerState);
router.post('/complete/:courseId/:lessonId', authenticateToken, markLessonComplete);
router.post('/incomplete/:courseId/:lessonId', authenticateToken, markLessonIncomplete);
router.post('/access/:courseId/:lessonId', authenticateToken, updateLastAccessed);

export default router;
