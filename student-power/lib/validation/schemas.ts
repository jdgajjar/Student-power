/**
 * Validation schemas for API inputs
 * Uses simple validation without external dependencies
 */

// Sanitize string input - remove potentially dangerous characters
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .slice(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate MongoDB ObjectId format
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

// University validation
export interface UniversityInput {
  name: string;
  description: string;
  location: string;
  logo?: string;
}

export function validateUniversity(data: any): { valid: boolean; errors: string[]; sanitized?: UniversityInput } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('University name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('University name must be at least 2 characters');
  } else if (data.name.length > 200) {
    errors.push('University name must be less than 200 characters');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (!data.location || typeof data.location !== 'string') {
    errors.push('Location is required');
  } else if (data.location.trim().length < 2) {
    errors.push('Location must be at least 2 characters');
  } else if (data.location.length > 200) {
    errors.push('Location must be less than 200 characters');
  }
  
  if (data.logo && typeof data.logo === 'string' && data.logo.trim()) {
    if (!isValidUrl(data.logo)) {
      errors.push('Logo must be a valid URL');
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: {
      name: sanitizeString(data.name),
      description: sanitizeString(data.description),
      location: sanitizeString(data.location),
      logo: data.logo && data.logo.trim() ? data.logo.trim() : undefined,
    },
  };
}

// Course validation
export interface CourseInput {
  universityId: string;
  name: string;
  code: string;
  description: string;
  duration: string;
}

export function validateCourse(data: any): { valid: boolean; errors: string[]; sanitized?: CourseInput } {
  const errors: string[] = [];
  
  if (!data.universityId || typeof data.universityId !== 'string') {
    errors.push('University ID is required');
  } else if (!isValidObjectId(data.universityId)) {
    errors.push('Invalid university ID format');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Course name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Course name must be at least 2 characters');
  } else if (data.name.length > 200) {
    errors.push('Course name must be less than 200 characters');
  }
  
  if (!data.code || typeof data.code !== 'string') {
    errors.push('Course code is required');
  } else if (data.code.trim().length < 2) {
    errors.push('Course code must be at least 2 characters');
  } else if (data.code.length > 50) {
    errors.push('Course code must be less than 50 characters');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (!data.duration || typeof data.duration !== 'string') {
    errors.push('Duration is required');
  } else if (data.duration.trim().length < 2) {
    errors.push('Duration must be at least 2 characters');
  } else if (data.duration.length > 50) {
    errors.push('Duration must be less than 50 characters');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: {
      universityId: data.universityId.trim(),
      name: sanitizeString(data.name),
      code: sanitizeString(data.code).toUpperCase(),
      description: sanitizeString(data.description),
      duration: sanitizeString(data.duration),
    },
  };
}

// Subject validation
export interface SubjectInput {
  semesterId: string;
  courseId: string;
  name: string;
  code: string;
  credits: number;
  description: string;
}

export function validateSubject(data: any): { valid: boolean; errors: string[]; sanitized?: SubjectInput } {
  const errors: string[] = [];
  
  if (!data.semesterId || typeof data.semesterId !== 'string') {
    errors.push('Semester ID is required');
  } else if (!isValidObjectId(data.semesterId)) {
    errors.push('Invalid semester ID format');
  }
  
  if (!data.courseId || typeof data.courseId !== 'string') {
    errors.push('Course ID is required');
  } else if (!isValidObjectId(data.courseId)) {
    errors.push('Invalid course ID format');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Subject name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Subject name must be at least 2 characters');
  } else if (data.name.length > 200) {
    errors.push('Subject name must be less than 200 characters');
  }
  
  if (!data.code || typeof data.code !== 'string') {
    errors.push('Subject code is required');
  } else if (data.code.trim().length < 2) {
    errors.push('Subject code must be at least 2 characters');
  } else if (data.code.length > 50) {
    errors.push('Subject code must be less than 50 characters');
  }
  
  if (typeof data.credits !== 'number') {
    errors.push('Credits must be a number');
  } else if (data.credits < 1 || data.credits > 20) {
    errors.push('Credits must be between 1 and 20');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: {
      semesterId: data.semesterId.trim(),
      courseId: data.courseId.trim(),
      name: sanitizeString(data.name),
      code: sanitizeString(data.code).toUpperCase(),
      credits: data.credits,
      description: sanitizeString(data.description),
    },
  };
}

// PDF validation
export interface PDFInput {
  subjectId: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  cloudinaryPublicId?: string;
  category: 'notes' | 'assignments' | 'papers' | 'other';
}

export function validatePDF(data: any): { valid: boolean; errors: string[]; sanitized?: PDFInput } {
  const errors: string[] = [];
  
  if (!data.subjectId || typeof data.subjectId !== 'string') {
    errors.push('Subject ID is required');
  } else if (!isValidObjectId(data.subjectId)) {
    errors.push('Invalid subject ID format');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else if (data.title.trim().length < 2) {
    errors.push('Title must be at least 2 characters');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (!data.fileName || typeof data.fileName !== 'string') {
    errors.push('File name is required');
  } else if (!data.fileName.toLowerCase().endsWith('.pdf')) {
    errors.push('File name must end with .pdf');
  }
  
  if (!data.fileUrl || typeof data.fileUrl !== 'string') {
    errors.push('File URL is required');
  } else if (!isValidUrl(data.fileUrl)) {
    errors.push('File URL must be valid');
  }
  
  if (typeof data.fileSize !== 'number') {
    errors.push('File size must be a number');
  } else if (data.fileSize < 1) {
    errors.push('File size must be greater than 0');
  } else if (data.fileSize > 100 * 1024 * 1024) { // 100MB max
    errors.push('File size must be less than 100MB');
  }
  
  const validCategories = ['notes', 'assignments', 'papers', 'other'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('Category must be one of: notes, assignments, papers, other');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: {
      subjectId: data.subjectId.trim(),
      title: sanitizeString(data.title),
      description: sanitizeString(data.description),
      fileName: sanitizeString(data.fileName),
      fileUrl: data.fileUrl.trim(),
      fileSize: data.fileSize,
      cloudinaryPublicId: data.cloudinaryPublicId?.trim(),
      category: data.category,
    },
  };
}

// File upload validation
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['application/pdf', 'application/x-pdf'];
  if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' };
  }
  
  if (file.size < 1) {
    return { valid: false, error: 'File is empty' };
  }
  
  // Check filename
  if (file.name.length > 255) {
    return { valid: false, error: 'File name is too long' };
  }
  
  return { valid: true };
}
