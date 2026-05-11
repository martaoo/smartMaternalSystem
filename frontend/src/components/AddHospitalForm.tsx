'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AddHospitalFormProps {
  onClose: () => void;
  onSuccess: () => void;
  hospitalToEdit?: any;
}

export function AddHospitalForm({ onClose, onSuccess, hospitalToEdit }: AddHospitalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'HEALTH_CENTER',
    location: '',
    contact: '',
    woredaId: '',
  });
  const [woredas, setWoredas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getWoredas().then(setWoredas).catch(console.error);
  }, []);

  useEffect(() => {
    if (hospitalToEdit) {
      setFormData({
        name: hospitalToEdit.name || '',
        type: hospitalToEdit.type || 'HOSPITAL',
        location: hospitalToEdit.location || '',
        contact: hospitalToEdit.contact || '',
        woredaId: hospitalToEdit.woredaId?._id?.toString() || hospitalToEdit.woredaId?.toString() || '',
      });
    }
  }, [hospitalToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate phone number format if contact is provided
      if (formData.contact && !/^09\d{8}$/.test(formData.contact)) {
        setError('Contact number must start with 09 followed by 8 digits (e.g., 0911234567)');
        setLoading(false);
        return;
      }

      if (hospitalToEdit?._id) {
        await api.updateHospital(hospitalToEdit._id, formData);
      } else {
        await api.createHospital({
        ...formData,
        type: 'HEALTH_CENTER',
      });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {hospitalToEdit ? 'Edit Hospital' : 'Add New Hospital'}
        </h2>
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
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              placeholder="0911234567"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Woreda</label>
            <select
              required
              value={formData.woredaId}
              onChange={(e) => setFormData({ ...formData, woredaId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Woreda</option>
              {woredas.map((woreda: any) => (
                <option key={woreda._id} value={woreda._id}>
                  {woreda.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
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
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (hospitalToEdit ? 'Updating...' : 'Creating...') : (hospitalToEdit ? 'Update Hospital' : 'Create Hospital')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}