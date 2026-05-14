'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { mothersApi, childrenApi } from '@/lib/healthcare-api';
import { api } from '@/lib/api';
import { WoredaStats } from '@/components/woreda/WoredaStats';
import { ChildList } from '@/components/woreda/ChildList';
import { FacilityList } from '@/components/woreda/FacilityList';

interface Child {
  _id: string;
  name?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  mother: {
    _id: string;
    name: string;
    phone: string;
  };
  birthFacility: {
    _id: string;
    name: string;
    type: 'HOSPITAL' | 'HEALTH_CENTER';
  };
  woreda: string;
  registrationTimestamp: string;
  verified: boolean;
}

interface Mother {
  _id: string;
  name: string;
  phone: string;
  age: number;
  address: string;
  healthCenter: {
    _id: string;
    name: string;
    type: string;
  };
  status: 'ACTIVE' | 'DELIVERED' | 'INACTIVE';
  registrationDate: string;
  expectedDeliveryDate?: string;
  highRisk: boolean;
}

interface Facility {
  _id: string;
  name: string;
  type: 'HOSPITAL' | 'HEALTH_CENTER';
  woreda: string;
  city: string;
  address: string;
  contactPhone: string;
}

export default function WoredaDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'facilities'>('overview');

  useEffect(() => {
    // Wait until user is loaded before fetching
    if (user !== undefined) {
      fetchWoredaData();
    }
  }, [user]);

  const fetchWoredaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const woreda = user?.woredaId;
      
      if (!woreda) {
        // User is loaded but has no woredaId — show a clear message instead of crashing
        setError('No woreda is assigned to your account. Please contact your administrator to assign a woreda.');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [childrenResponse, facilitiesResponse] = await Promise.all([
        childrenApi.getByWoreda(woreda.toString()).catch(() => []),
        api.getHospitals().catch(() => []),
      ]);

      // Filter facilities by woreda
      const filteredFacilities = Array.isArray(facilitiesResponse)
        ? facilitiesResponse.filter((facility: any) => {
            const fWoreda =
              facility.woredaId?._id?.toString() ??
              facility.woredaId?.toString() ??
              facility.woreda?._id?.toString() ??
              facility.woreda?.toString() ??
              '';
            return fWoreda === woreda.toString();
          })
        : [];

      setChildren(Array.isArray(childrenResponse) ? childrenResponse : []);
      setFacilities(filteredFacilities);
    } catch (err: any) {
      console.error('Error fetching woreda data:', err);
      setError(err.message || 'Failed to load woreda data');
    } finally {
      setLoading(false);
    }
  };

  const handleChildVerification = async (childId: string) => {
    try {
      await childrenApi.verify(childId);
      fetchWoredaData();
    } catch (err: any) {
      console.error('Error verifying child:', err);
      alert('Failed to verify child record');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="WOREDA_ADMIN">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading woreda dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="WOREDA_ADMIN">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">{'\u26a0\ufe0f'}</div>
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={fetchWoredaData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="WOREDA_ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Woreda Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Woreda: {user?.woredaId || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 whitespace-nowrap">Welcome, {user?.name}</span>
                <Link href="/woreda-dashboard/profile" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                  My Profile
                </Link>
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="whitespace-nowrap bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('children')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'children'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Newborn Children ({children.length})
              </button>
              <button
                onClick={() => setActiveTab('facilities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'facilities'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Facilities ({facilities.length})
              </button>
              <Link
                href="/woreda-dashboard/birth-certificates"
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-green-600 hover:border-green-500 whitespace-nowrap"
              >
                📄 Birth Certificates
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <WoredaStats 
                  mothers={[]}
                  children={children}
                  facilities={facilities}
                />
              </div>
            )}

            {activeTab === 'children' && (
              <ChildList 
                children={children}
                onVerify={handleChildVerification}
                onRefresh={fetchWoredaData}
              />
            )}


            {activeTab === 'facilities' && (
              <FacilityList 
                facilities={facilities}
                children={children}
              />
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
