import { AuditLog } from '../models/Notification.js';
import mongoose from 'mongoose';

export interface AuditLogParams {
  actorId?: mongoose.Types.ObjectId | string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export const logAuditEvent = async (params: AuditLogParams): Promise<void> => {
  try {
    await AuditLog.create({
      actorId: params.actorId ? new mongoose.Types.ObjectId(params.actorId) : undefined,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      ipAddress: params.ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog Error] Failed to write audit log:', err);
  }
};
