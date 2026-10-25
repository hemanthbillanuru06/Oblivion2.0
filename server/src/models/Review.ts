import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  status: 'approved' | 'flagged' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ['approved', 'flagged', 'hidden'], default: 'approved', index: true },
  },
  { timestamps: true }
);

reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
