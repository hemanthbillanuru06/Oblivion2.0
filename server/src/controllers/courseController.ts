import { Request, Response } from 'express';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Review } from '../models/Review.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';
import mongoose from 'mongoose';
// Public Course Catalog with search, filters, sorting, and pagination
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q,
      category,
      difficulty,
      price,
      minRating,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const query: any = {
      status: 'published',
      approvalStatus: 'approved',
    };

    if (q) {
      query.$or = [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (price === 'free') {
      query.isFree = true;
    } else if (price === 'paid') {
      query.isFree = false;
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating as string) };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { totalEnrolled: -1 };
    } else if (sort === 'highest-rated') {
      sortOption = { averageRating: -1, totalReviews: -1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name profileImage headline')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      courses,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Course Details with Modules, Lessons & Reviews
export const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    const course = await Course.findOne(query).populate('instructor', 'name profileImage headline bio');
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const modules = await Module.find({ courseId: course._id }).sort({ order: 1 }).lean();
    const lessons = await Lesson.find({ courseId: course._id })
      .select('courseId moduleId title description type duration isRequired order resources')
      .sort({ order: 1 })
      .lean();

    // Group lessons inside their modules
    const modulesWithLessons = modules.map((mod) => ({
      ...mod,
      lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
    }));

    const reviews = await Review.find({ courseId: course._id, status: 'approved' })
      .populate('studentId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      course,
      curriculum: modulesWithLessons,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Course (Instructor or Admin)
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const {
      title,
      subtitle,
      description,
      thumbnail,
      category,
      tags,
      difficulty,
      price,
      isFree,
      estimatedDuration,
      learningObjectives,
      prerequisites,
      status = 'draft',
    } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ success: false, message: 'Title, description, and category are required.' });
      return;
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const isPriceFree = isFree !== undefined ? isFree : (Number(price) === 0);

    const course = await Course.create({
      instructor: req.user._id,
      title,
      slug,
      subtitle: subtitle || '',
      description,
      thumbnail: thumbnail || '',
      category,
      tags: tags || [],
      difficulty: difficulty || 'Beginner',
      price: isPriceFree ? 0 : Number(price || 0),
      isFree: isPriceFree,
      estimatedDuration: estimatedDuration || '4 hours',
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      status,
      approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    await logAuditEvent({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'COURSE_CREATED',
      targetType: 'Course',
      targetId: course._id.toString(),
      details: { title, status },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Course
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    // Authorization check: only course instructor or admin can edit
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'You are not authorized to update this course.' });
      return;
    }

    const updatableFields = [
      'title',
      'subtitle',
      'description',
      'thumbnail',
      'category',
      'tags',
      'difficulty',
      'price',
      'isFree',
      'estimatedDuration',
      'learningObjectives',
      'prerequisites',
      'status',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (course as any)[field] = req.body[field];
      }
    });

    if (course.price === 0) {
      course.isFree = true;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Module Management
export const addModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    const count = await Module.countDocuments({ courseId });
    const module = await Module.create({
      courseId,
      title,
      description: description || '',
      order: count + 1,
    });

    res.status(201).json({ success: true, module });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lesson Management
export const addLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, type, videoUrl, content, duration, isRequired, resources } = req.body;

    const count = await Lesson.countDocuments({ moduleId });
    const lesson = await Lesson.create({
      courseId,
      moduleId,
      title,
      description: description || '',
      type: type || 'video',
      videoUrl: videoUrl || '',
      content: content || '',
      duration: duration || 10,
      isRequired: isRequired !== undefined ? isRequired : true,
      order: count + 1,
      resources: resources || [],
    });

    res.status(201).json({ success: true, lesson });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
