import { Certificate, ICertificate } from '../models/Certificate.js';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

export const generateCertificateForStudent = async (
  studentId: string | mongoose.Types.ObjectId,
  courseId: string | mongoose.Types.ObjectId
): Promise<ICertificate> => {
  // Check if certificate already exists
  const existingCert = await Certificate.findOne({ studentId, courseId });
  if (existingCert) {
    return existingCert;
  }

  // Verify enrollment and completion
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    throw new Error('Student is not enrolled in this course.');
  }

  if (enrollment.progressPercentage < 100) {
    throw new Error(`Cannot issue certificate: Course progress is ${enrollment.progressPercentage}%, 100% required.`);
  }

  // Check if final quiz exists and must be passed
  const finalQuiz = await Quiz.findOne({ courseId, isFinalQuiz: true });
  if (finalQuiz) {
    const passedAttempt = await QuizAttempt.findOne({
      studentId,
      quizId: finalQuiz._id,
      passed: true,
    });
    if (!passedAttempt) {
      throw new Error('Cannot issue certificate: Final course quiz has not been passed.');
    }
  }

  const [student, course] = await Promise.all([
    User.findById(studentId),
    Course.findById(courseId).populate('instructor', 'name'),
  ]);

  if (!student || !course) {
    throw new Error('Student or Course information not found.');
  }

  const instructorName = (course.instructor as any)?.name || 'Lead Instructor';
  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const cert = await Certificate.create({
    studentId,
    courseId,
    certificateId,
    studentName: student.name,
    courseTitle: course.title,
    instructorName,
    issueDate: new Date(),
    grade: 'Excellence with Honors',
    isValid: true,
  });

  return cert;
};
