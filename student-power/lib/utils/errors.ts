/**
 * Error handling utilities
 * Provides consistent error responses and user-friendly messages
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: string[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: any): string {
  if (error instanceof ValidationError) {
    return error.errors.length > 0 
      ? error.errors.join('. ') 
      : 'Please check your input and try again';
  }
  
  if (error instanceof NotFoundError) {
    return error.message;
  }
  
  if (error instanceof UnauthorizedError) {
    return 'Please log in to continue';
  }
  
  if (error instanceof ForbiddenError) {
    return 'You do not have permission to perform this action';
  }
  
  if (error instanceof DatabaseError) {
    return 'A server error occurred. Please try again later';
  }
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return `A record with this ${field || 'value'} already exists`;
  }
  
  // MongoDB validation error
  if (error.name === 'ValidationError' && error.errors) {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return messages.join('. ');
  }
  
  // Generic error
  return 'An unexpected error occurred. Please try again';
}

// Format error response for API
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: string[];
  statusCode: number;
}

export function formatErrorResponse(error: any): ErrorResponse {
  let statusCode = 500;
  let code: string | undefined;
  let details: string[] | undefined;
  
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    
    if (error instanceof ValidationError && error.errors.length > 0) {
      details = error.errors;
    }
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
  } else if (error.name === 'CastError') {
    // MongoDB cast error (invalid ID format)
    statusCode = 400;
    code = 'INVALID_ID';
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }
  
  const message = getUserFriendlyMessage(error);
  
  // In production, don't expose internal error details
  const response: ErrorResponse = {
    success: false,
    error: message,
    statusCode,
  };
  
  if (code) {
    response.code = code;
  }
  
  if (details && details.length > 0) {
    response.details = details;
  }
  
  return response;
}

// Handle async errors in API routes
export function handleApiError(error: any) {
  console.error('API Error:', error);
  const errorResponse = formatErrorResponse(error);
  return errorResponse;
}

// Async handler wrapper for API routes
export function asyncHandler(fn: Function) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorResponse = handleApiError(error);
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        {
          success: false,
          error: errorResponse.error,
          code: errorResponse.code,
          details: errorResponse.details,
        },
        { status: errorResponse.statusCode }
      );
    }
  };
}
