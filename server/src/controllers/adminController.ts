import { Response } from 'express';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Resource } from '../models/Resource.js';
import { Category } from '../models/Category.js';
import { AuditLog } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      pendingCourses,
      totalEnrollments,
      totalResources,
      payments,
      recentUsers,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments({ status: 'published', approvalStatus: 'approved' }),
      Course.countDocuments({ approvalStatus: 'pending' }),
      Enrollment.countDocuments(),
      Resource.countDocuments(),
      Payment.find({ status: 'completed' }).select('amount currency'),
      User.find().sort({ createdAt: -1 }).limit(6).select('-password'),
      AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        pendingCourses,
        totalEnrollments,
        totalResources,
        totalRevenue,
      },
      recentUsers,
      recentAuditLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, role, status } = req.query;
    const query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q as string, $options: 'i' } },
        { email: { $regex: q as string, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.accountStatus = status;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended'

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.accountStatus = status;
    await user.save();

    await logAuditEvent({
      actorId: req.user?._id,
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: status === 'active' ? 'USER_REACTIVATED' : 'USER_SUSPENDED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { targetEmail: user.email, status },
    });

    res.status(200).json({ success: true, message: `User status changed to ${status}.`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.role = role;
    if (role === 'instructor') {
      user.instructorStatus = 'approved';
    }
    await user.save();

    await logAuditEvent({
      actorId: req.user?._id,
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'USER_ROLE_CHANGED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { targetEmail: user.email, newRole: role },
    });

    res.status(200).json({ success: true, message: `User role updated to ${role}.`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    const course = await Course.findById(id);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    if (action === 'approve') {
      course.approvalStatus = 'approved';
      course.status = 'published';
    } else {
      course.approvalStatus = 'rejected';
      course.rejectionReason = reason || 'Does not meet platform quality standards.';
    }

    await course.save();

    await logAuditEvent({
      actorId: req.user?._id,
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: action === 'approve' ? 'COURSE_APPROVED' : 'COURSE_REJECTED',
      targetType: 'Course',
      targetId: course._id.toString(),
      details: { title: course.title, reason },
    });

    res.status(200).json({
      success: true,
      message: `Course ${action === 'approve' ? 'approved and published' : 'rejected'}.`,
      course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
    res.status(200).json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'BookOpen',
    });

    res.status(201).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
