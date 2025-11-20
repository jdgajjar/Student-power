import mongoose, { Schema, Document } from 'mongoose';

export interface IPDF extends Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  cloudinaryPublicId?: string;
  uploadedAt: Date;
  updatedAt: Date;
  category: 'notes' | 'assignments' | 'papers' | 'other';
}

const PDFSchema = new Schema<IPDF>({
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Please provide a subject ID'],
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  fileName: {
    type: String,
    required: [true, 'Please provide a file name'],
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide a file URL'],
  },
  fileSize: {
    type: Number,
    required: [true, 'Please provide file size'],
  },
  cloudinaryPublicId: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ['notes', 'assignments', 'papers', 'other'],
    default: 'other',
  },
});

// Update the updatedAt field on every save
PDFSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.PDF || mongoose.model<IPDF>('PDF', PDFSchema);
