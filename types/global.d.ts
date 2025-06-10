import {
  BaseRegistrationData,
  SellerRegistrationData,
} from '../apps/auth-service/src/validators/joiValidation';

/**
 * @fileoverview Global type declarations for Node.js specific features.
 * This file extends the built-in ErrorConstructor interface to include
 * the captureStackTrace method, which is available in Node.js environments.
 */
declare global {
  interface ErrorConstructor {
    /**
     * @param {object} targetObject - The object on which to capture the stack trace.
     * @param {Function} [constructorOpt] - An optional function that marks the top of the stack trace.
     * All frames above constructorOpt will be omitted.
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
  }
  namespace Express {
    interface Request {
      validatedData?: BaseRegistrationData | SellerRegistrationData | any;
      validatedBody?: BaseRegistrationData | SellerRegistrationData | any;

      validatedQuery?: any;

      validatedParams?: any;
    }
  }
}

export {};
