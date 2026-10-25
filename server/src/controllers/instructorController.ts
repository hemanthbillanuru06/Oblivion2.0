import { Response } from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export const getInstructorDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const instructorId = req.user._id;

    // Courses by this instructor
    const courses = await Course.find({ instructor: instructorId }).lean();
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === 'published').length;
    const draftCourses = courses.filter((c) => c.status === 'draft').length;

    // Enrollments in these courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email profileImage')
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .lean();

    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter((e) => e.isCompleted).length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Revenue calculation
    const payments = await Payment.find({
      courseId: { $in: courseIds },
      status: 'completed',
    }).lean();

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Reviews
    const reviews = await Review.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name profileImage')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments,
        completionRate,
        totalRevenue,
        recentEnrollments: enrollments.slice(0, 8),
        reviews,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstructorCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstructorStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = courses.map((c) => c._id);

    const students = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email profileImage')
      .populate('courseId', 'title slug')
      .populate('lastAccessedLesson', 'title')
      .sort({ lastAccessedAt: -1 })
      .lean();

    res.status(200).json({ success: true, students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
