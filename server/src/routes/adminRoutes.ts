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
router.get('/categories', getCategories);

// All other admin endpoints protected by admin role
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.post('/courses/:id/moderate', moderateCourse);
router.get('/audit-logs', getAuditLogs);
router.post('/categories', createCategory);

export default router;
