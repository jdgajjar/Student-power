import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  slug: string;
  description: string;
  location: string;
  logo?: string;
  createdAt: Date;
}

const UniversitySchema = new Schema<IUniversity>({
  name: {
    type: String,
    required: [true, 'Please provide a university name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
  },
  logo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.University || mongoose.model<IUniversity>('University', UniversitySchema);
