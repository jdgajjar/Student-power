import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';

// GET single semester by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    let semester;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      semester = await Semester.findById(params.id);
    }
    
    // If not found by ID, try finding by slug
    if (!semester) {
      semester = await Semester.findOne({ slug: params.id.toLowerCase() });
    }
    
    if (!semester) {
      return NextResponse.json(
        { success: false, error: 'Semester not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: semester }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
