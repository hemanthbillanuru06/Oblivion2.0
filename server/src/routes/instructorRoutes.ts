import { Router } from 'express';
import {
  getInstructorDashboard,
  getInstructorCourses,
  getInstructorStudents,
} from '../controllers/instructorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('instructor', 'admin'));

router.get('/dashboard', getInstructorDashboard);
router.get('/courses', getInstructorCourses);
router.get('/students', getInstructorStudents);

export default router;
