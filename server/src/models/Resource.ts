import mongoose, { Document, Schema } from 'mongoose';

export type ResourceFileType = 'pdf' | 'notes' | 'presentation' | 'code' | 'exercise' | 'doc' | 'ebook' | 'other';
export type ResourceAccess = 'public' | 'students_only' | 'paid_only';

export interface IResource extends Document {
  title: string;
  description: string;
  uploaderId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: ResourceFileType;
  fileSize: string;
  category: string;
  tags: string[];
  access: ResourceAccess;
  isPublished: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'notes', 'presentation', 'code', 'exercise', 'doc', 'ebook', 'other'],
      default: 'pdf',
      index: true,
    },
    fileSize: { type: String, default: '1.2 MB' },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, trim: true }],
    access: {
      type: String,
      enum: ['public', 'students_only', 'paid_only'],
      default: 'public',
      index: true,
    },
    isPublished: { type: Boolean, default: true, index: true },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Resource = mongoose.model<IResource>('Resource', resourceSchema);
