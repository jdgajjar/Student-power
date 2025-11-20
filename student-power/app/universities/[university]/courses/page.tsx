'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import SearchBar from '@/components/ui/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BookOpen, Clock, ArrowLeft, Plus } from 'lucide-react';

interface University {
  _id: string;
  name: string;
  description: string;
  location: string;
}

interface Course {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  duration: string;
  universityId: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const params = useParams();
  const universitySlug = params.university as string;
  const { isAdmin } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [university, setUniversity] = useState<University | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
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

        // Fetch courses for this university
        const coursesResponse = await fetch('/api/courses');
        const coursesData = await coursesResponse.json();
        if (coursesData.success && uniData.data) {
          const universityCourses = coursesData.data.filter(
            (c: Course) => c.universityId === uniData.data._id
          );
          setCourses(universityCourses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [universitySlug]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">University not found</p>
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
  ].filter(item => item.name);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {university?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a course to view semesters and subjects
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchBar
              placeholder="Search courses..."
              onSearch={setSearchQuery}
              className="w-full sm:max-w-md"
            />
            {isAdmin && (
              <Button
                onClick={() => router.push('/admin/courses')}
                variant="primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {courses.length === 0 ? 'No courses found. Please add one from the admin panel.' : 'No courses found matching your search'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course._id}
                onClick={() => router.push(`/universities/${universitySlug}/courses/${course.slug}/semesters`)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {course.name}
                    </h3>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                      {course.code}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                    {course.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
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
