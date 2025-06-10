/**
 * @fileoverview Defines custom error classes for the application.
 * These classes extend the built-in Error class to add specific properties
 * like HTTP status codes, operational flags, and optional details,
 * enabling more structured and granular error handling across your microservices.
 */

/**
 * @class AppError
 * @augments Error
 * @description Base custom error class for the application.
 * It extends the native JavaScript `Error` class to include:
 * - `statusCode`: An HTTP status code (e.g., 400, 404, 500).
 * - `isOperational`: A boolean flag to distinguish between expected/operational errors
 * (e.g., invalid input, resource not found) and programming errors (bugs).
 * Operational errors can be safely exposed to the client, while programming
 * errors should typically be hidden and logged for developer investigation.
 * - `details`: Optional, additional data or context related to the error.
 *
 * This structured approach helps in building a robust global error handling middleware
 * that can format and respond to different types of errors appropriately.
 */
export class AppError extends Error {
  /**
   * @property {number} statusCode - The HTTP status code associated with the error.
   * This is crucial for sending appropriate HTTP responses back to API clients.
   * For example, 400 for bad request, 404 for not found, 500 for server error.
   */
  public readonly statusCode: number;

  /**
   * @property {boolean} isOperational - A flag indicating if the error is an "operational" error.
   * - `true` (default): The error is a known and anticipated issue (e.g., validation failure,
   * invalid credentials, resource not found). These can often be handled gracefully
   * and their messages can be safely exposed to the client.
   * - `false`: The error is a "programming" error (e.g., a bug in the code, unhandled exception).
   * These are unexpected and should typically not expose sensitive details to the client;
   * instead, a generic 500 message is sent, and the error is logged for developer debugging.
   */
  public readonly isOperational: boolean;

  /**
   * @property {unknown} [details] - Optional, additional data or context related to the error.
   * This can include validation errors, specific identifiers, or any other relevant information
   * that helps debug or inform the client more precisely.
   * Using `unknown` here is safer than `any` as it forces explicit type checking
   * before you can use the `details` property, ensuring type safety.
   */
  public readonly details?: unknown; // Corrected: Changed 'any' to 'unknown' for type safety

  /**
   * @constructor
   * @param {string} message - A human-readable error message that describes the problem.
   * @param {number} statusCode - The HTTP status code for this error.
   * @param {boolean} [isOperational=true] - Optional flag to indicate if this is an operational error. Defaults to `true`.
   * @param {unknown} [details] - Optional, any additional data or context for the error.
   */
  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: unknown // Corrected: Changed 'any' to 'unknown'
  ) {
    // Call the constructor of the parent 'Error' class.
    // This sets the 'message' property of the AppError instance.
    super(message);

    // Assign the custom properties passed to this constructor
    // to the instance of the AppError.
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // This line captures the stack trace of where this error was created.
    // It's essential for debugging because it shows the sequence of function calls
    // that led to this error being thrown.
    // `Error.captureStackTrace` is a V8 (Node.js engine) specific method.
    // The second argument (`AppError`) tells V8 to exclude frames from the stack trace
    // that are above (and including) the `AppError` constructor call itself,
    // making the stack trace cleaner and more relevant to where the error originated.
    // We cast `Error` to `any` or ensure `global.d.ts` is in place to satisfy TypeScript
    // because `captureStackTrace` is not part of the standard `Error` interface.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Error as any).captureStackTrace(this, AppError); // Corrected: Type assertion for Node.js specific method
  }
}

// ---

/**
 * @class NotFoundError
 * @augments AppError
 * @description A specialized custom error class for 'Resource Not Found' scenarios (HTTP 404).
 * This class inherits all properties and methods from `AppError` and automatically sets
 * the `statusCode` to 404, making it convenient for handling routes or resources
 * that do not exist.
 */
export class NotFoundError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Resources not found!'] - An optional custom error message.
   * Defaults to 'Resources not found!' if no message is provided.
   */
  constructor(message = 'Resources not found!') {
    // Call the parent `AppError` constructor.
    // It passes the provided message and explicitly sets the HTTP status code to 404.
    super(message, 404);
  }
}

/**
 * @class ValidationError
 * @augments AppError
 * @description Custom error class for validation failures (HTTP 400 Bad Request).
 * This is used when client input data does not meet the expected format or rules.
 * It typically includes `details` about the specific validation errors.
 */
export class ValidationError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Invalid request data!'] - An optional custom error message.
   * Defaults to 'Invalid request data!'.
   * @param {unknown} [details] - Optional, specific details about the validation errors (e.g., an object with field-specific errors).
   */
  constructor(message = 'Invalid request data!', details?: unknown) {
    // Corrected: 'any' changed to 'unknown'
    // Calls the parent `AppError` constructor with the message,
    // a 400 status code (Bad Request), and the optional details.
    super(message, 400, true, details);
  }
}

