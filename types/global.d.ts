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
}

// Augment the 'express-serve-static-core' module directly.
// This is the most reliable way to add properties to Express's Request/Response objects,
// especially when 'isolatedModules' is enabled.
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

export {};
