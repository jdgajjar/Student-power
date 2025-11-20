'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface Semester {
  _id: string;
  courseId: string;
  number: number;
  name: string;
  slug: string;
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

export default function ManageSemesters() {
  const router = useRouter();
  const { isAdmin } = useStore();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    number: 1,
    name: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Small delay to allow Zustand to hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAdmin) {
        router.push('/admin/login');
      } else {
        fetchData();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAdmin, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [semestersRes, coursesRes, universitiesRes] = await Promise.all([
        fetch('/api/semesters'),
        fetch('/api/courses'),
        fetch('/api/universities'),
      ]);
      
      const [semestersData, coursesData, universitiesData] = await Promise.all([
        semestersRes.json(),
        coursesRes.json(),
        universitiesRes.json(),
      ]);

      if (semestersData.success) setSemesters(semestersData.data);
      if (coursesData.success) setCourses(coursesData.data);
      if (universitiesData.success) setUniversities(universitiesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      courseId: courses[0]?._id || '',
      number: 1,
      name: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      courseId: '',
      number: 1,
      name: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Semester created successfully!');
        handleCloseModal();
        fetchData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving semester:', error);
      alert('Failed to save semester');
    } finally {
      setSubmitting(false);
    }
  };



  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    return course ? `${course.name} (${course.code})` : 'Unknown Course';
  };

  const getUniversityName = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (!course) return 'Unknown University';
    const university = universities.find(u => u._id === course.universityId);
    return university ? university.name : 'Unknown University';
  };

  const handleSemesterClick = (semester: Semester) => {
    // Find the course and university for this semester
    const course = courses.find(c => c._id === semester.courseId);
    if (!course || !course.slug) return;
    
    const university = universities.find(u => u._id === course.universityId);
    if (!university || !university.slug) return;

    if (semester.slug) {
      // Navigate to: /universities/{universitySlug}/courses/{courseSlug}/semesters/{semesterSlug}/subjects
      router.push(`/universities/${university.slug}/courses/${course.slug}/semesters/${semester.slug}/subjects`);
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
            Manage Semesters
          </h1>
          <Button onClick={() => handleOpenModal()} disabled={courses.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading semesters...</p>
          </div>
        ) : semesters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No semesters found. {courses.length === 0 ? 'Please add courses first.' : 'Add one to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((semester) => (
              <Card key={semester._id} hover={true}>
                <div 
                  className="cursor-pointer"
                  onClick={() => handleSemesterClick(semester)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSemesterClick(semester);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {semester.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                        <span className="font-medium">Semester {semester.number}</span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                        Course: {getCourseName(semester.courseId)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        University: {getUniversityName(semester.courseId)}
                      </p>
                    </div>
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
                    Add New Semester
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course *
                    </label>
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="text-gray-500 dark:text-gray-400">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id} className="text-gray-900 dark:text-white">
                          {course.name} ({course.code}) - {getUniversityName(course._id)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester Number *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Semester 1 or Fall 2024"
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
                      {submitting ? 'Saving...' : 'Create Semester'}
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
