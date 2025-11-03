'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Pin } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  featured_image_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  expires_at: string | null;
  created_at: string;
  status: string;
  source: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'admission', label: 'Admission' },
  { value: 'financial', label: 'Financial' },
  { value: 'event', label: 'Event' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'general',
    isPublished: false,
    isPinned: false,
    expiresAt: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [removeImage, setRemoveImage] = useState(false);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const adminData = localStorage.getItem('admin_user');
      const adminId = adminData ? JSON.parse(adminData).id : null;

      const res = await fetch('/api/admin/announcements');
      const result = await res.json();
      setAnnouncements(result.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminData = localStorage.getItem('admin_user');
      const adminId = adminData ? JSON.parse(adminData).id : null;

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isPublished', formData.isPublished.toString());
      formDataToSend.append('isPinned', formData.isPinned.toString());
      if (formData.expiresAt) {
        formDataToSend.append('expiresAt', formData.expiresAt);
      }
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      if (removeImage) {
        formDataToSend.append('removeImage', 'true');
      }

      const method = editingId ? 'PUT' : 'POST';
      if (editingId) {
        formDataToSend.append('id', editingId);
      }

      const res = await fetch('/api/admin/announcements', {
        method,
        body: formDataToSend,
        headers: {
          'x-admin-id': adminId || '',
        },
      });

      if (res.ok) {
        setFormData({ 
          title: '', 
          description: '', 
          content: '', 
          category: 'general',
          isPublished: false, 
          isPinned: false,
          expiresAt: '',
        });
        setImageFile(null);
        setImagePreview('');
        setRemoveImage(false);
        setEditingId(null);
        setShowForm(false);
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setLoading(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (item: AnnouncementItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || '',
      category: item.category,
      isPublished: item.is_published,
      isPinned: item.is_pinned,
      expiresAt: item.expires_at ? item.expires_at.split('T')[0] : '',
    });
    setEditingId(item.id);
    if (item.featured_image_url) {
      setImagePreview(item.featured_image_url);
    } else {
      setImagePreview('');
    }
    setRemoveImage(false);
    setShowForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-gray-500',
      academic: 'bg-blue-500',
      admission: 'bg-green-500',
      financial: 'bg-yellow-500',
      event: 'bg-purple-500',
      deadline: 'bg-red-500',
      maintenance: 'bg-orange-500',
      other: 'bg-gray-400',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Announcements Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ 
                title: '', 
                description: '', 
                content: '', 
                category: 'general',
                isPublished: false, 
                isPinned: false,
                expiresAt: '',
              });
              setImageFile(null);
              setImagePreview('');
              setRemoveImage(false);
              setEditingId(null);
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              required
            />

            <textarea
              placeholder="Description (short summary)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none h-20"
              required
            />

            <textarea
              placeholder="Full Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none h-32"
            />

            {/* Category Selection */}
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-gray-400"
              />
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveImage(true);
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="publish" className="text-gray-300">
                  Publish immediately
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="pin" className="text-gray-300">
                  Pin to top
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-center text-gray-400">No announcements yet. Create one!</p>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition flex gap-4"
            >
              {item.featured_image_url && (
                <img
                  src={item.featured_image_url}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {item.is_pinned && (
                      <Pin size={16} className="text-yellow-500" />
                    )}
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor(item.category)}`}>
                      {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                    {item.source === 'moodle' && (
                      <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                        Moodle
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.is_published ? (
                      <Eye size={18} className="text-green-500" />
                    ) : (
                      <EyeOff size={18} className="text-gray-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Created: {formatDate(item.created_at)}</span>
                  {item.expires_at && (
                    <span>Expires: {formatDate(item.expires_at)}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

