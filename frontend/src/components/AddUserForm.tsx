'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface UserForEdit {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId?: string | { name?: string } | null;
  woredaId?: string | { name?: string } | null;
  phoneNumber?: string;
}

interface AddUserFormProps {
  onClose: () => void;
  onSuccess: () => void;
  /** If defined, form will edit the given user instead of creating a new one */
  userToEdit?: UserForEdit;
  /** Override which roles are available in the role dropdown */
  allowedRoles?: string[];
  /** Hide the hospital selector (useful for hospital admins) */
  hideHospitalSelect?: boolean;
  /** Force the created/updated user to use this hospital ID (used when hideHospitalSelect=true) */
  fixedHospitalId?: string;
}

interface AddUserFormValues {
  email: string;
  password: string;
  name: string;
  role: string;
  hospitalId?: string;
  woredaId?: string;
  phoneNumber?: string;
}

export function AddUserForm({
  onClose,
  onSuccess,
  userToEdit,
  allowedRoles,
  hideHospitalSelect,
  fixedHospitalId,
}: AddUserFormProps) {
  const [formData, setFormData] = useState<AddUserFormValues>({
    email: '',
    password: '',
    name: '',
    role: allowedRoles?.[0] ?? 'DOCTOR',
    hospitalId: fixedHospitalId ?? '',
    woredaId: '',
    phoneNumber: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHospitals().then(setHospitals).catch(console.error);
    api.getWoredas().then(setWoredas).catch(console.error);
  }, []);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        email: userToEdit.email || '',
        password: '',
        name: userToEdit.name || '',
        role: userToEdit.role || (allowedRoles?.[0] ?? 'DOCTOR'),
        hospitalId:
          fixedHospitalId ??
          (typeof userToEdit.hospitalId === 'object'
            ? (userToEdit.hospitalId as any)?._id ?? ''
            : (userToEdit.hospitalId as string) ?? ''),
        woredaId:
          typeof userToEdit.woredaId === 'object'
            ? (userToEdit.woredaId as any)?._id ?? ''
            : (userToEdit.woredaId as string) ?? '',
        phoneNumber: userToEdit.phoneNumber ?? '',
      });
    }
  }, [userToEdit, fixedHospitalId, allowedRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend: any = { ...formData };
      if (!['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER'].includes(formData.role)) {
        delete dataToSend.hospitalId;
      }
      if (!['WOREDA_ADMIN', 'HOSPITAL_ADMIN'].includes(formData.role)) {
        delete dataToSend.woredaId;
      }

      // If hospital is fixed, ensure it's included even if not in form
      if (fixedHospitalId) {
        dataToSend.hospitalId = fixedHospitalId;
      }

      if (userToEdit?._id) {
        await api.updateUser(userToEdit._id, dataToSend);
      } else {
        await api.createUser(dataToSend);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const defaultRoles = [
    'MOH_ADMIN',
    'WOREDA_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'NURSE',
    'DISPATCHER',
    'MOTHER',
  ];

  const roles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : defaultRoles;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {userToEdit ? 'Edit User' : 'Add New User'}
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required={!userToEdit}
              minLength={6}
              placeholder={userToEdit ? 'Leave blank to keep current password' : undefined}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {!hideHospitalSelect && ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER'].includes(formData.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital</label>
              <select
                required
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital: any) => (
                  <option key={hospital._id} value={hospital._id?.toString() ?? ''}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {['WOREDA_ADMIN', 'HOSPITAL_ADMIN'].includes(formData.role) && (
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
                  <option key={woreda._id} value={woreda._id?.toString() ?? ''}>
                    {woreda.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {userToEdit && (
              <button
                type="button"
                onClick={async () => {
                  if (!userToEdit?._id) return;
                  const confirmed = window.confirm('Are you sure you want to delete this user?');
                  if (!confirmed) return;
                  setLoading(true);
                  try {
                    await api.deleteUser(userToEdit._id);
                    onSuccess();
                    onClose();
                  } catch (err: any) {
                    setError(err?.message || 'Failed to delete user');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete User
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (userToEdit ? 'Saving...' : 'Creating...') : userToEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}