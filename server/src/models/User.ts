import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'instructor' | 'admin';
export type AccountStatus = 'active' | 'suspended';
export type InstructorStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage: string;
  bio: string;
  headline: string;
  accountStatus: AccountStatus;
  instructorStatus: InstructorStatus;
  instructorApplicationReason?: string;
  bookmarks: {
    courses: mongoose.Types.ObjectId[];
    resources: mongoose.Types.ObjectId[];
  };
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student', index: true },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    headline: { type: String, default: '' },
    accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
    instructorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    instructorApplicationReason: { type: String, default: '' },
    bookmarks: {
      courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
      resources: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
