import mongoose, { Document, Schema } from 'mongoose';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ICourse extends Document {
  instructor: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  difficulty: DifficultyLevel;
  price: number;
  isFree: boolean;
  currency: string;
  estimatedDuration: string;
  learningObjectives: string[];
  prerequisites: string[];
  status: CourseStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  averageRating: number;
  totalReviews: number;
  totalEnrolled: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    subtitle: { type: String, default: '' },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, trim: true }],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
      index: true,
    },
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: true, index: true },
    currency: { type: String, default: 'USD' },
    estimatedDuration: { type: String, default: '2 hours' },
    learningObjectives: [{ type: String }],
    prerequisites: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalEnrolled: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
