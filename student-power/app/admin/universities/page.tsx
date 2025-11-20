'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface University {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  logo?: string;
}

export default function ManageUniversities() {
  const router = useRouter();
  const { isAdmin } = useStore();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    logo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Small delay to allow Zustand to hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAdmin) {
        router.push('/admin/login');
      } else {
        fetchUniversities();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAdmin, router]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/universities', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUniversities(data.data);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      alert('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityClick = (university: University) => {
    if (university.slug) {
      // Navigate to: /universities/{universitySlug}/courses
      router.push(`/universities/${university.slug}/courses`);
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      logo: '',
    });
    setShowModal(true);
  };

  const handleEditModal = (university: University) => {
    setEditingId(university._id);
    setFormData({
      name: university.name,
      description: university.description,
      location: university.location,
      logo: university.logo || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      logo: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId ? `/api/universities/${editingId}` : '/api/universities';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        cache: 'no-store',
      });

      const data = await response.json();

      if (data.success) {
        // Optimistic UI update
        if (editingId) {
          setUniversities(prev => prev.map(uni => 
            uni._id === editingId ? { ...uni, ...formData, _id: editingId } : uni
          ));
        } else {
          setUniversities(prev => [data.data, ...prev]);
        }
        
        alert(editingId ? 'University updated successfully!' : 'University created successfully!');
        handleCloseModal();
        
        // Refresh in background to ensure sync
        setTimeout(() => fetchUniversities(), 100);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving university:', error);
      alert('Failed to save university');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all related courses, semesters, subjects, and PDFs.`)) {
      return;
    }

    try {
      // Optimistic UI update - remove immediately
      setUniversities(prev => prev.filter(uni => uni._id !== id));
      
      const response = await fetch(`/api/universities/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      const data = await response.json();

      if (data.success) {
        alert('University and all related data deleted successfully!');
        // Refresh in background to ensure sync
        setTimeout(() => fetchUniversities(), 100);
      } else {
        alert(`Error: ${data.error}`);
        // Revert optimistic update on error
        fetchUniversities();
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university');
      // Revert optimistic update on error
      fetchUniversities();
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
            Manage Universities
          </h1>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add University
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading universities...</p>
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No universities found. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {universities.map((university) => (
              <Card key={university._id} hover={true}>
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleUniversityClick(university)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleUniversityClick(university);
                      }
                    }}
                  >
                    {university.logo && (
                      <img
                        src={university.logo}
                        alt={university.name}
                        className="h-12 w-12 object-contain mb-3"
                      />
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {university.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {university.description}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                      📍 {university.location}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModal(university);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit university"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(university._id, university.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete university"
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
                    {editingId ? 'Edit University' : 'Add New University'}
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
                      University Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Massachusetts Institute of Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of the university"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Cambridge, Massachusetts, USA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.logo && (
                      <div className="mt-2">
                        <img
                          src={formData.logo}
                          alt="Logo preview"
                          className="h-16 w-16 object-contain border border-gray-300 dark:border-gray-600 rounded p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
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
                      {submitting ? 'Saving...' : (editingId ? 'Update University' : 'Create University')}
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
