import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import University from '@/lib/db/models/University';
import Course from '@/lib/db/models/Course';
import Semester from '@/lib/db/models/Semester';
import Subject from '@/lib/db/models/Subject';
import PDF from '@/lib/db/models/PDF';

// GET single university by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    let university;
    
    // Try to find by ObjectId first, then by slug
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      university = await University.findById(params.id);
    }
    
    // If not found by ID or invalid ID, try finding by slug
    if (!university) {
      university = await University.findOne({ slug: params.id.toLowerCase() });
    }
    
    if (!university) {
      return NextResponse.json(
        { success: false, error: 'University not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: university }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - Update a university
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const university = await University.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: false }
    );
    
    if (!university) {
      return NextResponse.json(
        { success: false, error: 'University not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: university }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update university' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a university and all related data (cascading delete + Cloudinary cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid university ID format' },
        { status: 400 }
      );
    }
    
    // Import Cloudinary delete function
    const { deletePDFFromCloudinary } = await import('@/lib/cloudinary/upload');
    
    // Find all courses for this university
    const courses = await Course.find({ universityId: params.id });
    const courseIds = courses.map(course => course._id);
    
    // Find all semesters for these courses
    const semesters = await Semester.find({ courseId: { $in: courseIds } });
    const semesterIds = semesters.map(semester => semester._id);
    
    // Find all subjects for these semesters
    const subjects = await Subject.find({ semesterId: { $in: semesterIds } });
    const subjectIds = subjects.map(subject => subject._id);
    
    // Find all PDFs for these subjects to get Cloudinary public IDs
    const pdfs = await PDF.find({ subjectId: { $in: subjectIds } });
    
    // Delete all PDFs from Cloudinary
    let deletedFromCloudinary = 0;
    for (const pdf of pdfs) {
      if (pdf.cloudinaryPublicId) {
        try {
          await deletePDFFromCloudinary(pdf.cloudinaryPublicId);
          deletedFromCloudinary++;
          console.log(`Deleted PDF from Cloudinary: ${pdf.cloudinaryPublicId}`);
        } catch (cloudinaryError) {
          console.error(`Error deleting ${pdf.cloudinaryPublicId} from Cloudinary:`, cloudinaryError);
          // Continue with other deletions even if one fails
        }
      }
    }
    
    // Delete all PDFs from database
    await PDF.deleteMany({ subjectId: { $in: subjectIds } });
    
    // Delete all subjects
    await Subject.deleteMany({ semesterId: { $in: semesterIds } });
    
    // Delete all semesters
    await Semester.deleteMany({ courseId: { $in: courseIds } });
    
    // Delete all courses
    await Course.deleteMany({ universityId: params.id });
    
    // Finally, delete the university
    const university = await University.findByIdAndDelete(params.id);
    
    if (!university) {
      return NextResponse.json(
        { success: false, error: 'University not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `University and all related data deleted successfully (${deletedFromCloudinary} PDFs from Cloudinary)`,
      data: university 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
