'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import { BookOpen, GraduationCap, Calendar, FileText, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin } = useStore();
  const [stats, setStats] = useState({
    universities: 0,
    courses: 0,
    subjects: 0,
    pdfs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!isAdmin) {
      router.push('/admin/login');
    } else {
      fetchStats();
    }
  }, [isAdmin, router, isHydrated]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [universitiesRes, coursesRes, subjectsRes, pdfsRes] = await Promise.all([
        fetch('/api/universities'),
        fetch('/api/courses'),
        fetch('/api/subjects'),
        fetch('/api/pdfs'),
      ]);

      const [universitiesData, coursesData, subjectsData, pdfsData] = await Promise.all([
        universitiesRes.json(),
        coursesRes.json(),
        subjectsRes.json(),
        pdfsRes.json(),
      ]);

      setStats({
        universities: universitiesData.success ? universitiesData.data.length : 0,
        courses: coursesData.success ? coursesData.data.length : 0,
        subjects: subjectsData.success ? subjectsData.data.length : 0,
        pdfs: pdfsData.success ? pdfsData.data.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || !isAdmin) {
    return null;
  }

  const statsDisplay = [
    { label: 'Universities', value: stats.universities, icon: BookOpen, color: 'blue' },
    { label: 'Courses', value: stats.courses, icon: GraduationCap, color: 'green' },
    { label: 'Subjects', value: stats.subjects, icon: Calendar, color: 'purple' },
    { label: 'PDFs', value: stats.pdfs, icon: FileText, color: 'orange' },
  ];

  const adminSections = [
    { title: 'Manage Universities', href: '/admin/universities', icon: BookOpen },
    { title: 'Manage Courses', href: '/admin/courses', icon: GraduationCap },
    { title: 'Manage Subjects', href: '/admin/subjects', icon: Calendar },
    { title: 'Manage PDFs', href: '/admin/pdfs', icon: FileText },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage universities, courses, subjects, and PDFs
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsDisplay.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} hover={false}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-full p-3`}>
                        <Icon className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Admin Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {adminSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.title} onClick={() => router.push(section.href)}>
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Add, edit, or delete {section.title.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
