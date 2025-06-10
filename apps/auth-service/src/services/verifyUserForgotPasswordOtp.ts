import { ValidationError } from '@packages/error-handler';
import { Request, Response, NextFunction } from 'express';
import { verifyOtp } from '../utils/auth-helper';

export const verifyUserForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    // --- 1. Comprehensive Input Validation ---
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!otp) missingFields.push('password');
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}.`
      );
    }

    await verifyOtp({ email, otp });

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully! You can now reset your password.',
    });
  } catch (error) {
    next(error);
  }
};
