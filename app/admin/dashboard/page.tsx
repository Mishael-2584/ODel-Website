'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, LogOut, Menu, X } from 'lucide-react';
import NewsManager from '@/components/admin/NewsManager';
import EventsManager from '@/components/admin/EventsManager';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('news');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check admin authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const adminData = localStorage.getItem('admin_user');

        if (!token || !adminData) {
          router.push('/admin/login');
          return;
        }

        const admin = JSON.parse(adminData);
        
        // Verify admin has proper role
        if (admin.role !== 'admin' && admin.role !== 'editor' && admin.role !== 'super_admin' && admin.role !== 'Administrator') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/admin/login');
          return;
        }

        setAdminInfo(admin);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      // Redirect to login
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'news', label: 'News Management', icon: Newspaper },
    { id: 'events', label: 'Events Calendar', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    ODeL
                  </h1>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'text-gray-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Admin Info & Logout */}
          <div className="p-4 border-t border-slate-700 space-y-3">
            {sidebarOpen && adminInfo && (
              <div className="bg-slate-800 rounded-lg p-3 text-sm">
                <p className="text-gray-400">Logged in as</p>
                <p className="text-white font-medium truncate">{adminInfo.email || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{adminInfo.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut size={18} />
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}
      >
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-400">Manage your ODeL website content</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'events' && <EventsManager />}
        </div>
      </main>
    </div>
  );
}
