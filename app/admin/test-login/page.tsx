'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@ueab.ac.ke');
  const [password, setPassword] = useState('Changes@2025');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTest = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setResponse({
        status: res.status,
        ok: res.ok,
        data,
      });

      if (!res.ok) {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Login Test</h1>

        <div className="bg-slate-800 rounded-lg p-6 space-y-4 mb-6">
          <div>
            <label className="text-white block mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
            />
          </div>

          <div>
            <label className="text-white block mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 rounded p-4 mb-6">
            {error}
          </div>
        )}

        {response && (
          <div className="bg-slate-800 rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Response:</h2>
            <pre className="bg-slate-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
