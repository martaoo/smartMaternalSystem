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
  regionId?: string | { name?: string } | null;
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
  regionId?: string;
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
    regionId: '',
    phoneNumber: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHospitals().then(setHospitals).catch(console.error);
    api.getWoredas().then(setWoredas).catch(console.error);
    api.getRegions()
      .then((data) => {
        console.log('[AddUserForm] Regions fetched:', data);
        setRegions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[AddUserForm] Failed to fetch regions:', err);
        setRegions([]);
      });
  }, []);

  useEffect(() => {
    // Auto-populate woreda when hospital is selected for HOSPITAL_ADMIN role
    if (formData.role === 'HOSPITAL_ADMIN' && formData.hospitalId) {
      const selectedHospital = hospitals.find((hospital: any) => hospital._id === formData.hospitalId);
      if (selectedHospital?.woredaId) {
        const woredaId = typeof selectedHospital.woredaId === 'object' 
          ? selectedHospital.woredaId._id 
          : selectedHospital.woredaId;
        setFormData(prev => ({ ...prev, woredaId }));
      }
    }
  }, [formData.hospitalId, formData.role, hospitals]);

  useEffect(() => {
    if (userToEdit) {
      console.log('[AddUserForm] Editing user:', userToEdit);
      console.log('[AddUserForm] User role:', userToEdit.role);
      console.log('[AddUserForm] User regionId:', userToEdit.regionId);
      const extractedRegionId = typeof userToEdit.regionId === 'object'
        ? (userToEdit.regionId as any)?._id ?? ''
        : (userToEdit.regionId as string) ?? '';
      console.log('[AddUserForm] Extracted regionId:', extractedRegionId);
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
        regionId: extractedRegionId,
        phoneNumber: userToEdit.phoneNumber ?? '',
      });
    }
  }, [userToEdit, fixedHospitalId, allowedRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate phone number format
      if (formData.phoneNumber && !/^09\d{8}$/.test(formData.phoneNumber)) {
        setError('Phone number must start with 09 followed by 8 digits (e.g., 0911234567)');
        setLoading(false);
        return;
      }

      const dataToSend: any = { ...formData };
      if (!['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER', 'LIAISON_OFFICER', 'MIDWIFE'].includes(formData.role)) {
        delete dataToSend.hospitalId;
      }
      if (!['WOREDA_ADMIN', 'HOSPITAL_ADMIN'].includes(formData.role)) {
        delete dataToSend.woredaId;
      }
      if (formData.role === 'SYSTEM_ADMIN') {
        const regionId = formData.regionId?.toString().trim();
        if (!regionId) {
          setError('Region is required for System Admin');
          setLoading(false);
          return;
        }
        dataToSend.regionId = regionId;
      } else {
        delete dataToSend.regionId;
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
    'SUPER_ADMIN',
    'SYSTEM_ADMIN',
    'WOREDA_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'NURSE',
    'MIDWIFE',
    'LIAISON_OFFICER',
    'DISPATCHER',
    'EMERGENCY_ADMIN',
  ];

  const roles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : defaultRoles;

  console.log('[AddUserForm] Render - role:', formData.role, 'regionId:', formData.regionId, 'regions count:', regions.length);

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
          {!hideHospitalSelect &&
            ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'DISPATCHER', 'LIAISON_OFFICER', 'MIDWIFE'].includes(formData.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Facility</label>
              <select
                required
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Facility</option>
                {hospitals.map((hospital: any) => (
                  <option key={hospital._id} value={hospital._id?.toString() ?? ''}>
                    {hospital.name} - {hospital.type}
                  </option>
                ))}
              </select>
            </div>
          )}
          {['WOREDA_ADMIN', 'HOSPITAL_ADMIN'].includes(formData.role) && (
            <div>
              {formData.role === 'WOREDA_ADMIN' || (formData.role === 'HOSPITAL_ADMIN' && formData.hospitalId) ? (
                <>
                  <label className="block text-sm font-medium text-gray-700">Woreda</label>
                  <select
                    required={formData.role === 'WOREDA_ADMIN'}
                    disabled={formData.role === 'HOSPITAL_ADMIN' && formData.hospitalId}
                    value={formData.woredaId}
                    onChange={(e) => setFormData({ ...formData, woredaId: e.target.value })}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${
                      formData.role === 'HOSPITAL_ADMIN' && formData.hospitalId ? 'bg-gray-100' : ''
                    }`}
                  >
                    <option value="">Select Woreda</option>
                    {woredas.map((woreda: any) => (
                      <option key={woreda._id} value={woreda._id?.toString() ?? ''}>
                        {woreda.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>
          )}
          {formData.role === 'SYSTEM_ADMIN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              {regions.length === 0 ? (
                <p className="text-sm text-red-600 mt-1">
                  No regions available. Please ensure regions are created in the system.
                </p>
              ) : (
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select Region</option>
                  {regions.map((region: any) => (
                    <option key={region._id} value={region._id?.toString() ?? ''}>
                      {region.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phoneNumber: value });
              }}
              placeholder="0911234567"
              pattern="09\d{8}"
              maxLength={10}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">Must start with 09 followed by 8 digits (e.g., 0911234567)</p>
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