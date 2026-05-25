'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AddHospitalFormProps {
  onClose: () => void;
  onSuccess: () => void;
  hospitalToEdit?: any;
}

// Normalize a regionId value (populated object OR raw ObjectId string) → plain string
function toRegionId(rid: any): string {
  if (!rid) return '';
  if (typeof rid === 'object') return rid._id?.toString() ?? rid.toString();
  return rid.toString();
}

export function AddHospitalForm({ onClose, onSuccess, hospitalToEdit }: AddHospitalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'HEALTH_CENTER',
    location: '',
    contact: '',
    woredaId: '',
  });

  const [regions, setRegions]               = useState<any[]>([]);
  const [woredas, setWoredas]               = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  // ── Load regions + woredas on mount ────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.getRegions().catch(() => []),
      api.getWoredas().catch(() => []),
    ]).then(([r, w]) => {
      setRegions(Array.isArray(r) ? r : []);
      setWoredas(Array.isArray(w) ? w : []);
    });
  }, []);

  // ── Pre-fill when editing ───────────────────────────────────────────────────
  useEffect(() => {
    if (!hospitalToEdit) return;
    const woredaId =
      hospitalToEdit.woredaId?._id?.toString() ||
      hospitalToEdit.woredaId?.toString() || '';

    setFormData({
      name:     hospitalToEdit.name     || '',
      type:     hospitalToEdit.type     || 'HOSPITAL',
      location: hospitalToEdit.location || '',
      contact:  hospitalToEdit.contact  || '',
      woredaId,
    });

    // Derive region from the populated woreda object on the hospital
    const regionId = toRegionId(hospitalToEdit.woredaId?.regionId);
    if (regionId) setSelectedRegionId(regionId);
  }, [hospitalToEdit]);

  // ── When woredas load in edit mode, derive region if not yet set ────────────
  useEffect(() => {
    if (!formData.woredaId || woredas.length === 0 || selectedRegionId) return;
    const matched = woredas.find((w: any) => w._id?.toString() === formData.woredaId);
    if (matched) {
      const rid = toRegionId(matched.regionId);
      if (rid) setSelectedRegionId(rid);
    }
  }, [woredas, formData.woredaId, selectedRegionId]);

  // ── Derived: only woredas that belong to the selected region ───────────────
  const filteredWoredas = selectedRegionId
    ? woredas.filter((w: any) => toRegionId(w.regionId) === selectedRegionId)
    : [];   // show nothing until a region is chosen

  // ── Region change: clear woreda if it no longer belongs ────────────────────
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    // If the currently selected woreda is not in the new region, clear it
    if (formData.woredaId) {
      const current = woredas.find((w: any) => w._id?.toString() === formData.woredaId);
      if (toRegionId(current?.regionId) !== regionId) {
        setFormData(prev => ({ ...prev, woredaId: '' }));
      }
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (formData.contact && !/^09\d{8}$/.test(formData.contact)) {
        setError('Contact number must start with 09 followed by 8 digits (e.g., 0911234567)');
        setLoading(false);
        return;
      }
      if (!selectedRegionId) {
        setError('Please select a region');
        setLoading(false);
        return;
      }
      if (!formData.woredaId) {
        setError('Please select a woreda');
        setLoading(false);
        return;
      }
      if (hospitalToEdit?._id) {
        await api.updateHospital(hospitalToEdit._id, formData);
      } else {
        await api.createHospital(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save facility');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers for display ─────────────────────────────────────────────────────
  const selectedRegionName =
    regions.find((r: any) => r._id?.toString() === selectedRegionId)?.name || '';

  const selectedWoreda = formData.woredaId
    ? woredas.find((w: any) => w._id?.toString() === formData.woredaId)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-bold mb-5 text-gray-900">
          {hospitalToEdit ? 'Edit Facility' : 'Add New Facility'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Addis Ababa General Hospital"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="HOSPITAL">Hospital</option>
              <option value="HEALTH_CENTER">Health Center</option>
              <option value="CLINIC">Clinic</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location / Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text" required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Kirkos Sub-city, Addis Ababa"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
              placeholder="0911234567"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Format: 09XXXXXXXX</p>
          </div>

          {/* ── Step 1: Region ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedRegionId}
              onChange={e => handleRegionChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">— Select Region —</option>
              {regions.map((r: any) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* ── Step 2: Woreda (only shown after region is selected) ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Woreda <span className="text-red-500">*</span>
              {selectedRegionName && (
                <span className="ml-2 text-xs font-normal text-blue-600">
                  in {selectedRegionName}
                </span>
              )}
            </label>
            <select
              required
              value={formData.woredaId}
              onChange={e => setFormData({ ...formData, woredaId: e.target.value })}
              disabled={!selectedRegionId}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedRegionId
                  ? '← Select a region first'
                  : filteredWoredas.length === 0
                    ? 'No woredas in this region'
                    : '— Select Woreda —'}
              </option>
              {filteredWoredas.map((w: any) => (
                <option key={w._id} value={w._id}>
                  {w.name}{w.city ? ` (${w.city})` : ''}
                </option>
              ))}
            </select>

            {selectedRegionId && filteredWoredas.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ No woredas found in this region. Add a woreda first.
              </p>
            )}
          </div>

          {/* Confirmation banner */}
          {selectedWoreda && selectedRegionName && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <span className="mt-0.5">✓</span>
              <div>
                <p><strong>{selectedWoreda.name}</strong>{selectedWoreda.city ? ` (${selectedWoreda.city})` : ''}</p>
                <p className="text-xs text-green-600">Region: {selectedRegionName} — auto-assigned from woreda</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button" onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading
                ? (hospitalToEdit ? 'Updating…' : 'Creating…')
                : (hospitalToEdit ? 'Update Facility' : 'Create Facility')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
