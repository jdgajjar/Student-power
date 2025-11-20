import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, University, Course, Semester, Subject, PDF } from '../types';

interface StoreState extends AppState {
  // Auth actions
  setIsAdmin: (value: boolean) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  
  // University actions
  addUniversity: (university: Omit<University, 'id' | 'createdAt'>) => void;
  updateUniversity: (id: string, university: Partial<University>) => void;
  deleteUniversity: (id: string) => void;
  
  // Course actions
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Semester actions
  addSemester: (semester: Omit<Semester, 'id' | 'createdAt'>) => void;
  updateSemester: (id: string, semester: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;
  
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  // PDF actions
  addPDF: (pdf: Omit<PDF, 'id' | 'uploadedAt'>) => void;
  updatePDF: (id: string, pdf: Partial<PDF>) => void;
  deletePDF: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initialize with empty data - all data will be fetched from database
const initialUniversities: University[] = [];
const initialCourses: Course[] = [];
const initialSemesters: Semester[] = [];
const initialSubjects: Subject[] = [];
const initialPDFs: PDF[] = [];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      universities: initialUniversities,
      courses: initialCourses,
      semesters: initialSemesters,
      subjects: initialSubjects,
      pdfs: initialPDFs,
      isAdmin: false,
      darkMode: false,

      // Auth
      setIsAdmin: (value: boolean) => set({ isAdmin: value }),
      logout: () => set({ isAdmin: false }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Universities
      addUniversity: (university) =>
        set((state) => ({
          universities: [
            ...state.universities,
            { ...university, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateUniversity: (id, university) =>
        set((state) => ({
          universities: state.universities.map((u) =>
            u.id === id ? { ...u, ...university } : u
          ),
        })),
      deleteUniversity: (id) =>
        set((state) => ({
          universities: state.universities.filter((u) => u.id !== id),
        })),

      // Courses
      addCourse: (course) =>
        set((state) => ({
          courses: [
            ...state.courses,
            { ...course, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCourse: (id, course) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, ...course } : c)),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),

      // Semesters
      addSemester: (semester) =>
        set((state) => ({
          semesters: [
            ...state.semesters,
            { ...semester, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateSemester: (id, semester) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, ...semester } : s
          ),
        })),
      deleteSemester: (id) =>
        set((state) => ({
          semesters: state.semesters.filter((s) => s.id !== id),
        })),

      // Subjects
      addSubject: (subject) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            { ...subject, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateSubject: (id, subject) =>
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...subject } : s)),
        })),
      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        })),

      // PDFs
      addPDF: (pdf) =>
        set((state) => ({
          pdfs: [
            ...state.pdfs,
            { ...pdf, id: generateId(), uploadedAt: new Date().toISOString() },
          ],
        })),
      updatePDF: (id, pdf) =>
        set((state) => ({
          pdfs: state.pdfs.map((p) => (p.id === id ? { ...p, ...pdf } : p)),
        })),
      deletePDF: (id) =>
        set((state) => ({
          pdfs: state.pdfs.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'student-power-storage',
    }
  )
);
