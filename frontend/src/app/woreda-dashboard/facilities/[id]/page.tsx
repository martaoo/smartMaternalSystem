'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { childrenApi } from '@/lib/healthcare-api';

interface Facility {
  _id: string;
  name: string;
  type: 'HOSPITAL' | 'HEALTH_CENTER';
  woredaId: any;
  location: string;
  address: string;
  contact: string;
}

interface Child {
  _id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherId: { name: string; phone: string };
  verified: boolean;
}

export default function FacilityDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [facilityData, childrenData] = await Promise.all([
        api.getHospital(id as string),
        childrenApi.getAll() // We'll filter this
      ]);
      
      setFacility(facilityData);
      
      // Filter children belonging to this facility
      const filteredChildren = Array.isArray(childrenData) 
        ? childrenData.filter((c: any) => {
            const childHospitalId = c.birthHospital?._id || c.birthHospital || c.birthFacility?._id || c.birthFacility;
            return childHospitalId === id;
          })
        : [];
      
      setChildren(filteredChildren);
    } catch (err: any) {
      console.error('Error fetching facility details:', err);
      setError(err.message || 'Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="WOREDA_ADMIN">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !facility) {
    return (
      <ProtectedRoute requiredRole="WOREDA_ADMIN">
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <p className="text-red-600 mb-4">{error || 'Facility not found'}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="WOREDA_ADMIN">
      <div className="min-h-screen bg-gray-50 pb-12">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{facility.name}</h1>
                <p className="text-sm text-gray-500 uppercase tracking-wider">{facility.type}</p>
              </div>
            </div>
            <a 
              href={`tel:${facility.contact}`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Call Facility
            </a>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Address</label>
                    <p className="text-gray-700 font-medium">{facility.address || facility.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Contact Phone</label>
                    <p className="text-gray-700 font-medium">{facility.contact || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Facility Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{children.length}</p>
                    <p className="text-xs text-gray-500">Total Births</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {children.filter(c => c.verified).length}
                    </p>
                    <p className="text-xs text-gray-500">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Children Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
                  <span className="text-sm text-gray-500">{children.length} total</span>
                </div>
                {children.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic">
                    No birth registrations found for this facility.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Child</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Birth Date</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Mother</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {children.map(child => (
                          <tr key={child._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{child.name || '(Unnamed)'}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(child.birthDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-gray-600">{child.motherId?.name || '—'}</td>
                            <td className="px-6 py-4">
                              {child.verified ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <span className="text-yellow-600">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
