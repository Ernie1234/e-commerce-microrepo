import { NextFunction } from 'express';
import crypto from 'crypto';

import { sendEmail } from './mail';
import { UnauthorizedError, ValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';

// Regex for basic email format validation.
// Ensures there's text before '@', text after '@', and text after a '.'
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @interface BaseRegistrationData
 * @description Defines the common fields required for any type of user registration.
 */
interface BaseRegistrationData {
  name: string;
  email: string;
  password: string; // Assuming password is always required for registration
  country: string;
}

/**
 * @interface SellerRegistrationData
 * @augments BaseRegistrationData
 * @description Extends BaseRegistrationData to include fields specific to seller registration.
 */
interface SellerRegistrationData extends BaseRegistrationData {
  phone_number: string;
}

/**
 * @type RegistrationData
 * @description A union type representing all possible shapes of registration data.
 * This allows the function to accept either basic user data or seller-specific data.
 */
type RegistrationData = BaseRegistrationData | SellerRegistrationData;

/**
 * Validates the registration data for a new user or seller.
 * It checks for missing required fields and basic email format.
 *
 * @param {RegistrationData} data - The object containing registration fields (name, email, password, etc.).
 * @param {'user' | 'seller'} userType - Specifies whether the data is for a 'user' or a 'seller'.
 * @returns {ValidationError | void} Returns a ValidationError instance if validation fails,
 * otherwise returns nothing (void) if validation passes.
 */
export const validateRegistrationData = (
  // Corrected function name: "Date" changed to "Data"
  data: RegistrationData,
  userType: 'user' | 'seller'
): ValidationError | void => {
  // Explicitly define return type

  // Destructure common fields from the data object for easier access.
  // The 'phone_number' is conditionally destructured below as it's seller-specific.
  const { name, email, password } = data;

  // --- Step 1: Check for Missing Common Required Fields ---
  // If any of these core fields are missing, return a ValidationError.
  if (!name || !email || !password) {
    throw new ValidationError('Missing required fields.');
  }

  // --- Step 2: Conditionally Check Seller-Specific Fields ---
  // If the userType is 'seller', ensure 'phone_number' is also present.
  // We explicitly cast `data` to `SellerRegistrationData` here to safely access `phone_number`
  // based on the `userType` check.
  if (userType === 'seller') {
    const sellerData = data as SellerRegistrationData; // Type assertion for safety
    if (!sellerData.phone_number) {
      throw new ValidationError(
        'Missing seller-specific required field: phone number.'
      );
    }
  }

  // --- Step 3: Validate Email Format ---
  // Use the regex to test if the provided email string has a valid format.
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format.');
  }

  // If all checks pass, the function implicitly returns undefined (void).
  // No explicit 'return;' is needed here.
};

// Note: The 'crypto' import is present but not used in this specific function.
// If it's intended for hashing passwords elsewhere, that's fine.
// If it's not used at all in this file, you can remove the import to keep the code clean.

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError('Please wait before requesting another OTP.')
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        'You have exceeded the OTP request limit. Please try again later.'
      )
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError('Please wait before requesting another OTP.')
    );
  }
};

export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequest = parseInt((await redis.get(otpRequestKey)) || '0', 10);

  if (otpRequest >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 600 * 5); //
    return next(
      new ValidationError(
        'You have exceeded the OTP request limit. Please try again later.'
      )
    );
  }

  await redis.set(otpRequestKey, otpRequest + 1, 'EX', 60 * 5); //
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  await sendEmail(email, 'OTP Verification', template, {
    name,
    otp,
  });
  // Store OTP in Redis with a 5-minute expiration.
  await redis.set(`otp:${email}`, otp, 'EX', 300);
  // Set a lock to prevent multiple OTP requests within a minute.
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    // OTP expired or never sent
    throw new UnauthorizedError(
      'Invalid or expired OTP. Please request a new one.'
    );
  }

  // Check if the OTP has expired
  const failedAttemptsKey = `otp_failed_attempts:${email}`;
  const failedAttempts = parseInt(
    (await redis.get(failedAttemptsKey)) || '0',
    10
  );

  // Mismatched OTP
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 60 * 5); // Lock for 5 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new UnauthorizedError(
        'Too many failed attempts. Please try again later.'
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 60 * 5); // Lock for 5 minutes
    throw new ValidationError(
      `Invalid OTP. ${2 - failedAttempts} attemps left. Please try again.`
    );
  }
  // OTP is valid, clear any failed attempts and locks
  await redis.del(
    `otp:${email}`,
    failedAttemptsKey,
    `otp_cooldown:${email}`,
    `otp_lock:${email}`,
    `otp_spam_lock:${email}`
  );
};
