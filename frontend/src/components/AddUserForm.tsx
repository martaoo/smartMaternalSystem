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

// Roles that require a facility (hospital or health center) assignment
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
    return rawWoreda._id?.toString?.() ?? rawWoreda.id?.toString?.() ?? '';
  }
  return String(rawWoreda);
};

const normalizeFacilityType = (facility: any): string =>
  String(facility?.type ?? '').trim().toUpperCase().replace(/\s+/g, '_');

export function AddUserForm({
  onClose,
  onSuccess,
  userToEdit,
  allowedRoles,
  hideHospitalSelect,
  fixedHospitalId,
}: AddUserFormProps) {
  const { user: authUser } = useAuth();

  // ── Creator role flags ────────────────────────────────────────────────────
  const isSuperAdmin = authUser?.role === 'SUPER_ADMIN';
  const isSystemAdmin = authUser?.role === 'SYSTEM_ADMIN';
  const isFacilityAdmin =
    authUser?.role === 'HOSPITAL_ADMIN' || authUser?.role === 'HEALTH_CENTER_ADMIN';

  // SUPER_ADMIN and SYSTEM_ADMIN must manually pick facility/woreda/region
  const mustSelectFacility = isSuperAdmin || isSystemAdmin;
  // Facility admins auto-assign from their own context
  const autoAssignFacility = isFacilityAdmin;

  const canAssignWoreda =
    isSuperAdmin || isSystemAdmin || authUser?.role === 'MOH_ADMIN';

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<AddUserFormValues>({
    email: '',
    password: '',
    name: '',
    role: allowedRoles?.[0] ?? 'DOCTOR',
    hospitalId: fixedHospitalId ?? (autoAssignFacility ? (authUser?.hospitalId ?? '') : ''),
    woredaId: autoAssignFacility ? (authUser?.woredaId ?? '') : '',
    regionId: '',
    phoneNumber: '',
  });

  const [hospitals, setHospitals] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Fetch reference data ──────────────────────────────────────────────────
  useEffect(() => {
    // SUPER_ADMIN and SYSTEM_ADMIN need to pick from all hospitals/health centers
    if (mustSelectFacility) {
      api.getHospitals().then((data) => {
        setHospitals(Array.isArray(data) ? data : []);
        setFilteredHospitals(Array.isArray(data) ? data : []);
      }).catch(console.error);
    }

    if (canAssignWoreda) {
      api.getWoredas().then((data) => {
        setWoredas(Array.isArray(data) ? data : []);
      }).catch(console.error);
    }

    api.getRegions().then((data) => {
      setRegions(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, [mustSelectFacility, canAssignWoreda]);

  // ── Auto-assign woreda when hospital is selected (SUPER/SYSTEM admin) ─────
  useEffect(() => {
    if (!mustSelectFacility) return;
    if (!formData.hospitalId || hospitals.length === 0) return;

    const selected = hospitals.find((h: any) => h._id?.toString() === formData.hospitalId);
    if (selected) {
      const wid = extractWoredaId(selected);
      if (wid && formData.woredaId !== wid) {
        setFormData(prev => ({ ...prev, woredaId: wid }));
      }
    }
  }, [formData.hospitalId, hospitals, mustSelectFacility]);

  // ── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (!userToEdit) return;
    const extractId = (v: any) =>
      typeof v === 'object' ? (v as any)?._id ?? '' : (v as string) ?? '';

    setFormData({
      email: userToEdit.email || '',
      password: '',
      name: userToEdit.name || '',
      role: userToEdit.role || (allowedRoles?.[0] ?? 'DOCTOR'),
      hospitalId: fixedHospitalId ?? extractId(userToEdit.hospitalId),
      woredaId: extractId(userToEdit.woredaId),
      regionId: extractId(userToEdit.regionId),
      phoneNumber: userToEdit.phoneNumber ?? '',
    });
  }, [userToEdit, fixedHospitalId, allowedRoles]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleWoredaChange = (woredaId: string) => {
    setFormData(prev => ({ ...prev, woredaId, hospitalId: '' }));
    if (woredaId) {
      const inWoreda = hospitals.filter((h: any) => extractWoredaId(h) === woredaId);
      setFilteredHospitals(inWoreda);
    } else {
      setFilteredHospitals(hospitals);
    }
  };

  const handleHospitalChange = (hospitalId: string) => {
    if (!hospitalId) {
      setFormData(prev => ({ ...prev, hospitalId: '' }));
      return;
    }
    const selected = hospitals.find((h: any) => h._id?.toString() === hospitalId);
    if (selected) {
      const wid = extractWoredaId(selected);
      setFormData(prev => ({ ...prev, hospitalId, woredaId: wid || prev.woredaId }));
      if (wid) {
        setFilteredHospitals(hospitals.filter((h: any) => extractWoredaId(h) === wid));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Phone validation
      if (formData.phoneNumber) {
        const valid = /^(09\d{8}|07\d{8}|\+2519\d{8}|\+2517\d{8}|2519\d{8}|2517\d{8})$/.test(
          formData.phoneNumber,
        );
        if (!valid) {
          setError('Phone must be a valid Ethiopian number: 09XXXXXXXX, 07XXXXXXXX, or +2519XXXXXXXX');
          setLoading(false);
          return;
        }
      }

      const dataToSend: any = { ...formData };

      // Facility admins: force their own facility onto the new user
      if (autoAssignFacility) {
        dataToSend.hospitalId = authUser?.hospitalId;
        dataToSend.woredaId = authUser?.woredaId;
      }

      // Strip hospitalId for non-facility-scoped roles
      if (!HOSPITAL_SCOPED_ROLES.includes(formData.role)) {
        delete dataToSend.hospitalId;
      }

      // Strip woredaId for roles that don't need it
      if (!['WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN'].includes(formData.role)) {
        delete dataToSend.woredaId;
      }

      // Fixed hospital always wins
      if (fixedHospitalId) {
        dataToSend.hospitalId = fixedHospitalId;
      }

      if (userToEdit?._id) {
        await api.updateUser(userToEdit._id, dataToSend);
      } else {
        await api.createUser(dataToSend);
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
      setLoading(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const defaultRoles = [
    'SYSTEM_ADMIN', 'WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN',
    'DOCTOR', 'LIAISON_OFFICER', 'HOSPITAL_APPROVER', 'SPECIALIST',
    'GATEKEEPER', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN',
  ];
  const roles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : defaultRoles;

  const isHealthCenterRole = formData.role === 'HEALTH_CENTER_ADMIN';
  const facilityLabel = isHealthCenterRole ? 'Health Center' : 'Hospital / Facility';

  // For HEALTH_CENTER_ADMIN, only show HEALTH_CENTER type; otherwise show all
  const facilityOptions = isHealthCenterRole
    ? filteredHospitals.filter((h: any) => normalizeFacilityType(h) === 'HEALTH_CENTER')
    : filteredHospitals;

  const needsFacilitySelector =
    mustSelectFacility &&
    HOSPITAL_SCOPED_ROLES.includes(formData.role) &&
    !hideHospitalSelect &&
    !fixedHospitalId;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {userToEdit ? 'Edit User' : 'Add New User'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Basic fields ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password {userToEdit ? '' : '*'}
            </label>
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
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role *</label>
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

          {/* ── WOREDA_ADMIN: pick woreda ── */}
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
                    {w.name}{w.city ? ` — ${w.city}` : ''}
                  </option>
                ))}
              </select>
              {!formData.woredaId && (
                <p className="text-xs text-gray-400 mt-1">
                  A Woreda Admin must be assigned to exactly one woreda.
                </p>
              )}
            </div>
          )}

          {/* ── SUPER_ADMIN / SYSTEM_ADMIN: pick woreda → facility ── */}
          {needsFacilitySelector && (
            <>
              {/* Step 1: Woreda */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Woreda <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.woredaId}
                  onChange={(e) => handleWoredaChange(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select Woreda first</option>
                  {woredas.map((w: any) => (
                    <option key={w._id} value={w._id?.toString() ?? ''}>
                      {w.name}{w.city ? ` — ${w.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Facility */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {facilityLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.hospitalId}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={!formData.woredaId}
                >
                  <option value="">
                    {formData.woredaId ? `Select ${facilityLabel}` : 'Select Woreda first'}
                  </option>
                  {facilityOptions.map((h: any) => (
                    <option key={h._id} value={h._id?.toString() ?? ''}>
                      {h.name}
                      {h.type === 'HEALTH_CENTER' ? ' (Health Center)' : ' (Hospital)'}
                    </option>
                  ))}
                </select>
                {facilityOptions.length === 0 && formData.woredaId && (
                  <p className="text-xs text-amber-600 mt-1">
                    No {isHealthCenterRole ? 'health centers' : 'facilities'} found in this woreda.
                  </p>
                )}
                {formData.hospitalId && formData.woredaId && (
                  <p className="text-xs text-green-600 mt-1">✓ Woreda auto-assigned from facility</p>
                )}
              </div>
            </>
          )}

          {/* ── Facility admin: show read-only info ── */}
          {autoAssignFacility && HOSPITAL_SCOPED_ROLES.includes(formData.role) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700 font-medium mb-1">🏥 Auto-assigned from your account:</p>
              <p className="text-xs text-blue-600">
                Facility, woreda, and region will be automatically set to your assigned facility.
              </p>
            </div>
          )}

          {/* ── Phone ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="09XXXXXXXX or 07XXXXXXXX"
              maxLength={13}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ethiopian format: 09XXXXXXXX, 07XXXXXXXX, or +2519XXXXXXXX
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2 pt-2">
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
                  if (!window.confirm('Are you sure you want to delete this user?')) return;
                  setLoading(true);
                  try {
                    await api.deleteUser(userToEdit._id);
                    onSuccess();
                    onClose();
                  } catch (err: any) {
                    setError(err?.message || 'Failed to delete user');
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
