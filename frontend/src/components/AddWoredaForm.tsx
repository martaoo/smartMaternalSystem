'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AddWoredaFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWoredaForm({ onClose, onSuccess }: AddWoredaFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill region for System Admin
  useEffect(() => {
    if (user?.role === 'SYSTEM_ADMIN' && user?.assignedRegion) {
      setFormData(prev => ({ ...prev, region: user.assignedRegion || '' }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createWoreda(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create woreda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Woreda</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City/Subcity</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., Bole, Kirkos, Mekelle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region
              {user?.role === 'SYSTEM_ADMIN' && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  (Auto-filled from your assigned region)
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                user?.role === 'SYSTEM_ADMIN' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="e.g., Addis Ababa, Tigray"
              readOnly={user?.role === 'SYSTEM_ADMIN'}
            />
            {user?.role === 'SYSTEM_ADMIN' && (
              <p className="mt-1 text-xs text-gray-500">
                Region is automatically set to: {user.assignedRegion}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Woreda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}