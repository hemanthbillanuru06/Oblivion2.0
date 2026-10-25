import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  provider: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    provider: { type: String, default: 'mock' },
    transactionId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String, default: 'card' },
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
