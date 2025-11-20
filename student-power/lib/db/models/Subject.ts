import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  courseId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  code: string;
  credits: number;
  description: string;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course ID'],
  },
  semesterId: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Please provide a semester ID'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a subject name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide a subject code'],
    trim: true,
  },
  credits: {
    type: Number,
    required: [true, 'Please provide credits'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for semester + slug uniqueness
SubjectSchema.index({ semesterId: 1, slug: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
