import { Router } from 'express';
import {
  getMyCertificates,
  claimCertificate,
  verifyCertificatePublic,
} from '../controllers/certificateController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticateToken, getMyCertificates);
router.post('/claim/:courseId', authenticateToken, claimCertificate);
// Public verification endpoint
router.get('/verify/:certificateId', verifyCertificatePublic);

export default router;
