'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store admin session token
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block group mb-4">
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-500 to-emerald-500 p-2 rounded-lg group-hover:scale-110 group-hover:shadow-lg transition-all">
                  <Image 
                    src="https://ueab.ac.ke/wp-content/uploads/2025/03/logo-2.png" 
                    alt="UEAB ODeL Logo - Click to go home"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              ODeL Admin
            </h1>
            <p className="text-gray-400">Admin Panel Login</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ueab.ac.ke"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                {/* Lock icon removed as per edit hint */}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 bg-slate-700 border-slate-600 rounded cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-400 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Logging in...' : 'Login to Admin Panel'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-gray-400">
              For support, contact{' '}
              <a href="mailto:info@ueab.ac.ke" className="text-blue-400 hover:text-blue-300">
                info@ueab.ac.ke
              </a>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            🔒 This is a secure admin area. Only authorized administrators can access.
          </p>
        </div>
      </div>
    </div>
  );
}
