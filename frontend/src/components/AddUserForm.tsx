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
  return String(facility?.type ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
};

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
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHospitals().then((hospitalsData) => {
      setHospitals(hospitalsData);
      setFilteredHospitals(hospitalsData); // Initially show all hospitals
    }).catch(console.error);
    api.getWoredas().then(setWoredas).catch(console.error);
  }, []);

  // Auto-assign woreda when hospitals and woredas are loaded and form has hospitalId
  useEffect(() => {
    if (formData.hospitalId && hospitals.length > 0 && woredas.length > 0) {
      const selectedHospital = hospitals.find((hospital: any) => 
        hospital._id?.toString() === formData.hospitalId
      );
      
      if (selectedHospital) {
        const hospitalWoredaId = extractWoredaId(selectedHospital);
        
        if (hospitalWoredaId) {
          const woredaDetails = woredas.find((woreda: any) => 
            woreda._id?.toString() === hospitalWoredaId.toString()
          );
          
          if (woredaDetails && formData.woredaId !== hospitalWoredaId.toString()) {
            setFormData(prev => ({ 
              ...prev, 
              woredaId: hospitalWoredaId.toString() 
            }));
            console.log(`Auto-assigned woreda: ${woredaDetails.name} for hospital: ${selectedHospital.name}`);
          }
        }
      }
    }
  }, [formData.hospitalId, hospitals, woredas]);

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

  // Handle woreda change to filter hospitals and auto-assign woreda name
  const handleWoredaChange = (woredaId: string) => {
    setFormData(prev => ({ ...prev, woredaId }));
    
    if (woredaId) {
      // Filter hospitals based on selected woreda
      const hospitalsInWoreda = hospitals.filter((hospital: any) => {
        return extractWoredaId(hospital) === woredaId;
      });
      
      setFilteredHospitals(hospitalsInWoreda);
      
      // Clear hospital selection if it's not in the filtered list
      if (formData.hospitalId && !hospitalsInWoreda.find(h => h._id?.toString() === formData.hospitalId)) {
        setFormData(prev => ({ ...prev, hospitalId: '' }));
      }
      
      console.log(`Filtered hospitals for woreda: ${woredas.find(w => w._id?.toString() === woredaId)?.name}`);
    } else {
      // Show all hospitals when no woreda selected
      setFilteredHospitals(hospitals);
    }
  };

  // Handle hospital change to automatically assign woreda
  const handleHospitalChange = (hospitalId: string) => {
    setFormData(prev => ({ ...prev, hospitalId }));
    
    if (hospitalId) {
      // Find the selected hospital and get its woreda
      const selectedHospital = hospitals.find((hospital: any) => 
        hospital._id?.toString() === hospitalId
      );
      
      if (selectedHospital) {
        // Get woreda from hospital (could be woreda or woredaId field)
        const hospitalWoredaId = extractWoredaId(selectedHospital);
        
        if (hospitalWoredaId) {
          // Find the woreda details
          const woredaDetails = woredas.find((woreda: any) => 
            woreda._id?.toString() === hospitalWoredaId.toString()
          );
          
          if (woredaDetails) {
            // Auto-assign woreda and filter hospitals
            setFormData(prev => ({ 
              ...prev, 
              hospitalId, 
              woredaId: hospitalWoredaId.toString() 
            }));
            
            // Filter hospitals to show only those in the same woreda
            const hospitalsInWoreda = hospitals.filter((hospital: any) => {
              return extractWoredaId(hospital) === hospitalWoredaId.toString();
            });
            setFilteredHospitals(hospitalsInWoreda);
            
            console.log(`Auto-assigned woreda: ${woredaDetails.name} for hospital: ${selectedHospital.name}`);
          } else {
            console.warn('Woreda not found for hospital:', selectedHospital);
            setFormData(prev => ({ ...prev, hospitalId, woredaId: '' }));
          }
        } else {
          console.warn('Hospital does not have assigned woreda:', selectedHospital);
          setFormData(prev => ({ ...prev, hospitalId, woredaId: '' }));
        }
      }
    } else {
      // Clear both fields when hospital is cleared
      setFormData(prev => ({ ...prev, hospitalId: '' }));
      // Don't clear woreda when hospital is cleared, let user keep woreda selection
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend: any = { ...formData };
      if (!HOSPITAL_SCOPED_ROLES.includes(formData.role)) {
        delete dataToSend.hospitalId;
      }
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
    'MOTHER',
  ];

  const roles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : defaultRoles;
  const isHealthCenterAdminRole = formData.role === 'HEALTH_CENTER_ADMIN';
  const facilityOptions = isHealthCenterAdminRole
    ? filteredHospitals.filter((hospital: any) => normalizeFacilityType(hospital) === 'HEALTH_CENTER')
    : filteredHospitals;

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
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {['WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'HEALTH_CENTER_ADMIN'].includes(formData.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Woreda</label>
              {formData.hospitalId && !formData.woredaId ? (
                // Show loading state when hospital is selected but woreda not yet assigned
                <div className="mt-1">
                  <div className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 text-gray-500">
                    Loading woreda...
                  </div>
                </div>
              ) : formData.hospitalId && formData.woredaId ? (
                // Show auto-assigned woreda (read-only) when hospital is selected
                <div className="mt-1">
                  <div className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 text-gray-700">
                    {woredas.find((w: any) => w._id?.toString() === formData.woredaId)?.name || 'Auto-assigned woreda'}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Woreda automatically assigned from hospital location
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, hospitalId: '', woredaId: '' }));
                      setFilteredHospitals(hospitals);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                  >
                    Clear selection to choose woreda first
                  </button>
                </div>
              ) : (
                // Allow manual selection when no hospital is selected
                <div>
                  <select
                    required
                    value={formData.woredaId}
                    onChange={(e) => handleWoredaChange(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Woreda</option>
                    {woredas.map((woreda: any) => (
                      <option key={woreda._id} value={woreda._id?.toString() ?? ''}>
                        {woreda.name}
                      </option>
                    ))}
                  </select>
                  {formData.woredaId && (
                    <p className="text-xs text-green-600 mt-1">
                      Woreda selected. Hospitals filtered to show only facilities in this woreda.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {!hideHospitalSelect && HOSPITAL_SCOPED_ROLES.includes(formData.role) && (
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
                  {formData.woredaId 
                    ? isHealthCenterAdminRole
                      ? 'Select Health Center'
                      : 'Select Hospital'
                    : isHealthCenterAdminRole
                      ? 'Select Woreda first to filter health centers'
                      : 'Select Woreda first to filter hospitals'
                  }
                </option>
                {facilityOptions.map((hospital: any) => (
                  <option key={hospital._id} value={hospital._id?.toString() ?? ''}>
                    {hospital.name}
                  </option>
                ))}
              </select>
              {formData.woredaId && facilityOptions.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Showing {facilityOptions.length} {isHealthCenterAdminRole ? 'health center(s)' : 'hospital(s)'} in {woredas.find(w => w._id?.toString() === formData.woredaId)?.name}
                </p>
              )}
              {formData.woredaId && facilityOptions.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {isHealthCenterAdminRole
                    ? 'No health centers found in this woreda.'
                    : 'No hospitals found in this woreda. All hospitals shown.'}
                </p>
              )}
              {formData.hospitalId && formData.woredaId && (
                <p className="text-xs text-green-600 mt-1">
                  Woreda automatically assigned based on hospital location
                </p>
              )}
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
              {loading ? (userToEdit ? 'Saving...' : 'Creating...') : userToEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}