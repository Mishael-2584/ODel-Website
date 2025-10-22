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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-900 to-slate-950 flex flex-col">
      <Navbar />

      {/* Header with enhanced gradient */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-purple rounded-full mix-blend-screen filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary-500/50 backdrop-blur-sm">
              📅 Event Calendar
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-primary-100">
              Events Calendar
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover upcoming events and important dates at UEAB ODeL Center
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={prevMonth}
                    className="p-3 hover:bg-white/20 rounded-lg transition-all duration-200 text-white hover:text-primary-300 transform hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-3xl font-bold text-white">{monthName}</h2>
                  <button
                    onClick={nextMonth}
                    className="p-3 hover:bg-white/20 rounded-lg transition-all duration-200 text-white hover:text-primary-300 transform hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-primary-300 py-3 text-sm uppercase tracking-wider">
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
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth();
                    return (
                      <div
                        key={day}
                        className={`aspect-square border-2 rounded-xl p-2 transition-all duration-200 cursor-pointer ${
                          isToday
                            ? 'border-primary-400 bg-primary-500/30 shadow-lg shadow-primary-500/50'
                            : 'border-white/10 hover:border-primary-400 hover:bg-white/10'
                        }`}
                      >
                        <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary-300' : 'text-white'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const color = getEventColor(event.event_type);
                            return (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full text-xs px-2 py-1 rounded-lg truncate font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${color.bg} ${color.text} border ${color.border} hover:brightness-110`}
                              >
                                {event.title}
                              </button>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-primary-300 px-2 font-semibold">
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
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 sticky top-24 hover:border-white/40 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary-400" />
                  Upcoming Events
                </h3>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-primary-300 rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/60 mt-3">Loading events...</p>
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No events scheduled</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {events
                      .filter(event => new Date(event.start_date) >= new Date())
                      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                      .slice(0, 8)
                      .map(event => {
                        const color = getEventColor(event.event_type);
                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full text-left p-4 rounded-xl border ${color.border} ${color.bg} hover:shadow-lg hover:shadow-primary-500/50 transition-all duration-200 transform hover:translate-x-1 group`}
                          >
                            <div className="font-semibold text-white group-hover:text-primary-300 text-sm line-clamp-2 transition-colors">{event.title}</div>
                            <div className="text-xs text-white/70 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(event.start_date).split(',')[0]}
                            </div>
                            <div className={`inline-block text-xs px-2 py-1 rounded-full mt-2 font-medium ${color.text} bg-white/10 border ${color.border}`}>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 z-10 text-white hover:text-primary-300 transform hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Event Image */}
            {selectedEvent.featured_image_url && (
              <div className="relative w-full h-72 bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
                <img
                  src={selectedEvent.featured_image_url}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              </div>
            )}

            {/* Event Content */}
            <div className="p-8">
              {/* Type Badge */}
              <div className="mb-6">
                {(() => {
                  const color = getEventColor(selectedEvent.event_type);
                  return (
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${color.bg} ${color.text} border ${color.border}`}>
                      {selectedEvent.event_type.charAt(0).toUpperCase() + selectedEvent.event_type.slice(1)}
                    </span>
                  );
                })()}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200">
                {selectedEvent.title}
              </h1>

              {/* Details */}
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all">
                  <Calendar className="w-6 h-6 text-primary-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-white text-lg">{formatDate(selectedEvent.start_date)}</div>
                    <div className="text-gray-300 mt-1 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(selectedEvent.start_date)}
                      {selectedEvent.end_date && (
                        <>
                          {' — '}
                          {formatTime(selectedEvent.end_date)}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all">
                    <MapPin className="w-6 h-6 text-primary-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-white text-lg">{selectedEvent.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-3">About This Event</h3>
                <p className="text-gray-300 leading-relaxed text-base">{selectedEvent.description}</p>
              </div>

              {/* Full Content */}
              {selectedEvent.content && selectedEvent.content !== selectedEvent.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-3">Event Details</h3>
                  <p className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">{selectedEvent.content}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-primary-500/50 transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>

      <Footer />
    </div>
  );
}
