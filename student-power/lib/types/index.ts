export interface University {
  id: string;
  name: string;
  description: string;
  location: string;
  logo?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  code: string;
  description: string;
  duration: string;
  createdAt: string;
}

export interface Semester {
  id: string;
  courseId: string;
  number: number;
  name: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code: string;
  credits: number;
  description: string;
  createdAt: string;
}

export interface PDF {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  category: 'notes' | 'assignments' | 'papers' | 'other';
}

export interface AdminUser {
  username: string;
  role: 'admin';
}

export interface AppState {
  universities: University[];
  courses: Course[];
  semesters: Semester[];
  subjects: Subject[];
  pdfs: PDF[];
  isAdmin: boolean;
  darkMode: boolean;
}
