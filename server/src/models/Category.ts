import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'BookOpen' },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
