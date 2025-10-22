'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, X } from 'lucide-react';

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
  slug: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch all events (including past ones)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events/all');
        const result = await res.json();
        setEvents(result.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      webinar: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      workshop: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      lecture: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
      conference: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      deadline: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      holiday: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    };
    return colors[type] || colors.other;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Events Calendar</h1>
            <p className="text-xl text-gray-200">Discover upcoming events and important dates</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {daysArray.map(day => {
                    const dayEvents = getEventsForDay(day);
                    return (
                      <div
                        key={day}
                        className="aspect-square border border-gray-200 rounded-lg p-2 hover:border-primary-500 hover:bg-primary-50 transition cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const color = getEventColor(event.event_type);
                            return (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full text-xs px-1 py-0.5 rounded truncate ${color.bg} ${color.text} border ${color.border} hover:opacity-80 transition`}
                              >
                                {event.title}
                              </button>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Events Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-gray-500">No events scheduled</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {events
                      .filter(event => new Date(event.start_date) >= new Date())
                      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                      .slice(0, 5)
                      .map(event => {
                        const color = getEventColor(event.event_type);
                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full text-left p-3 rounded-lg border ${color.border} ${color.bg} hover:shadow-md transition`}
                          >
                            <div className="font-semibold text-gray-900 text-sm line-clamp-2">{event.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{formatDate(event.start_date)}</div>
                            <div className={`inline-block text-xs px-2 py-1 rounded mt-2 ${color.text} bg-white border ${color.border}`}>
                              {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Event Image */}
            {selectedEvent.featured_image_url && (
              <div className="relative w-full h-64 bg-gradient-to-r from-primary-400 to-primary-600">
                <img
                  src={selectedEvent.featured_image_url}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Content */}
            <div className="p-8">
              {/* Type Badge */}
              <div className="mb-4">
                {(() => {
                  const color = getEventColor(selectedEvent.event_type);
                  return (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${color.bg} ${color.text}`}>
                      {selectedEvent.event_type.charAt(0).toUpperCase() + selectedEvent.event_type.slice(1)}
                    </span>
                  );
                })()}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h1>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">{formatDate(selectedEvent.start_date)}</div>
                    <div className="text-gray-600">{formatTime(selectedEvent.start_date)}</div>
                    {selectedEvent.end_date && (
                      <div className="text-sm text-gray-500 mt-1">
                        until {formatTime(selectedEvent.end_date)}
                      </div>
                    )}
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">{selectedEvent.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Full Content */}
              {selectedEvent.content && selectedEvent.content !== selectedEvent.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedEvent.content}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
