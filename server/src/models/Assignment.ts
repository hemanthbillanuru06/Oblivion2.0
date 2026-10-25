import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  title: string;
  instructions: string;
  dueDate?: Date;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    dueDate: { type: Date },
    maxScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

export interface IAssignmentSubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  submissionText: string;
  attachmentUrl?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  gradedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    submissionText: { type: String, required: true },
    attachmentUrl: { type: String, default: '' },
    grade: { type: Number },
    feedback: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted', index: true },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
  'AssignmentSubmission',
  assignmentSubmissionSchema
);
