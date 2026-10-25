import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, any>;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000 && err.keyValue) {
    statusCode = 409;
    const key = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${key}'. Please use an alternative.`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val: any) => val.message);
    message = messages.join('. ');
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found or invalid identifier format.';
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Error Detail]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
