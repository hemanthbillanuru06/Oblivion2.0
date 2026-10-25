import { Request, Response } from 'express';
import { Resource } from '../models/Resource.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, fileType, access, sort = 'newest', page = '1', limit = '12' } = req.query;

    const query: any = { isPublished: true };

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

    if (fileType && fileType !== 'All') {
      query.fileType = fileType;
    }

    if (access && access !== 'All') {
      query.access = access;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { downloadCount: -1 };
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('uploaderId', 'name profileImage')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      resources,
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

export const getResourceDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id).populate('uploaderId', 'name profileImage headline');

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found.' });
      return;
    }

    res.status(200).json({ success: true, resource });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { title, description, category, tags, access, fileType, fileUrl, fileSize } = req.body;

    let finalFileUrl = fileUrl || '';
    let finalFileName = title;
    let finalFileSize = fileSize || '1.0 MB';

    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
      finalFileName = req.file.originalname;
      const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(1);
      finalFileSize = `${sizeInMB} MB`;
    }

    if (!title || !description || !category) {
      res.status(400).json({ success: false, message: 'Title, description, and category are required.' });
      return;
    }

    const resource = await Resource.create({
      title,
      description,
      uploaderId: req.user._id,
      fileUrl: finalFileUrl || '/uploads/sample_resource.pdf',
      fileName: finalFileName,
      fileType: fileType || 'pdf',
      fileSize: finalFileSize,
      category,
      tags: typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : (tags || []),
      access: access || 'public',
      isPublished: true,
    });

    await logAuditEvent({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'RESOURCE_UPLOADED',
      targetType: 'Resource',
      targetId: resource._id.toString(),
      details: { title, fileType },
    });

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully.',
      resource,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found.' });
      return;
    }

    // Permission check
    if (resource.access === 'students_only' && !req.user) {
      res.status(403).json({
        success: false,
        message: 'This resource is available to registered students only. Please log in.',
      });
      return;
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    res.status(200).json({
      success: true,
      downloadUrl: resource.fileUrl,
      fileName: resource.fileName,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found.' });
      return;
    }

    if (resource.uploaderId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this resource.' });
      return;
    }

    await Resource.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Resource deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
