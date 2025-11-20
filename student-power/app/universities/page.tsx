'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import SearchBar from '@/components/ui/SearchBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { MapPin, BookOpen, Plus } from 'lucide-react';

interface University {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  logo?: string;
}

export default function UniversitiesPage() {
  const router = useRouter();
  const { isAdmin } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/universities');
        const data = await response.json();
        if (data.success) {
          setUniversities(data.data);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const filteredUniversities = useMemo(() => {
    return universities.filter(uni =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [universities, searchQuery]);

  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Universities', href: '/universities' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Universities
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a university to explore courses and study materials
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchBar
              placeholder="Search universities..."
              onSearch={setSearchQuery}
              className="w-full sm:max-w-md"
            />
            {isAdmin && (
              <Button
                onClick={() => router.push('/admin/universities')}
                variant="primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add University
              </Button>
            )}
          </div>
        </div>

        {/* Universities Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading universities...</p>
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {universities.length === 0 ? 'No universities found. Please add one from the admin panel.' : 'No universities found matching your search'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <Card
                key={university._id}
                onClick={() => router.push(`/universities/${university.slug}/courses`)}
              >
                <div className="flex flex-col h-full">
                  {university.logo && (
                    <img 
                      src={university.logo} 
                      alt={university.name}
                      className="h-16 w-16 object-contain mb-3"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {university.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                    {university.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    {university.location}
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
