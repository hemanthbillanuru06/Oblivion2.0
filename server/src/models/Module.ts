import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

moduleSchema.index({ courseId: 1, order: 1 });

export const Module = mongoose.model<IModule>('Module', moduleSchema);
