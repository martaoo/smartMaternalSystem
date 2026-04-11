'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface HospitalWoredaListProps {
  showHospitals?: boolean;
  showWoredas?: boolean;
  preFilteredHospitals?: any[];
  preFilteredWoredas?: any[];
}

export function HospitalWoredaList({ 
  showHospitals = true, 
  showWoredas = true, 
  preFilteredHospitals, 
  preFilteredWoredas 
}: HospitalWoredaListProps) {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingHospital, setEditingHospital] = useState<any>(null);
  const [editingWoreda, setEditingWoreda] = useState<any>(null);

  const handleEditHospital = (hospital: any) => {
    setEditingHospital(hospital);
  };

  const handleDeleteHospital = async (hospital: any) => {
    if (!window.confirm(`Are you sure you want to delete "${hospital.name}"?`)) return;
    
    try {
      await api.deleteHospital(hospital._id);
      setHospitals(prev => prev.filter(h => h._id !== hospital._id));
    } catch (error) {
      console.error('Failed to delete hospital:', error);
      alert('Failed to delete hospital');
    }
  };

  const handleEditWoreda = (woreda: any) => {
    setEditingWoreda(woreda);
  };

  const handleDeleteWoreda = async (woreda: any) => {
    if (!window.confirm(`Are you sure you want to delete "${woreda.name}"?`)) return;
    
    try {
      await api.deleteWoreda(woreda._id);
      setWoredas(prev => prev.filter(w => w._id !== woreda._id));
    } catch (error) {
      console.error('Failed to delete woreda:', error);
      alert('Failed to delete woreda');
    }
  };

  useEffect(() => {
    // Use pre-filtered data if provided, otherwise fetch and filter
    if (preFilteredHospitals !== undefined && preFilteredWoredas !== undefined) {
      setHospitals(preFilteredHospitals);
      setWoredas(preFilteredWoredas);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [preFilteredHospitals, preFilteredWoredas]);

  const fetchData = async () => {
    try {
      const [hospitalsResponse, woredasResponse] = await Promise.all([
        api.getHospitals(),
        api.getWoredas()
      ]);

      let filteredHospitals = Array.isArray(hospitalsResponse) ? hospitalsResponse : [];
      let filteredWoredas = Array.isArray(woredasResponse) ? woredasResponse : [];

      // Filter based on user role
      if (user) {
        switch (user.role) {
          case 'SYSTEM_ADMIN':
            // System Admin sees hospitals/woredas in their assigned region
            filteredHospitals = filteredHospitals.filter(hospital => 
              hospital.woredaId && filteredWoredas.some(w => 
                w._id === hospital.woredaId && 
                (user.assignedRegion && w.region === user.assignedRegion)
              )
            );
            filteredWoredas = filteredWoredas.filter(w => 
              user.assignedRegion && w.region === user.assignedRegion
            );
            break;
            
          case 'WOREDA_ADMIN':
            // Woreda Admin sees hospitals/woredas in their woreda
            filteredHospitals = filteredHospitals.filter(hospital => 
              hospital.woredaId === user.woredaId
            );
            filteredWoredas = filteredWoredas.filter(w => 
              w._id === user.woredaId
            );
            break;
            
          case 'HOSPITAL_ADMIN':
            // Hospital Admin sees only their hospital
            filteredHospitals = filteredHospitals.filter(hospital => 
              hospital._id === user.hospitalId
            );
            // Woreda admins don't need to see woredas list
            filteredWoredas = [];
            break;
            
          case 'SUPER_ADMIN':
            // Super Admin sees everything
            break;
        }
      }

      setHospitals(filteredHospitals);
      setWoredas(filteredWoredas);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHospitals && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospitals ({hospitals.length})</h3>
          {hospitals.length === 0 ? (
            <p className="text-gray-500">No hospitals found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hospitals.map((hospital: any) => (
                    <tr key={hospital._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {hospital.type || 'HOSPITAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{hospital.location || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditHospital(hospital)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHospital(hospital)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showWoredas && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Woredas ({woredas.length})</h3>
          {woredas.length === 0 ? (
            <p className="text-gray-500">No woredas found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {woredas.map((woreda: any) => (
                    <tr key={woreda._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{woreda.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{woreda.region || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditWoreda(woreda)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWoreda(woreda)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
