import { Response } from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { AuthRequest } from '../middleware/auth.js';
import { recalculateAndSyncCourseProgress } from '../services/progressService.js';
import { Notification } from '../models/Notification.js';

export const enrollFreeCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const courseId = req.params.courseId as string;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    if (!course.isFree && course.price > 0) {
      res.status(400).json({
        success: false,
        message: 'This is a paid course. Please complete payment to enroll.',
      });
      return;
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (existing) {
      res.status(200).json({
        success: true,
        message: 'You are already enrolled in this course.',
        enrollment: existing,
      });
      return;
    }

    // Find first lesson for initial lastAccessedLesson
    const firstLesson = await Lesson.findOne({ courseId }).sort({ order: 1 });
    const totalRequired = await Lesson.countDocuments({ courseId, isRequired: true });

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId,
      status: 'active',
      enrollmentDate: new Date(),
      lastAccessedLesson: firstLesson?._id,
      lastAccessedAt: new Date(),
      completedLessonsCount: 0,
      totalLessonsCount: totalRequired,
      progressPercentage: 0,
      isCompleted: false,
    });

    // Increment course totalEnrolled
    await Course.findByIdAndUpdate(courseId, { $inc: { totalEnrolled: 1 } });

    // Send notification
    await Notification.create({
      userId: req.user._id,
      title: 'Enrolled Successfully! 🚀',
      message: `You are now enrolled in "${course.title}". Start learning today!`,
      type: 'enrollment',
      link: `/learning/${course._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully!',
      enrollment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate({
        path: 'courseId',
        select: 'title slug thumbnail category difficulty price isFree estimatedDuration averageRating totalReviews',
        populate: { path: 'instructor', select: 'name profileImage' },
      })
      .populate('lastAccessedLesson', 'title order duration')
      .sort({ lastAccessedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ isEnrolled: false });
      return;
    }

    const courseId = req.params.courseId as string;
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    }).populate('lastAccessedLesson', 'title order');

    res.status(200).json({
      isEnrolled: !!enrollment,
      enrollment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
