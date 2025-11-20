import {
  sanitizeString,
  isValidEmail,
  isValidUrl,
  isValidObjectId,
  validateUniversity,
  validateCourse,
  validateSubject,
  validatePDF,
  validateFileUpload,
} from '@/lib/validation/schemas';

describe('Validation Utilities', () => {
  describe('sanitizeString', () => {
    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('removes dangerous characters', () => {
      expect(sanitizeString('hello<script>alert("xss")</script>')).toBe('helloalert("xss")');
    });

    it('limits string length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString).length).toBe(1000);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates correct URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('rejects invalid URL', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('isValidObjectId', () => {
    it('validates correct MongoDB ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('rejects invalid ObjectId', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('12345')).toBe(false);
    });
  });

  describe('validateUniversity', () => {
    it('validates correct university data', () => {
      const result = validateUniversity({
        name: 'Test University',
        description: 'A great university for testing',
        location: 'Test City, Test Country',
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized?.name).toBe('Test University');
    });

    it('rejects missing fields', () => {
      const result = validateUniversity({
        name: 'Test',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects too short name', () => {
      const result = validateUniversity({
        name: 'T',
        description: 'A great university',
        location: 'Test City',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('University name must be at least 2 characters');
    });

    it('validates optional logo URL', () => {
      const result = validateUniversity({
        name: 'Test University',
        description: 'A great university',
        location: 'Test City',
        logo: 'https://example.com/logo.png',
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized?.logo).toBe('https://example.com/logo.png');
    });

    it('rejects invalid logo URL', () => {
      const result = validateUniversity({
        name: 'Test University',
        description: 'A great university',
        location: 'Test City',
        logo: 'not a url',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Logo must be a valid URL');
    });
  });

  describe('validateCourse', () => {
    const validCourse = {
      universityId: '507f1f77bcf86cd799439011',
      name: 'Computer Science',
      code: 'CS101',
      description: 'Introduction to Computer Science',
      duration: '4 years',
    };

    it('validates correct course data', () => {
      const result = validateCourse(validCourse);
      expect(result.valid).toBe(true);
      expect(result.sanitized?.code).toBe('CS101');
    });

    it('rejects invalid universityId', () => {
      const result = validateCourse({
        ...validCourse,
        universityId: 'invalid',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid university ID format');
    });
  });

  describe('validateSubject', () => {
    const validSubject = {
      semesterId: '507f1f77bcf86cd799439011',
      courseId: '507f1f77bcf86cd799439012',
      name: 'Data Structures',
      code: 'CS201',
      credits: 3,
      description: 'Learn about data structures and algorithms',
    };

    it('validates correct subject data', () => {
      const result = validateSubject(validSubject);
      expect(result.valid).toBe(true);
      expect(result.sanitized?.credits).toBe(3);
    });

    it('rejects invalid credits', () => {
      const result = validateSubject({
        ...validSubject,
        credits: 25, // Too high
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Credits must be between 1 and 20');
    });
  });

  describe('validatePDF', () => {
    const validPDF = {
      subjectId: '507f1f77bcf86cd799439011',
      title: 'Lecture Notes - Week 1',
      description: 'Introduction to the course',
      fileName: 'lecture-notes-1.pdf',
      fileUrl: 'https://example.com/files/lecture-notes-1.pdf',
      fileSize: 1024000, // 1MB
      category: 'notes' as const,
    };

    it('validates correct PDF data', () => {
      const result = validatePDF(validPDF);
      expect(result.valid).toBe(true);
      expect(result.sanitized?.category).toBe('notes');
    });

    it('rejects non-PDF filename', () => {
      const result = validatePDF({
        ...validPDF,
        fileName: 'document.docx',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File name must end with .pdf');
    });

    it('rejects file that is too large', () => {
      const result = validatePDF({
        ...validPDF,
        fileSize: 200 * 1024 * 1024, // 200MB
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File size must be less than 100MB');
    });

    it('rejects invalid category', () => {
      const result = validatePDF({
        ...validPDF,
        category: 'invalid' as any,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Category must be one of: notes, assignments, papers, other');
    });
  });

  describe('validateFileUpload', () => {
    it('validates PDF file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileUpload(file);
      expect(result.valid).toBe(true);
    });

    it('rejects non-PDF file', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only PDF files are allowed');
    });

    it('rejects file that is too large', () => {
      const largeContent = new Array(101 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 101 * 1024 * 1024 });
      
      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size must be less than 100MB');
    });

    it('rejects empty file', () => {
      const file = new File([], 'empty.pdf', { type: 'application/pdf' });
      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File is empty');
    });
  });
});
