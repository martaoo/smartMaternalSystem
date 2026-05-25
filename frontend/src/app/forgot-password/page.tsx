"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState<ForgotForm>({ email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resolveApiUrl = (path: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
    if (!API_BASE) {
      throw new Error('API base URL not configured');
    }
    const normalized = API_BASE.replace(/\/$/, '');
    return normalized.endsWith('/api') ? `${normalized}${path}` : `${normalized}/api${path}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = resolveApiUrl('/auth/forgot-password');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to send reset link');
      }

      setSuccess('sent');
    } catch (err: any) {
      const message = err?.message ? err.message : 'not sent';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your account email and we'll send a password reset link if an account exists.</p>

        {error && <div className="mb-4 text-red-700 bg-red-50 p-3 rounded">{error}</div>}
        {success && <div className="mb-4 text-green-700 bg-green-50 p-3 rounded">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/auth')} className="text-sm text-gray-600 hover:underline">Back to login</button>
        </div>
      </div>
    </div>
  );
}
