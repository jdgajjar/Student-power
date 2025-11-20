import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import PDF from '@/lib/db/models/PDF';
import { deletePDFFromCloudinary } from '@/lib/cloudinary/upload';

// GET single PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid PDF ID format' },
        { status: 400 }
      );
    }
    
    const pdf = await PDF.findById(params.id);
    
    if (!pdf) {
      return NextResponse.json(
        { success: false, error: 'PDF not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: pdf }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - Update a PDF
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Add updatedAt timestamp
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    const pdf = await PDF.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: false }
    );
    
    if (!pdf) {
      return NextResponse.json(
        { success: false, error: 'PDF not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: pdf }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update PDF' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a PDF and its file from Cloudinary
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid PDF ID format' },
        { status: 400 }
      );
    }
    
    // First, find the PDF to get the Cloudinary public ID
    const pdf = await PDF.findById(params.id);
    
    if (!pdf) {
      return NextResponse.json(
        { success: false, error: 'PDF not found' },
        { status: 404 }
      );
    }
    
    // Delete from Cloudinary if publicId exists
    if (pdf.cloudinaryPublicId) {
      try {
        await deletePDFFromCloudinary(pdf.cloudinaryPublicId);
        console.log(`Deleted PDF from Cloudinary: ${pdf.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }
    
    // Delete from database
    await PDF.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'PDF deleted successfully from database and Cloudinary',
      data: pdf 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
