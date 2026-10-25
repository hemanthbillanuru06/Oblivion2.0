import { Request, Response } from 'express';
import { Certificate } from '../models/Certificate.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateCertificateForStudent } from '../services/certificateService.js';

export const getMyCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const certificates = await Certificate.find({ studentId: req.user._id })
      .populate('courseId', 'title thumbnail category slug')
      .sort({ issueDate: -1 })
      .lean();

    res.status(200).json({ success: true, certificates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const claimCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { courseId } = req.params;

    const cert = await generateCertificateForStudent(req.user._id, courseId);

    res.status(200).json({
      success: true,
      message: 'Certificate issued successfully!',
      certificate: cert,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public Verification Endpoint
export const verifyCertificatePublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({ certificateId }).populate('courseId', 'title category thumbnail');

    if (!cert) {
      res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found. This credential ID does not exist in our registry.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      valid: cert.isValid,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        instructorName: cert.instructorName,
        issueDate: cert.issueDate,
        grade: cert.grade,
        isValid: cert.isValid,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
