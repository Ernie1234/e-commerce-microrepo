import { Request, Response, NextFunction } from 'express';

import { ValidationError } from '@packages/error-handler';
import prismaClient from '@packages/libs/prisma/prismadb';
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequest,
} from '../utils/auth-helper';

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller'
) => {
  try {
    // --- 1. Comprehensive Input Validation ---
    const { email } = req.body;
    if (!email) throw new ValidationError('Email is required');

    // --- 2. Check if user/seller exists ---
    const existingUser =
      userType === 'user' &&
      (await prismaClient.users.findUnique({
        where: { email },
      }));
    if (!existingUser) {
      throw new ValidationError('User not found');
    }

    // --- 3. Check OTP Restrictions ---
    await checkOtpRestrictions(email, next);
    await trackOtpRequest(email, next);

    // --- 4. Generate OTP and send Email ---
    await sendOtp(existingUser.name, email, 'Forgot-user-password-mail');

    res.status(200).json({
      status: 'success',
      message: 'Otp sent to your email. Please verify your account',
    });
  } catch (error) {
    next(error);
  }
};
