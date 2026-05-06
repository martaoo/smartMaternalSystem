'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Woreda {
  _id: string;
  name: string;
  city: string;
  regionId?: string | { name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function WoredasPage() {
  const { user } = useAuth();
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [filteredWoredas, setFilteredWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWoreda, setEditingWoreda] = useState<Woreda | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetchWoredas();
    api.getRegions().then(setRegions).catch(console.error);
  }, []);

  const fetchWoredas = async () => {
    try {
      setLoading(true);
      const data = await api.getWoredas();
      setWoredas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch woredas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = selectedRegion 
      ? woredas.filter(woreda => {
          if (!woreda.regionId) return false;
          const regionName = typeof woreda.regionId === 'object' ? (woreda.regionId as any).name : woreda.regionId;
          return regionName === selectedRegion;
        })
      : woredas;
    setFilteredWoredas(filtered);
  }, [woredas, selectedRegion]);

  const handleEdit = (woreda: Woreda) => {
    setEditingWoreda(woreda);
    setShowEditForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this woreda?')) return;
    
    try {
      await api.deleteWoreda(id);
      setWoredas(woredas.filter(w => w._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete woreda');
    }
  };

  const handleUpdate = async (updatedData: Partial<Woreda>) => {
    if (!editingWoreda) return;
    
    try {
      const updated = await api.updateWoreda(editingWoreda._id, updatedData);
      setWoredas(woredas.map(w => w._id === editingWoreda._id ? updated : w));
      setShowEditForm(false);
      setEditingWoreda(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update woreda');
    }
  };

  return (
    <ProtectedRoute requiredRole={['SUPER_ADMIN', 'SYSTEM_ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Woredas Management</h1>
                  <p className="text-sm text-gray-500">Administrative Woredas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">All Woredas</h2>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Filter by Region:</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Regions</option>
                      {Array.from(new Set(woredas.map(w => {
                        const regionName = typeof w.regionId === 'object' ? (w.regionId as any)?.name : w.regionId;
                        return regionName || 'Unknown';
                      }))).map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading woredas...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWoredas.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            {selectedRegion ? `No woredas found in region "${selectedRegion}"` : 'No woredas found. Create your first woreda to get started.'}
                          </td>
                        </tr>
                      ) : (
                        filteredWoredas.map((woreda) => (
                          <tr key={woreda._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {woreda.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {woreda.city}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(woreda.regionId as any)?.name || woreda.regionId || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(woreda.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(woreda)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(woreda._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditForm && editingWoreda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Woreda</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdate({
                name: editingWoreda.name,
                city: editingWoreda.city,
                regionId: editingWoreda.regionId,
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  defaultValue={editingWoreda.name}
                  onChange={(e) => setEditingWoreda({ ...editingWoreda, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  required
                  defaultValue={editingWoreda.city}
                  onChange={(e) => setEditingWoreda({ ...editingWoreda, city: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <select
                  required
                  value={typeof editingWoreda.regionId === 'object' ? (editingWoreda.regionId as any)._id : editingWoreda.regionId || ''}
                  onChange={(e) => setEditingWoreda({ ...editingWoreda, regionId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select Region</option>
                  {regions.map((region: any) => (
                    <option key={region._id} value={region._id?.toString() ?? ''}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingWoreda(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
