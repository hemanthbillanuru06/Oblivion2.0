import mongoose, { Document, Schema } from 'mongoose';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  lastAccessedLesson?: mongoose.Types.ObjectId;
  lastAccessedAt?: Date;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  isCompleted: boolean;
  completionDate?: Date;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active', index: true },
    enrollmentDate: { type: Date, default: Date.now },
    lastAccessedLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    lastAccessedAt: { type: Date, default: Date.now },
    completedLessonsCount: { type: Number, default: 0 },
    totalLessonsCount: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    isCompleted: { type: Boolean, default: false, index: true },
    completionDate: { type: Date },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
