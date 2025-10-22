'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image_url: string | null;
  is_published: boolean;
  created_at: string;
  status: string;
}

export default function NewsManager() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    isPublished: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Fetch news
  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news');
      const result = await res.json();
      setNews(result.data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('isPublished', formData.isPublished.toString());
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const method = editingId ? 'PUT' : 'POST';
      if (editingId) {
        formDataToSend.append('id', editingId);
      }

      const res = await fetch('/api/admin/news', {
        method,
        body: formDataToSend,
        headers: {
          'x-admin-id': 'admin-user-id',
        },
      });

      if (res.ok) {
        setFormData({ title: '', description: '', content: '', isPublished: false });
        setImageFile(null);
        setImagePreview('');
        setEditingId(null);
        setShowForm(false);
        fetchNews();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setLoading(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-id': 'admin-user-id',
        },
      });

      if (res.ok) {
        fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      isPublished: item.is_published,
    });
    setEditingId(item.id);
    if (item.featured_image_url) {
      setImagePreview(item.featured_image_url);
    }
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">News Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ title: '', description: '', content: '', isPublished: false });
              setImageFile(null);
              setImagePreview('');
              setEditingId(null);
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New News'}
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
                <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
              )}
            </div>

            {/* Publish Toggle */}
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

      {/* News List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : news.length === 0 ? (
          <p className="text-center text-gray-400">No news yet. Create one!</p>
        ) : (
          news.map((item) => (
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.is_published ? (
                      <Eye size={18} className="text-green-500" />
                    ) : (
                      <EyeOff size={18} className="text-gray-500" />
                    )}
                  </div>
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
