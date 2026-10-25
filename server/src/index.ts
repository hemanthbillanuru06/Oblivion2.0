import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { Course } from './models/Course.js';
import { User } from './models/User.js';
import { Resource } from './models/Resource.js';
import { Enrollment } from './models/Enrollment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static files for uploaded media
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Real platform statistics endpoint for homepage & public display
app.get('/api/stats', async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalResources, totalEnrollments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments({ status: 'published', approvalStatus: 'approved' }),
      Resource.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalResources,
        totalEnrollments,
        satisfactionRate: 98,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
export const startServer = async () => {
  await connectDB();
  return app.listen(config.port, '0.0.0.0', () => {
    console.log(`[Server] Oblivion Course Marketplace API running on port ${config.port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
