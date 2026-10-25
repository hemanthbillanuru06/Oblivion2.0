import { Router } from 'express';
import {
  getResources,
  getResourceDetails,
  uploadResource,
  downloadResource,
  deleteResource,
} from '../controllers/resourceController.js';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getResources);
router.get('/:id', getResourceDetails);
router.post(
  '/',
  authenticateToken,
  authorizeRoles('instructor', 'admin'),
  upload.single('file'),
  uploadResource
);
router.get('/:id/download', optionalAuth, downloadResource);
router.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), deleteResource);

export default router;
