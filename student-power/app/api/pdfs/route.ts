import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import PDF from '@/lib/db/models/PDF';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all PDFs or PDFs by subjectId
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    
    const query = subjectId ? { subjectId } : {};
    const pdfs = await PDF.find(query)
      .select('-__v')
      .sort({ uploadedAt: -1 })
      .lean();
    
    return NextResponse.json(
      { success: true, data: pdfs },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching PDFs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch PDFs' },
      { status: 500 }
    );
  }
}

// POST - Create a new PDF (with metadata only, file upload handled separately)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create PDF directly without validation
    const pdf = await PDF.create(body);
    
    return NextResponse.json(
      { 
        success: true, 
        data: pdf,
        message: 'PDF metadata created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PDF' },
      { status: 500 }
    );
  }
}
