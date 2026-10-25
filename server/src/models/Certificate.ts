import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: Date;
  grade?: string;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    certificateId: { type: String, required: true, unique: true, index: true },
    studentName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    instructorName: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    grade: { type: String, default: 'Honors' },
    isValid: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);
