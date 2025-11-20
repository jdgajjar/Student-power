'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface Subject {
  _id?: string;
  courseId: string;
  semesterId: string;
  name: string;
  slug: string;
  code: string;
  credits: number;
  description: string;
}

interface Semester {
  _id: string;
  name: string;
  slug: string;
  number: number;
  courseId: string;
}

interface Course {
  _id: string;
  name: string;
  slug: string;
  code: string;
  universityId: string;
}

interface University {
  _id: string;
  name: string;
  slug: string;
}

export default function ManageSubjects() {
  const router = useRouter();
  const { isAdmin } = useStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Subject>({
    courseId: '',
    semesterId: '',
    name: '',
    slug: '',
    code: '',
    credits: 0,
    description: '',
  });

  useEffect(() => {
    // Small delay to allow Zustand to hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAdmin) router.push('/admin/login');
      else {
        fetchSubjects();
        fetchCourses();
        fetchUniversities();
        fetchSemesters();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAdmin, router]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/universities', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setUniversities(data.data);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await fetch('/api/semesters', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success) {
        setAllSemesters(data.data);
        setSemesters(data.data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setFormData({ ...formData, courseId, semesterId: '' });
    // Filter semesters by selected course
    if (courseId) {
      const filteredSemesters = allSemesters.filter(sem => sem.courseId === courseId);
      setSemesters(filteredSemesters);
    } else {
      setSemesters(allSemesters);
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      courseId: '',
      semesterId: '',
      name: '',
      slug: '',
      code: '',
      credits: 0,
      description: '',
    });
    setSemesters(allSemesters);
    setShowModal(true);
  };

  const handleEditModal = (subject: Subject) => {
    setEditingId(subject._id || null);
    setFormData({
      courseId: subject.courseId,
      semesterId: subject.semesterId,
      name: subject.name,
      slug: subject.slug,
      code: subject.code,
      credits: subject.credits,
      description: subject.description,
    });
    // Filter semesters by selected course
    if (subject.courseId) {
      const filteredSemesters = allSemesters.filter(sem => sem.courseId === subject.courseId);
      setSemesters(filteredSemesters);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      courseId: '',
      semesterId: '',
      name: '',
      slug: '',
      code: '',
      credits: 0,
      description: '',
    });
    setSemesters(allSemesters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.courseId || !formData.semesterId || !formData.credits) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId ? `/api/subjects/${editingId}` : '/api/subjects';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (data.success) {
        // Optimistic UI update
        if (editingId) {
          setSubjects(prev => prev.map(subject => 
            subject._id === editingId ? { ...subject, ...formData, _id: editingId } : subject
          ));
        } else {
          setSubjects(prev => [data.data, ...prev]);
        }
        
        alert(editingId ? 'Subject updated successfully!' : 'Subject added successfully!');
        handleCloseModal();
        
        // Refresh in background
        setTimeout(() => fetchSubjects(), 100);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all related PDFs.`)) {
      return;
    }

    try {
      // Optimistic UI update
      setSubjects(prev => prev.filter(subject => subject._id !== id));
      
      const response = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      const data = await response.json();

      if (data.success) {
        alert('Subject and all related PDFs deleted successfully!');
        // Refresh in background
        setTimeout(() => fetchSubjects(), 100);
      } else {
        alert(`Error: ${data.error}`);
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
      fetchSubjects();
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    // Find the semester, course and university for this subject
    const semester = allSemesters.find(s => s._id === subject.semesterId);
    if (!semester || !semester.slug) return;
    
    const course = courses.find(c => c._id === subject.courseId);
    if (!course || !course.slug) return;
    
    const university = universities.find(u => u._id === course.universityId);
    if (!university || !university.slug) return;

    if (subject.slug) {
      // Navigate to: /universities/{universitySlug}/courses/{courseSlug}/semesters/{semesterSlug}/subjects/{subjectSlug}/pdfs
      router.push(`/universities/${university.slug}/courses/${course.slug}/semesters/${semester.slug}/subjects/${subject.slug}/pdfs`);
    }
  };



  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Manage Subjects
          </h1>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No subjects found. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <Card key={subject._id} hover={true}>
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSubjectClick(subject)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSubjectClick(subject);
                      }
                    }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {subject.description}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>📚 Code: {subject.code}</span>
                      <span>🎓 Credits: {subject.credits}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModal(subject);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit subject"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(subject._id || '', subject.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete subject"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Edit Subject' : 'Add New Subject'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course *
                      </label>
                      <select
                        required
                        value={formData.courseId}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Semester *
                      </label>
                      <select
                        required
                        value={formData.semesterId}
                        onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                        disabled={!formData.courseId}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.courseId ? 'Select Semester' : 'Select Course First'}
                        </option>
                        {semesters.map((sem) => (
                          <option key={sem._id} value={sem._id}>
                            {sem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Data Structures"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., CS201"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Credits *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Subject description"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCloseModal}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Saving...' : (editingId ? 'Update Subject' : 'Create Subject')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
