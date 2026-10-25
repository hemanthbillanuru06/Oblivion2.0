import { Lesson } from '../models/Lesson.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { Enrollment } from '../models/Enrollment.js';
import { Notification } from '../models/Notification.js';
import { generateCertificateForStudent } from './certificateService.js';
import mongoose from 'mongoose';

export const recalculateAndSyncCourseProgress = async (
  studentId: string | mongoose.Types.ObjectId,
  courseId: string | mongoose.Types.ObjectId,
  lastAccessedLessonId?: string | mongoose.Types.ObjectId
) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    return null;
  }

  // 1. Get total required lessons for this course
  const totalLessons = await Lesson.countDocuments({
    courseId,
    isRequired: true,
  });

  // 2. Get all completed progress records for required lessons
  const requiredLessons = await Lesson.find({
    courseId,
    isRequired: true,
  }).select('_id');

  const requiredLessonIds = requiredLessons.map((l) => l._id);

  const completedRecordsCount = await LessonProgress.countDocuments({
    studentId,
    courseId,
    lessonId: { $in: requiredLessonIds },
    isCompleted: true,
  });

  const percentage = totalLessons === 0 ? 100 : Math.min(100, Math.round((completedRecordsCount / totalLessons) * 100));
  const isNowCompleted = percentage >= 100;

  enrollment.completedLessonsCount = completedRecordsCount;
  enrollment.totalLessonsCount = totalLessons;
  enrollment.progressPercentage = percentage;
  enrollment.lastAccessedAt = new Date();

  if (lastAccessedLessonId) {
    enrollment.lastAccessedLesson = new mongoose.Types.ObjectId(lastAccessedLessonId);
  }

  const wasCompletedBefore = enrollment.isCompleted;

  if (isNowCompleted && !wasCompletedBefore) {
    enrollment.isCompleted = true;
    enrollment.status = 'completed';
    enrollment.completionDate = new Date();

    // Send achievement notification
    await Notification.create({
      userId: studentId,
      title: 'Course Completed! 🎉',
      message: 'Congratulations! You have completed all required lessons. Your certificate of completion is ready!',
      type: 'achievement',
      link: `/student/certificates`,
    });

    // Try auto-issuing certificate if final quiz satisfied
    try {
      await generateCertificateForStudent(studentId, courseId);
    } catch {
      // If quiz pending or other requirement, will be generated upon quiz pass
    }
  }

  await enrollment.save();
  return enrollment;
};
