import mongoose, { Document, Schema } from 'mongoose';

export type LessonType = 'video' | 'text' | 'quiz' | 'assignment';

export interface ILessonResource {
  title: string;
  url: string;
  fileType: string;
  fileSize?: string;
}

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: LessonType;
  videoUrl?: string;
  content?: string;
  duration: number; // in minutes
  isRequired: boolean;
  order: number;
  resources: ILessonResource[];
  quizId?: mongoose.Types.ObjectId;
  assignmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const lessonResourceSchema = new Schema<ILessonResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, default: 'pdf' },
    fileSize: { type: String, default: '' },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['video', 'text', 'quiz', 'assignment'], default: 'video' },
    videoUrl: { type: String, default: '' },
    content: { type: String, default: '' },
    duration: { type: Number, default: 10 },
    isRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    resources: [lessonResourceSchema],
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, moduleId: 1, order: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
