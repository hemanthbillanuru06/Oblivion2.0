import { Router } from 'express';
import {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  updateUserRole,
  moderateCourse,
  getAuditLogs,
  getCategories,
  createCategory,
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Categories public read
router.get('/categories', getCategories as any);

// All other admin endpoints protected by admin role
router.use(authenticateToken as any, authorizeRoles('admin') as any);

router.get('/dashboard', getAdminDashboard as any);
router.get('/users', getUsers as any);
router.put('/users/:id/status', updateUserStatus as any);
router.put('/users/:id/role', updateUserRole as any);
router.post('/courses/:id/moderate', moderateCourse as any);
router.get('/audit-logs', getAuditLogs as any);
router.post('/categories', createCategory as any);

export default router;
