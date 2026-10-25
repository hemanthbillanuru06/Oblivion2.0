import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, IUser, UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'User no longer exists.' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
      const user = await User.findById(decoded.id);
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore invalid token for optional auth, continue as guest
    next();
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
};
