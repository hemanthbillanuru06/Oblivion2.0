import { Router } from 'express';
import {
  getCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  addModule,
  addLesson,
} from '../controllers/courseController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/:identifier', getCourseDetails);

// Instructor / Admin routes
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), createCourse);
router.put('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), updateCourse);
router.post('/:courseId/modules', authenticateToken, authorizeRoles('instructor', 'admin'), addModule);
router.post('/:courseId/modules/:moduleId/lessons', authenticateToken, authorizeRoles('instructor', 'admin'), addLesson);

export default router;
