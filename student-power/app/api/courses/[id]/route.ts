import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Semester from '@/lib/db/models/Semester';
import Subject from '@/lib/db/models/Subject';
import PDF from '@/lib/db/models/PDF';

// GET single course by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    let course;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      course = await Course.findById(params.id);
    }
    
    // If not found by ID, try finding by slug
    if (!course) {
      course = await Course.findOne({ slug: params.id.toLowerCase() });
    }
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate slug if name is being updated
    if (body.name) {
      const { slugify } = await import('@/lib/utils/slugify');
      body.slug = slugify(body.name);
    }
    
    const course = await Course.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: false }
    );
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course and all related data (cascading delete + Cloudinary cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID format' },
        { status: 400 }
      );
    }
    
    // Import Cloudinary delete function
    const { deletePDFFromCloudinary } = await import('@/lib/cloudinary/upload');
    
    // Find all semesters for this course
    const semesters = await Semester.find({ courseId: params.id });
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
    await Semester.deleteMany({ courseId: params.id });
    
    // Finally, delete the course
    const course = await Course.findByIdAndDelete(params.id);
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Course and all related data deleted successfully (${deletedFromCloudinary} PDFs from Cloudinary)`,
      data: course 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
