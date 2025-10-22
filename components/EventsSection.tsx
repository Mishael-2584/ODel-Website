'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, MapPin, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  featured_image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string;
  event_type: string;
  slug: string;
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events/published');
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

  if (loading) {
    return (
      <div className="min-h-32 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      webinar: 'from-blue-600 to-blue-700',
      workshop: 'from-purple-600 to-purple-700',
      lecture: 'from-cyan-600 to-cyan-700',
      conference: 'from-pink-600 to-pink-700',
      deadline: 'from-red-600 to-red-700',
      holiday: 'from-green-600 to-green-700',
      other: 'from-gray-600 to-gray-700',
    };
    return colors[type] || colors.other;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Upcoming Events</h2>
            <p className="text-gray-400">Don't miss out on important dates and events</p>
          </div>
          <a
            href="#events"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
          >
            View All
            <ChevronRight size={20} />
          </a>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {events.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="group bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 flex"
            >
              {/* Image */}
              {event.featured_image_url ? (
                <div className="relative overflow-hidden w-32 h-32 bg-slate-700 flex-shrink-0">
                  <img
                    src={event.featured_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className={`w-32 h-32 bg-gradient-to-br ${getEventColor(event.event_type)} flex items-center justify-center flex-shrink-0`}>
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              )}

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${getEventColor(event.event_type)} text-white capitalize`}>
                      {event.event_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition line-clamp-2 mb-2">
                    {event.title}
                  </h3>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatDate(event.start_date)} at {formatTime(event.start_date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                <a
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center gap-2 mt-3 text-emerald-400 hover:text-emerald-300 transition text-sm font-medium"
                >
                  Learn More
                  <ChevronRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700" />
      </div>
    </section>
  );
}
