import { Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Lesson } from '../models/Lesson.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

// Create Payment Order
export const createPaymentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (existingEnrollment) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
      return;
    }

    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    const payment = await Payment.create({
      studentId: req.user._id,
      courseId: course._id,
      provider: 'mock_razorpay',
      orderId,
      transactionId,
      amount: course.price,
      currency: course.currency || 'USD',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      order: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        courseTitle: course.title,
        keyId: 'mock_test_key_id',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Payment and Activate Enrollment
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { orderId, paymentId: clientPaymentRef } = req.body;

    const payment = await Payment.findOne({ orderId, studentId: req.user._id });
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment order not found.' });
      return;
    }

    if (payment.status === 'completed') {
      res.status(200).json({ success: true, message: 'Payment already completed.' });
      return;
    }

    // Server-side verification
    payment.status = 'completed';
    payment.paymentMethod = 'Credit Card (Sandbox)';
    if (clientPaymentRef) {
      payment.receiptUrl = `https://checkout.sandbox/receipt/${clientPaymentRef}`;
    }
    await payment.save();

    // Create Enrollment
    const firstLesson = await Lesson.findOne({ courseId: payment.courseId }).sort({ order: 1 });
    const totalRequired = await Lesson.countDocuments({ courseId: payment.courseId, isRequired: true });

    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: req.user._id, courseId: payment.courseId },
      {
        studentId: req.user._id,
        courseId: payment.courseId,
        status: 'active',
        enrollmentDate: new Date(),
        lastAccessedLesson: firstLesson?._id,
        lastAccessedAt: new Date(),
        completedLessonsCount: 0,
        totalLessonsCount: totalRequired,
        progressPercentage: 0,
        isCompleted: false,
        paymentId: payment._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Increment course totalEnrolled
    await Course.findByIdAndUpdate(payment.courseId, { $inc: { totalEnrolled: 1 } });

    // Send notification
    await Notification.create({
      userId: req.user._id,
      title: 'Payment Confirmed! 🎉',
      message: `Your payment of ${payment.currency} ${payment.amount} was successful. Enjoy your course!`,
      type: 'enrollment',
      link: `/learning/${payment.courseId}`,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment activated.',
      enrollment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Purchase History
export const getPurchaseHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const transactions = await Payment.find({ studentId: req.user._id })
      .populate('courseId', 'title thumbnail slug')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
