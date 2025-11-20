'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import SearchBar from '@/components/ui/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BookOpen, Award, ArrowLeft, Plus } from 'lucide-react';

interface University {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  name: string;
}

interface Semester {
  _id: string;
  name: string;
  slug: string;
}

interface Subject {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  credits: number;
  courseId: string;
  semesterId: string;
}

export default function SubjectsPage() {
  const router = useRouter();
  const params = useParams();
  const universitySlug = params.university as string;
  const courseSlug = params.course as string;
  const semesterSlug = params.semester as string;
  const { isAdmin } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [university, setUniversity] = useState<University | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch university details
        const uniResponse = await fetch(`/api/universities/${universitySlug}`);
        const uniData = await uniResponse.json();
        if (uniData.success) {
          setUniversity(uniData.data);
        }

        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${courseSlug}`);
        const courseData = await courseResponse.json();
        if (courseData.success) {
          setCourse(courseData.data);
        }

        // Fetch semester details
        const semesterResponse = await fetch(`/api/semesters/${semesterSlug}`);
        const semesterData = await semesterResponse.json();
        if (semesterData.success) {
          setSemester(semesterData.data);
        }
        
        // Fetch subjects for this course and semester
        if (courseData.data && semesterData.data) {
          const subjectsResponse = await fetch(`/api/subjects?courseId=${courseData.data._id}&semesterId=${semesterData.data._id}`);
          const subjectsData = await subjectsResponse.json();
          if (subjectsData.success) {
            setSubjects(subjectsData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [universitySlug, courseSlug, semesterSlug]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!university || !course || !semester) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Page not found</p>
          <Button onClick={() => router.push('/universities')} className="mt-4">
            Back to Universities
          </Button>
        </div>
      </div>
    );
  }

  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Universities', href: '/universities' },
    { name: university?.name || '', href: `/universities/${universitySlug}/courses` },
    { name: course?.name || '', href: `/universities/${universitySlug}/courses/${courseSlug}/semesters` },
    { name: semester?.name || '', href: `/universities/${universitySlug}/courses/${courseSlug}/semesters/${semesterSlug}/subjects` },
  ].filter(item => item.name);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Subjects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a subject to view PDFs and study materials
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchBar
              placeholder="Search subjects..."
              onSearch={setSearchQuery}
              className="w-full sm:max-w-md"
            />
            {isAdmin && (
              <Button
                onClick={() => router.push('/admin/subjects')}
                variant="primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            )}
          </div>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {subjects.length === 0 ? 'No subjects found for this semester. Please add one from the admin panel.' : 'No subjects found matching your search'}
            </p>
            {isAdmin && subjects.length === 0 && (
              <Button onClick={() => router.push('/admin/subjects')} className="mt-4">
                Add First Subject
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <Card
                key={subject._id}
                onClick={() => router.push(`/universities/${universitySlug}/courses/${courseSlug}/semesters/${semesterSlug}/subjects/${subject.slug}/pdfs`)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {subject.name}
                    </h3>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                      {subject.code}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                    {subject.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Award className="h-4 w-4 mr-1" />
                    {subject.credits} Credits
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
