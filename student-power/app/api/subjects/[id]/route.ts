import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/lib/db/models/Subject';
import PDF from '@/lib/db/models/PDF';
import { deletePDFFromCloudinary } from '@/lib/cloudinary/upload';

// GET single subject by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    let subject;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      subject = await Subject.findById(params.id);
    }
    
    // If not found by ID, try finding by slug
    if (!subject) {
      subject = await Subject.findOne({ slug: params.id.toLowerCase() });
    }
    
    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: subject }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - Update a subject
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
    
    const subject = await Subject.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: false }
    );
    
    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: subject }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update subject' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subject and all related PDFs (cascading delete + Cloudinary cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID format' },
        { status: 400 }
      );
    }
    
    // Find all PDFs for this subject to get their Cloudinary public IDs
    const pdfs = await PDF.find({ subjectId: params.id });
    
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
    await PDF.deleteMany({ subjectId: params.id });
    
    // Finally, delete the subject
    const subject = await Subject.findByIdAndDelete(params.id);
    
    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Subject and ${pdfs.length} PDFs deleted successfully (${deletedFromCloudinary} from Cloudinary)`,
      data: subject 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
