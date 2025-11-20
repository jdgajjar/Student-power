'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ArrowLeft, Calendar } from 'lucide-react';

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
  number: number;
  courseId: string;
}

export default function SemestersPage() {
  const router = useRouter();
  const params = useParams();
  const universitySlug = params.university as string;
  const courseSlug = params.course as string;
  const [university, setUniversity] = useState<University | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
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

        // Fetch semesters for this course
        if (courseData.data) {
          const semestersResponse = await fetch(`/api/semesters?courseId=${courseData.data._id}`);
          const semestersData = await semestersResponse.json();
          if (semestersData.success) {
            setSemesters(semestersData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [universitySlug, courseSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!university || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Course not found</p>
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
  ].filter(item => item.name);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Semesters
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a semester to view subjects
          </p>
        </div>

        {/* Semesters Grid */}
        {semesters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              No semesters found for this course
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Please add semesters from the admin panel to continue
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((semester) => (
              <Card
                key={semester._id}
                onClick={() => router.push(`/universities/${universitySlug}/courses/${courseSlug}/semesters/${semester.slug}/subjects`)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {semester.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click to view subjects
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
