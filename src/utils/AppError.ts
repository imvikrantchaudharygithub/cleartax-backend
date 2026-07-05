/**
 * AppError — operational error carrying an HTTP status code.
 *
 * Throw this from services/controllers for expected domain failures
 * (not found, unauthorized, conflicts, bad input) so the error middleware
 * responds with the correct status code instead of defaulting to 500.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Restore prototype chain (needed when targeting ES5) and capture a clean stack.
    Object.setPrototypeOf(this, AppError.prototype);
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