/**
 * @interface JoiValidationErrorDetail
 * @description Defines the expected structure for a single validation error item from Joi.
 * This can be used to type the `details` property of your `ValidationError` class.
 */
export interface JoiValidationErrorDetail {
  message: string;
  path: (string | number)[]; // The path to the invalid field (e.g., ['body', 'email'])
  type: string; // The Joi validation rule that failed (e.g., 'string.email', 'any.required')
  context?: { [key: string]: any }; // Additional context from Joi
}
export class JoiValidationError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Invalid request data!'] - An optional custom error message.
   * @param {JoiValidationErrorDetail[] | unknown} [details] - Specific details about the validation errors,
   * often an array of Joi's error details. Use `unknown` for maximum flexibility.
   */
  constructor(message = 'Invalid request data!', details?: unknown) {
    super(message, 400, true, details);
  }
}

/**
 * @class AuthError
 * @augments AppError
 * @description Custom error class for authentication failures (HTTP 401 Unauthorized).
 * Used when a request lacks valid authentication credentials or requires authentication.
 */
export class UnauthorizedError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Unauthorized!'] - An optional custom error message.
   * Defaults to 'Unauthorized!'.
   */
  constructor(message = 'Unauthorized!') {
    // Calls the parent `AppError` constructor with the message and a 401 status code.
    super(message, 401);
  }
}

/**
 * @class ForbiddenError
 * @augments AppError
 * @description Custom error class for authorization failures (HTTP 403 Forbidden).
 * Used when a user is authenticated but does not have the necessary permissions
 * to access a resource or perform an action.
 */
export class ForbiddenError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Forbidden access!'] - An optional custom error message.
   * Defaults to 'Forbidden access!'.
   */
  constructor(message = 'Forbidden access!') {
    // Calls the parent `AppError` constructor with the message and a 403 status code.
    super(message, 403);
  }
}

/**
 * @class DatabaseError
 * @augments AppError
 * @description Custom error class for database-related issues (HTTP 500 Internal Server Error).
 * This is typically used for unexpected errors that occur during database operations.
 * It can include `details` about the underlying database error (e.g., specific error codes).
 */
export class DatabaseError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Database error!'] - An optional custom error message.
   * Defaults to 'Database error!'.
   * @param {unknown} [details] - Optional, specific details about the database error (e.g., database driver error object).
   */
  constructor(message = 'Database error!', details?: unknown) {
    // Corrected: 'any' changed to 'unknown'
    // Calls the parent `AppError` constructor with the message,
    // a 500 status code (Internal Server Error), isOperational=true, and the optional details.
    // Setting isOperational to true implies this is an expected type of failure (e.g., connection lost),
    // but the exact details might be hidden from the client in production.
    super(message, 500, true, details);
  }
}

/**
 * @class RateLimitError
 * @augments AppError
 * @description Custom error class for rate limiting issues (HTTP 429 Too Many Requests).
 * Used when a client sends too many requests in a given amount of time.
 */
export class RateLimitError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Too many requests, please try again later!'] - An optional custom error message.
   * Defaults to 'Too many requests, please try again later!'.
   */
  constructor(message = 'Too many requests, please try again later!') {
    // Calls the parent `AppError` constructor with the message and a 429 status code.
    super(message, 429);
  }
}

/**
 * @class ServiceUnavailableError
 * @augments AppError
 * @description Custom error class for when a service is temporarily unavailable (HTTP 503 Service Unavailable).
 * This can be due to maintenance, overload, or other transient issues.
 */
export class ServiceUnavailableError extends AppError {
  /**
   * @constructor
   * @param {string} [message='Service temporarily unavailable.'] - An optional custom error message.
   * Defaults to 'Service temporarily unavailable!'.
   * @param {unknown} [details] - Optional, specific details (e.g., downtime schedule, reason for unavailability).
   */
  constructor(message = 'Service temporarily unavailable.', details?: unknown) {
    super(message, 503, true, details); // Set isOperational to true as this is a known, expected state
  }
}

/**
 * @class InternalServerError
 * @augments AppError
 * @description Custom error class for generic internal server errors (HTTP 500 Internal Server Error).
 * This is typically used for unexpected programming errors that are not handled by more specific
 * error classes, and should usually hide internal details in production.
 */
export class InternalServerError extends AppError {
  /**
   * @constructor
   * @param {string} [message='An unexpected internal error occurred.'] - An optional custom error message.
   * Defaults to 'An unexpected internal error occurred!'.
   * @param {unknown} [details] - Optional, specific details about the internal error (typically for logging, not client response).
   */
  constructor(
    message = 'An unexpected internal error occurred.',
    details?: unknown
  ) {
    // Internal server errors are often programming errors, so isOperational might be false
    // to prevent leaking details. However, it can be true if it's a known but unrecoverable
    // issue that's still an "internal server error".
    super(message, 500, false, details); // Setting isOperational to false by default for unexpected errors
  }
}
