'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AddWoredaFormProps {
  onClose: () => void;
  onSuccess: () => void;
  woredaToEdit?: any;
}

export function AddWoredaForm({ onClose, onSuccess, woredaToEdit }: AddWoredaFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    regionId: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    api.getRegions().then(setRegions).catch(console.error);
  }, []);

  useEffect(() => {
    if (woredaToEdit) {
      setFormData({
        name: woredaToEdit.name || '',
        city: woredaToEdit.city || '',
        regionId: woredaToEdit.regionId?._id?.toString() || woredaToEdit.regionId?.toString() || '',
      });
    }
  }, [woredaToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (woredaToEdit?._id) {
        await api.updateWoreda(woredaToEdit._id, formData);
      } else {
        await api.createWoreda(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save woreda');
    } finally {
      setLoading(false);
    }
  };

  const ethiopianRegions = [
    'Oromia',
    'Amhara',
    'Tigray',
    'Somali',
    'Afar',
    'Sidama',
    'South Ethiopia',
    'Central Ethiopia',
    'Southwest Ethiopia Peoples\'',
    'Benishangul-Gumuz',
    'Gambela',
    'Harari',
    'Addis Ababa (City Administration)',
    'Dire Dawa (City Administration)'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-gray-700">Region</label>
            <select
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a region</option>
              {ethiopianRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (woredaToEdit ? 'Updating...' : 'Creating...') : (woredaToEdit ? 'Update Woreda' : 'Create Woreda')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}