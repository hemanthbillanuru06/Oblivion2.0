import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt?: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    isCompleted: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ studentId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema);
