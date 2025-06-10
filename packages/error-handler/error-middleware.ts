import { Request, Response, NextFunction } from 'express';

import { AppError } from './index';

/**
 * Global Error Handling Middleware for Express.
 * This middleware catches errors thrown in route handlers, middleware, and
 * asynchronous operations, formatting them into a consistent JSON response.
 *
 * @param {Error} err - The error object caught by Express.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function (required even if not used).
 */

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);
  if (err instanceof AppError) {
    if (!err.isOperational) {
      console.error(`[FATAL] Non-operational error encountered:`, err); // Log more critically
      // In production, send a generic error message for programming errors
      // For development, you might still want to show the message.
      const statusCode = 500;
      const message = 'Something went wrong, please try again later!';

      return res.status(statusCode).json({
        status: 'error',
        message: message,
        // In development, you might include the original message for debugging
        ...(process.env.NODE_ENV === 'development' && {
          developerMessage: err.message,
          stack: err.stack,
        }),
      });
    }

    // For operational errors, send the custom message and status code
    console.log(
      `[OPERATIONAL ERROR] ${req.method} ${req.url} - ${err.message}`
    );

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      // Only include details if it's an object and not null/undefined
      ...(typeof err.details === 'object' &&
        err.details !== null && { details: err.details }),
    });
  }

  // Handle all other unhandled/programming errors (not instances of AppError)
  // These are typically unexpected runtime errors or bugs.
  // In production, these should generally return a generic error message.
  const statusCode = 500;
  const message = 'Something went wrong, please try again!';

  return res.status(statusCode).json({
    status: 'error', // Consistent error status
    message: message,
    // Include stack trace and full error message only in development for debugging
    ...(process.env.NODE_ENV === 'development' && {
      developerMessage: err.message,
      stack: err.stack,
    }),
  });
};
