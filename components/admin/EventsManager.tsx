'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string;
  event_type: string;
  max_attendees: number | null;
  is_published: boolean;
  created_at: string;
  status: string;
}

const EVENT_TYPES = [
  'webinar',
  'workshop',
  'lecture',
  'conference',
  'deadline',
  'holiday',
  'other',
];

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    startDate: '',
    endDate: '',
    location: '',
    eventType: 'webinar',
    maxAttendees: '',
    isPublished: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      const result = await res.json();
      setEvents(result.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
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
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('eventType', formData.eventType);
      formDataToSend.append('maxAttendees', formData.maxAttendees);
      formDataToSend.append('isPublished', formData.isPublished.toString());
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const method = editingId ? 'PUT' : 'POST';
      if (editingId) {
        formDataToSend.append('id', editingId);
      }

      const res = await fetch('/api/admin/events', {
        method,
        body: formDataToSend,
        headers: {
          'x-admin-id': 'admin-user-id',
        },
      });

      if (res.ok) {
        setFormData({
          title: '',
          description: '',
          content: '',
          startDate: '',
          endDate: '',
          location: '',
          eventType: 'webinar',
          maxAttendees: '',
          isPublished: false,
        });
        setImageFile(null);
        setImagePreview('');
        setEditingId(null);
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setLoading(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-id': 'admin-user-id',
        },
      });

      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      content: event.content,
      startDate: event.start_date?.split('T')[0] || '',
      endDate: event.end_date?.split('T')[0] || '',
      location: event.location,
      eventType: event.event_type,
      maxAttendees: event.max_attendees?.toString() || '',
      isPublished: event.is_published,
    });
    setEditingId(event.id);
    if (event.featured_image_url) {
      setImagePreview(event.featured_image_url);
    }
    setShowForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Events Calendar</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({
                title: '',
                description: '',
                content: '',
                startDate: '',
                endDate: '',
                location: '',
                eventType: 'webinar',
                maxAttendees: '',
                isPublished: false,
              });
              setImageFile(null);
              setImagePreview('');
              setEditingId(null);
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-2 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                required
              />

              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                required
              />

              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
              />

              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
              />

              <textarea
                placeholder="Description (short summary)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-2 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none h-16"
                required
              />

              <textarea
                placeholder="Full Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="col-span-2 bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none h-20"
              />

              <input
                type="number"
                placeholder="Max Attendees (optional)"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Event Banner</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-gray-400"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded" />
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-400">No events yet. Create one!</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-emerald-500 transition"
            >
              <div className="flex gap-4">
                {event.featured_image_url && (
                  <img
                    src={event.featured_image_url}
                    alt={event.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(event.start_date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            {event.location}
                          </div>
                        )}
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs">
                          {event.event_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
