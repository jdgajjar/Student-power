import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  universityId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  code: string;
  description: string;
  duration: string;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  universityId: {
    type: Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'Please provide a university ID'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a course name'],
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
    required: [true, 'Please provide a course code'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  duration: {
    type: String,
    required: [true, 'Please provide duration'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for university + slug uniqueness
CourseSchema.index({ universityId: 1, slug: 1 }, { unique: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
