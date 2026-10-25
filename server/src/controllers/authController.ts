import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { config } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';
import mongoose from 'mongoose';

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Only allow 'student' or 'instructor' on self-registration; never allow 'admin'
    const assignedRole = role === 'instructor' ? 'instructor' : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      instructorStatus: assignedRole === 'instructor' ? 'approved' : 'none',
      accountStatus: 'active',
      emailVerified: true,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        headline: user.headline,
        bio: user.bio,
        bookmarks: user.bookmarks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrator support.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        headline: user.headline,
        bio: user.bio,
        bookmarks: user.bookmarks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('bookmarks.courses', 'title slug thumbnail category difficulty price isFree')
      .populate('bookmarks.resources', 'title fileType fileSize category');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, bio, headline, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (headline !== undefined) user.headline = headline;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        headline: user.headline,
        bio: user.bio,
        bookmarks: user.bookmarks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { type, itemId } = req.body; // type: 'course' | 'resource'
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (!user.bookmarks) {
      user.bookmarks = { courses: [], resources: [] };
    }

    const objectId = new mongoose.Types.ObjectId(itemId);

    if (type === 'course') {
      const index = user.bookmarks.courses.findIndex((id) => id.toString() === itemId);
      if (index > -1) {
        user.bookmarks.courses.splice(index, 1);
      } else {
        user.bookmarks.courses.push(objectId);
      }
    } else if (type === 'resource') {
      const index = user.bookmarks.resources.findIndex((id) => id.toString() === itemId);
      if (index > -1) {
        user.bookmarks.resources.splice(index, 1);
      } else {
        user.bookmarks.resources.push(objectId);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      bookmarks: user.bookmarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyInstructor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { reason, headline, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.instructorStatus = 'pending';
    user.instructorApplicationReason = reason || '';
    if (headline) user.headline = headline;
    if (bio) user.bio = bio;

    await user.save();

    await logAuditEvent({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'INSTRUCTOR_APPLICATION_SUBMITTED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { reason },
    });

    res.status(200).json({
      success: true,
      message: 'Instructor application submitted for administrative review.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
