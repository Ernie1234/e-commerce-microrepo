import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
import { setCookies } from '../utils/helper/setCookies';
import { handleForgotPassword } from '../services/handleForgotPassword';
import { verifyUserForgotPasswordOtp } from '../services/verifyUserForgotPasswordOtp';

// --- Register User ---
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

// --- Verify User ---
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

// --- Login User ---
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // --- 1. Comprehensive Input Validation ---
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}.`
      );
    }

    // --- 2. Check if user exists ---
    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });
    if (!existingUser) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // --- 3. Check password ---
    const isPassMatch = await bcrypt.compare(
      password,
      existingUser.password || ''
    );
    if (!isPassMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // --- 4. Generate JWT token ---
    const accessToken = jwt.sign(
      {
        id: existingUser.id,
        role: 'user',
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      {
        id: existingUser.id,
        role: 'user',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // 5. Store refresh and access token in cookies
    setCookies(res, 'refreshToken', refreshToken);
    setCookies(res, 'accessToken', accessToken);

    // --- 5. Send Success Response ---
    res.status(200).json({
      status: 'success',
      message: 'Login successfully!',
      data: {
        ...existingUser,
        password: undefined,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --- Forgot Password ---
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // --- 1. Handle Forgot Password Service ---
    await handleForgotPassword(req, res, next, 'user');
  } catch (error) {
    return next(error);
  }
};

// --- Verify User Forgot Password OTP ---
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // --- 1. Handle Forgot Password Service ---
    await verifyUserForgotPasswordOtp(req, res, next);
  } catch (error) {
    return next(error);
  }
};

// --- Reset User Password ---
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    // --- 1. Comprehensive Input Validation ---
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!newPassword) missingFields.push('password');
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}.`
      );
    }

    // --- 2. Check if user exists ---
    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });
    if (!existingUser) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // --- 3. Compare passwords if they are the same ---
    const isSamePassword = await bcrypt.compare(
      newPassword,
      existingUser.password || ''
    );
    if (isSamePassword) {
      throw new ValidationError(
        'New password cannot be the same as the old one'
      );
    }

    // --- 4. Hash the password  and create the user ---
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prismaClient.users.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // --- 5. Send Success Response ---
    res.status(200).json({
      status: 'success',
      message: 'Login successfully!',
      data: {
        ...updatedUser,
        password: undefined,
      },
    });
  } catch (error) {
    return next(error);
  }
};
