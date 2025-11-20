import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import University from '@/lib/db/models/University';
import { slugify } from '@/lib/utils/slugify';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all universities
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const universities = await University.find({})
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(
      { success: true, data: universities },
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
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch universities' },
      { status: 500 }
    );
  }
}

// POST - Create a new university
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate slug from name
    const slug = slugify(body.name);
    
    // Create new university
    const university = await University.create({
      ...body,
      slug,
    });
    
    return NextResponse.json(
      { 
        success: true, 
        data: university,
        message: 'University created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating university:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create university' },
      { status: 500 }
    );
  }
}
