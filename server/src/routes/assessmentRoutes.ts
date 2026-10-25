import { Router } from 'express';
import {
  getCourseQuizzes,
  getQuizById,
  submitQuizAttempt,
  createQuiz,
  getCourseAssignments,
  submitAssignment,
  gradeAssignment,
} from '../controllers/assessmentController.js';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Quizzes
router.get('/courses/:courseId/quizzes', optionalAuth, getCourseQuizzes);
router.get('/quizzes/:id', optionalAuth, getQuizById);
router.post('/quizzes/:id/submit', authenticateToken, submitQuizAttempt);
router.post('/quizzes', authenticateToken, authorizeRoles('instructor', 'admin'), createQuiz);

// Assignments
router.get('/courses/:courseId/assignments', getCourseAssignments);
router.post('/assignments/:id/submit', authenticateToken, submitAssignment);
router.post('/assignments/submissions/:submissionId/grade', authenticateToken, authorizeRoles('instructor', 'admin'), gradeAssignment);

export default router;
