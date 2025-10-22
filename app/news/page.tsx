'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronRight, Calendar, User, Search, X } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  featured_image_url: string | null;
  author_id: string;
  created_at: string;
  published_at: string;
  is_published: boolean;
  view_count: number;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

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

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">News & Updates</h1>
          <p className="text-xl text-primary-100 max-w-2xl">
            Stay informed with the latest news, announcements, and updates from UEAB ODeL
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-4 text-lg">Loading news...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'No articles found matching your search.' : 'No news articles available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 group"
                >
                  {/* Image */}
                  {article.featured_image_url ? (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                      <div className="text-primary-300 text-5xl">📰</div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {formatDate(article.published_at || article.created_at)}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.description}
                    </p>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                      Read More
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 transform hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Featured Image */}
            {selectedArticle.featured_image_url && (
              <div className="relative w-full h-96 bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
                <img
                  src={selectedArticle.featured_image_url}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            )}

            {/* Article Content */}
            <div className="p-8">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span>{formatDate(selectedArticle.published_at || selectedArticle.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm font-medium px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    Article
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-primary-600">
                {selectedArticle.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {selectedArticle.description}
              </p>

              {/* Full Content */}
              {selectedArticle.content && selectedArticle.content !== selectedArticle.description && (
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-primary-500/50 transform hover:scale-105"
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
