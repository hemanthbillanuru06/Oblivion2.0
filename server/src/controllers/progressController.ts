import { Response } from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { AuthRequest } from '../middleware/auth.js';
import { recalculateAndSyncCourseProgress } from '../services/progressService.js';
import mongoose from 'mongoose';

// Full learning player data with permissions check
export const getCoursePlayerState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('instructor', 'name profileImage headline');
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // Role-based access check
    const isInstructor = course.instructor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    let enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });

    if (!enrollment && !isInstructor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access restricted: You must enroll in this course to view lesson materials.',
      });
      return;
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 }).lean();

    // Fetch user progress for all lessons in this course
    const progressRecords = await LessonProgress.find({
      studentId: req.user._id,
      courseId,
    }).lean();

    const progressMap: Record<string, boolean> = {};
    progressRecords.forEach((pr) => {
      progressMap[pr.lessonId.toString()] = pr.isCompleted;
    });

    const modulesWithLessons = modules.map((mod) => ({
      ...mod,
      lessons: lessons
        .filter((l) => l.moduleId.toString() === mod._id.toString())
        .map((l) => ({
          ...l,
          isCompleted: !!progressMap[l._id.toString()],
        })),
    }));

    res.status(200).json({
      success: true,
      course,
      curriculum: modulesWithLessons,
      enrollment,
      progressMap,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Lesson Complete
export const markLessonComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { courseId, lessonId } = req.params;

    const [course, lesson] = await Promise.all([
      Course.findById(courseId),
      Lesson.findById(lessonId),
    ]);

    if (!course || !lesson) {
      res.status(404).json({ success: false, message: 'Course or Lesson not found.' });
      return;
    }

    // Ensure student is enrolled
    let enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (!enrollment) {
      // Auto-enroll if free course or admin/instructor testing
      if (course.isFree || req.user.role === 'admin') {
        enrollment = await Enrollment.create({
          studentId: req.user._id,
          courseId,
          lastAccessedLesson: lesson._id,
        });
      } else {
        res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
        return;
      }
    }

    // Update or insert LessonProgress record
    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, courseId, lessonId },
      {
        studentId: req.user._id,
        courseId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate course progress
    const updatedEnrollment = await recalculateAndSyncCourseProgress(
      req.user._id,
      courseId,
      lessonId
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed.',
      progress,
      enrollment: updatedEnrollment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Lesson Incomplete (Toggle)
export const markLessonIncomplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { courseId, lessonId } = req.params;

    await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, courseId, lessonId },
      { isCompleted: false, lastAccessedAt: new Date() }
    );

    const updatedEnrollment = await recalculateAndSyncCourseProgress(
      req.user._id,
      courseId,
      lessonId
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as incomplete.',
      enrollment: updatedEnrollment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Last Accessed Lesson
export const updateLastAccessed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { courseId, lessonId } = req.params;

    await Enrollment.findOneAndUpdate(
      { studentId: req.user._id, courseId },
      {
        lastAccessedLesson: new mongoose.Types.ObjectId(lessonId),
        lastAccessedAt: new Date(),
      }
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
