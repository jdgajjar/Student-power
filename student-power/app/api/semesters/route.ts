import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all semesters or semesters by courseId
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    const query = courseId ? { courseId } : {};
    const semesters = await Semester.find(query).sort({ number: 1 });
    
    return NextResponse.json(
      { success: true, data: semesters },
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST - Create a new semester
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const semester = await Semester.create(body);
    
    return NextResponse.json({ success: true, data: semester }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
