import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import { UnauthorizedError, ValidationError } from '@packages/error-handler';
import prismaClient from '@packages/libs/prisma/prismadb';
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequest,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth-helper';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });

    if (existingUser) next(new ValidationError('User already exists'));

    await checkOtpRestrictions(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, 'User-activation-mail');

    res.status(200).json({
      status: 'success',
      message: 'Otp sent to your email. Please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    // --- 1. Comprehensive Input Validation ---
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!otp) missingFields.push('OTP');
    if (!password) missingFields.push('password');
    if (!name) missingFields.push('name');

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}.`
      );
    }

    // --- 2. Check OTP in Redis ---
    await verifyOtp({ email, otp });

    // --- 3. Check if user exists ---
    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedError('User already exists. Please log in.');
    }

    // --- 4. Hash the password  and create the user ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.users.create({
      data: {
        password: hashedPassword,
        name,
        email,
      },
    });

    // --- 5. Send Success Response ---
    res.status(200).json({
      status: 'success',
      message: 'Account verified successfully!',
      data: {
        ...newUser,
        password: undefined,
      },
    });
  } catch (error) {
    return next(error);
  }
};
