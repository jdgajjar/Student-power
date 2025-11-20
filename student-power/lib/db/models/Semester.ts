import mongoose, { Schema, Document } from 'mongoose';

export interface ISemester extends Document {
  courseId: mongoose.Types.ObjectId;
  number: number;
  name: string;
  slug: string;
  createdAt: Date;
}

const SemesterSchema = new Schema<ISemester>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course ID'],
  },
  number: {
    type: Number,
    required: [true, 'Please provide a semester number'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a semester name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for course + slug uniqueness
SemesterSchema.index({ courseId: 1, slug: 1 }, { unique: true });

export default mongoose.models.Semester || mongoose.model<ISemester>('Semester', SemesterSchema);
