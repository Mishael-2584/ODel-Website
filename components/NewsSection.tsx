'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  featured_image_url: string | null;
  created_at: string;
  slug: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news/published');
        const result = await res.json();
        setNews(result.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-32 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Latest News</h2>
            <p className="text-gray-400">Stay updated with the latest from ODeL</p>
          </div>
          <a
            href="#news"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            View All
            <ChevronRight size={20} />
          </a>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="group bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col"
            >
              {/* Image */}
              {item.featured_image_url ? (
                <div className="relative overflow-hidden h-48 bg-slate-700">
                  <img
                    src={item.featured_image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <Calendar size={16} />
                  <time>{formatDate(item.created_at)}</time>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2 flex-1">
                  {item.description}
                </p>

                <a
                  href={`/news/${item.slug}`}
                  className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition text-sm font-medium"
                >
                  Read More
                  <ChevronRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-slate-700" />
      </div>
    </section>
  );
}
