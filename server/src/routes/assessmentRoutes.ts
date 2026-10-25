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
router.get('/courses/:courseId/quizzes', optionalAuth as any, getCourseQuizzes as any);
router.get('/quizzes/:id', optionalAuth as any, getQuizById as any);
router.post('/quizzes/:id/submit', authenticateToken as any, submitQuizAttempt as any);
router.post('/quizzes', authenticateToken as any, authorizeRoles('instructor', 'admin') as any, createQuiz as any);

// Assignments
router.get('/courses/:courseId/assignments', getCourseAssignments as any);
router.post('/assignments/:id/submit', authenticateToken as any, submitAssignment as any);
router.post('/assignments/submissions/:submissionId/grade', authenticateToken as any, authorizeRoles('instructor', 'admin') as any, gradeAssignment as any);

export default router;
