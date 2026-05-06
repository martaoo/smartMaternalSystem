'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  userToEdit?: UserForEdit;
  allowedRoles?: string[];
  hideHospitalSelect?: boolean;
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

const HOSPITAL_SCOPED_ROLES = [
  'HOSPITAL_ADMIN',
  'HEALTH_CENTER_ADMIN',
  'DOCTOR',
  'NURSE',
  'MIDWIFE',
  'DISPATCHER',
  'LIAISON_OFFICER',
  'HOSPITAL_APPROVER',
  'GATEKEEPER',
  'SPECIALIST',
];

const extractWoredaId = (facility: any): string => {
  const rawWoreda = facility?.woreda ?? facility?.woredaId;
  if (!rawWoreda) return '';
  if (typeof rawWoreda === 'string') return rawWoreda;
  if (typeof rawWoreda === 'object') {
    return rawWoreda._id?.toString?.() ?? rawWoreda.id?.toString?.() ?? rawWoreda.toString?.() ?? '';
  }
  return rawWoreda.toString();
};

const normalizeFacilityType = (facility: any): string => {
  return String(facility?.type ?? '').trim().toUpperCase().replace(/\s+/g, '_');
};

export function AddUserForm({
  onClose,
  onSuccess,
  userToEdit,
  allowedRoles,
  hideHospitalSelect,
  fixedHospitalId,
}: AddUserFormProps) {
  const { user: authUser } = useAuth();

  const isSuperAdmin = authUser?.role === 'SUPER_ADMIN';
  const isFacilityAdmin =
    authUser?.role === 'HOSPITAL_ADMIN' || authUser?.role === 'HEALTH_CENTER_ADMIN';
  // Roles that can assign a woreda to WOREDA_ADMIN
  const canAssignWoreda = isSuperAdmin || authUser?.role === 'SYSTEM_ADMIN' || authUser?.role === 'MOH_ADMIN';

  const [formData, setFormData] = useState<AddUserFormValues>({
    email: '',
    password: '',
    name: '',
    role: allowedRoles?.[0] ?? 'DOCTOR',
    hospitalId: fixedHospitalId ?? (isFacilityAdmin ? (authUser?.hospitalId ?? '') : ''),
    woredaId: isFacilityAdmin ? (authUser?.woredaId ?? '') : '',
    regionId: '',
    phoneNumber: '',
  });
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isSuperAdmin) {
      api.getHospitals().then((data) => {
        setHospitals(data);
        setFilteredHospitals(data);
      }).catch(console.error);
    }
    // Fetch woredas for anyone who can assign a woreda (SUPER_ADMIN, SYSTEM_ADMIN, MOH_ADMIN)
    if (canAssignWoreda) {
      api.getWoredas().then(setWoredas).catch(console.error);
    }
    api.getRegions()
      .then((data) => {
        console.log('[AddUserForm] Regions fetched:', data);
        setRegions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[AddUserForm] Failed to fetch regions:', err);
        setRegions([]);
      });
  }, [isSuperAdmin, canAssignWoreda]);

  // Auto-assign woreda from hospital (super admin only)
  useEffect(() => {
    if (!isSuperAdmin) return;
    if (formData.hospitalId && hospitals.length > 0 && woredas.length > 0) {
      const selectedHospital = hospitals.find((h: any) => h._id?.toString() === formData.hospitalId);
      if (selectedHospital) {
        const hospitalWoredaId = extractWoredaId(selectedHospital);
        if (hospitalWoredaId && formData.woredaId !== hospitalWoredaId) {
          setFormData(prev => ({ ...prev, woredaId: hospitalWoredaId }));
        }
      }
    }
  }, [formData.hospitalId, hospitals, woredas, isSuperAdmin]);

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

  const handleWoredaChange = (woredaId: string) => {
    setFormData(prev => ({ ...prev, woredaId }));
    if (woredaId) {
      const hospitalsInWoreda = hospitals.filter((h: any) => extractWoredaId(h) === woredaId);
      setFilteredHospitals(hospitalsInWoreda);
      if (formData.hospitalId && !hospitalsInWoreda.find(h => h._id?.toString() === formData.hospitalId)) {
        setFormData(prev => ({ ...prev, hospitalId: '' }));
      }
    } else {
      setFilteredHospitals(hospitals);
    }
  };

  const handleHospitalChange = (hospitalId: string) => {
    if (!hospitalId) {
      setFormData(prev => ({ ...prev, hospitalId: '' }));
      return;
    }
    const selectedHospital = hospitals.find((h: any) => h._id?.toString() === hospitalId);
    if (selectedHospital) {
      const hospitalWoredaId = extractWoredaId(selectedHospital);
      const hospitalsInWoreda = hospitalWoredaId
        ? hospitals.filter((h: any) => extractWoredaId(h) === hospitalWoredaId)
        : hospitals;
      setFilteredHospitals(hospitalsInWoreda);
      setFormData(prev => ({
        ...prev,
        hospitalId,
        woredaId: hospitalWoredaId || prev.woredaId,
      }));
    }
  };

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

      if (!isSuperAdmin && isFacilityAdmin) {
        // Force hospital admin to use their own hospital ID
        dataToSend.hospitalId = authUser?.hospitalId;
        dataToSend.woredaId = authUser?.woredaId;
      }

      if (!HOSPITAL_SCOPED_ROLES.includes(formData.role)) {
        delete dataToSend.hospitalId;
      }
      // Keep woredaId for WOREDA_ADMIN, HOSPITAL_ADMIN, HEALTH_CENTER_ADMIN; strip for others
      if (!['WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN'].includes(formData.role)) {
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
    'SYSTEM_ADMIN',
    'WOREDA_ADMIN',
    'HOSPITAL_ADMIN',
    'HEALTH_CENTER_ADMIN',
    'DOCTOR',
    'LIAISON_OFFICER',
    'HOSPITAL_APPROVER',
    'SPECIALIST',
    'GATEKEEPER',
    'NURSE',
    'MIDWIFE',
    'DISPATCHER',
    'EMERGENCY_ADMIN',
    'EMERGENCY_ADMIN',
  ];

  const roles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : defaultRoles;
  const isHealthCenterAdminRole = formData.role === 'HEALTH_CENTER_ADMIN';
  const facilityOptions = isHealthCenterAdminRole
    ? filteredHospitals.filter((h: any) => normalizeFacilityType(h) === 'HEALTH_CENTER')
    : filteredHospitals;

  console.log('[AddUserForm] Render - role:', formData.role, 'regionId:', formData.regionId, 'regions count:', regions.length);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  {role.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Woreda selector — shown when creating WOREDA_ADMIN for any eligible creator */}
          {canAssignWoreda && formData.role === 'WOREDA_ADMIN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Woreda <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.woredaId}
                onChange={(e) => setFormData({ ...formData, woredaId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Woreda</option>
                {woredas.map((w: any) => (
                  <option key={w._id} value={w._id?.toString() ?? ''}>
                    {w.name}{w.city ? ` — ${w.city}` : ''}{w.region ? ` (${w.region})` : ''}
                  </option>
                ))}
              </select>
              {formData.woredaId && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Woreda assigned
                </p>
              )}
              {!formData.woredaId && (
                <p className="text-xs text-gray-400 mt-1">
                  A Woreda Admin must be assigned to exactly one woreda.
                </p>
              )}
            </div>
          )}

          {/* Facility selectors — only for SUPER_ADMIN creating hospital-scoped roles */}
          {isSuperAdmin && HOSPITAL_SCOPED_ROLES.includes(formData.role) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Woreda</label>
                <select
                  value={formData.woredaId}
                  onChange={(e) => handleWoredaChange(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select Woreda</option>
                  {woredas.map((w: any) => (
                    <option key={w._id} value={w._id?.toString() ?? ''}>{w.name}</option>
                  ))}
                </select>
              </div>
              {!isFacilityAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {isHealthCenterAdminRole ? 'Health Center' : 'Hospital'}
                </label>
                <select
                  required
                  value={formData.hospitalId}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">
                    {formData.woredaId ? 'Select facility' : 'Select Woreda first'}
                  </option>
                  {facilityOptions.map((h: any) => (
                    <option key={h._id} value={h._id?.toString() ?? ''}>{h.name}</option>
                  ))}
                </select>
                {formData.hospitalId && formData.woredaId && (
                  <p className="text-xs text-green-600 mt-1">Woreda auto-assigned from hospital location</p>
                )}
              </div>
            )}
            {isFacilityAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {isHealthCenterAdminRole ? 'Health Center' : 'Hospital'}
                </label>
                <input
                  type="text"
                  value={hospitals.find(h => h._id?.toString() === authUser?.hospitalId)?.name || 'Your Hospital'}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">You can only create users for your own hospital</p>
              </div>
            )}
            </>
          )}

          {/* Info note for facility admins */}
          {!isSuperAdmin && isFacilityAdmin && HOSPITAL_SCOPED_ROLES.includes(formData.role) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                🏥 Facility and woreda will be automatically assigned to your facility.
              </p>
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

          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
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
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete User
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? userToEdit ? 'Saving...' : 'Creating...'
                : userToEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
