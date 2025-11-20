import { NextRequest, NextResponse } from 'next/server';
import { uploadPDFToCloudinary } from '@/lib/cloudinary/upload';
import { validateFileUpload } from '@/lib/validation/schemas';
import { handleApiError } from '@/lib/utils/errors';
import { checkRateLimit, getClientIp, RateLimitConfigs } from '@/lib/middleware/rateLimit';

// Configure route segment for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time
export const dynamic = 'force-dynamic'; // Disable caching for uploads

// Note: In production (Vercel), body size limits are controlled by:
// 1. Vercel's plan limits (Free: 4.5MB, Pro: 4.5MB body + function payload)
// 2. For larger files, use direct Cloudinary upload from client or signed uploads

// POST - Upload PDF file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for uploads
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`pdf-upload-${clientIp}`, RateLimitConfigs.upload);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many upload requests. Please wait before trying again.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file provided',
          code: 'MISSING_FILE'
        },
        { status: 400 }
      );
    }

    // Validate file using comprehensive validation
    const fileValidation = validateFileUpload(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: fileValidation.error,
          code: 'INVALID_FILE'
        },
        { status: 400 }
      );
    }

    console.log(`Uploading PDF: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Additional security: Check buffer for PDF magic number
    const isPDF = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    if (!isPDF) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid PDF file format',
          code: 'INVALID_PDF'
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadPDFToCloudinary(buffer, file.name);

    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          size: result.bytes,
        },
        message: 'File uploaded successfully'
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { 
        success: false, 
        error: errorResponse.error,
        code: errorResponse.code,
      },
      { status: errorResponse.statusCode }
    );
  }
}
