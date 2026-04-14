'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { childrenApi } from '@/lib/healthcare-api';

interface Child {
  _id: string;
  name: string;
  birthDate: string;
  motherId: {
    _id: string;
    name: string;
    phone: string;
  };
  gender: 'MALE' | 'FEMALE';
  birthHospital: {
    _id: string;
    name: string;
    type: string;
  };
  deliveredBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  birthWeight?: number;
  birthHeight?: number;
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  registrationDate: string;
  deceased: boolean;
}

export default function ChildDetail() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [growthHistory, setGrowthHistory] = useState<any[]>([]);
  const [latestGrowth, setLatestGrowth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [childData, growthData, latestGrowthData] = await Promise.all([
        childrenApi.getById(childId),
        childrenApi.getGrowthRecords(childId),
        childrenApi.getLatestGrowthRecord(childId).catch(() => null)
      ]);

      setChild(childData);
      setGrowthHistory(growthData);
      setLatestGrowth(latestGrowthData);
    } catch (err: any) {
      console.error('Error fetching child data:', err);
      setError(err.message || 'Failed to load child data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800';
      case 'NEEDS_ATTENTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'Healthy';
      case 'NEEDS_ATTENTION':
        return 'Needs Attention';
      case 'CRITICAL':
        return 'Critical';
      default:
        return status;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 28) {
      return `${ageInDays} days`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} months`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const remainingMonths = Math.floor((ageInDays % 365) / 30);
      return `${years}y ${remainingMonths}m`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading child details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">error</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">child</div>
          <p className="text-gray-600">Child not found</p>
          <button
            onClick={() => router.push('/healthcare-dashboard/children')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Children
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Child Details</h1>
              <p className="text-sm text-gray-600">
                {child.name} - {calculateAge(child.birthDate)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/healthcare-dashboard/children/${childId}/growth`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Growth Record
              </a>
              <a
                href={`/healthcare-dashboard/children`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Children
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Child Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg font-medium text-gray-900">{child.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Age</h3>
                  <p className="text-lg font-medium text-gray-900">{calculateAge(child.birthDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {child.gender === 'MALE' ? 'Male' : 'Female'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Health Status</h3>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getHealthStatusColor(child.healthStatus)}`}>
                    {getHealthStatusText(child.healthStatus)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Birth Date</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(child.birthDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(child.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Birth Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Birth Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Birth Hospital</h3>
                  <p className="text-lg font-medium text-gray-900">{child.birthHospital.name}</p>
                  <p className="text-sm text-gray-600">{child.birthHospital.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivered By</h3>
                  <p className="text-lg font-medium text-gray-900">{child.deliveredBy.name}</p>
                  <p className="text-sm text-gray-600">{child.deliveredBy.role}</p>
                </div>
                {child.birthWeight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Birth Weight</h3>
                    <p className="text-lg font-medium text-gray-900">{child.birthWeight}g</p>
                  </div>
                )}
                {child.birthHeight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Birth Height</h3>
                    <p className="text-lg font-medium text-gray-900">{child.birthHeight}cm</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mother Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mother Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mother Name</h3>
                  <p className="text-lg font-medium text-gray-900">{child.motherId.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                  <p className="text-lg font-medium text-gray-900">{child.motherId.phone}</p>
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <a
                  href={`/healthcare-dashboard/mothers/${child.motherId._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Mother Details
                </a>
                <a
                  href={`/healthcare-dashboard/pregnancy/mother/${child.motherId._id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Pregnancy History
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Growth Record */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Growth Record</h2>
              {latestGrowth ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Age at Measurement</h3>
                    <p className="text-lg font-medium text-gray-900">{latestGrowth.ageMonths} months</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                    <p className="text-lg font-medium text-gray-900">{latestGrowth.weight} kg</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Height</h3>
                    <p className="text-lg font-medium text-gray-900">{latestGrowth.height} cm</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Growth Status</h3>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      latestGrowth.growthStatus === 'NORMAL' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {latestGrowth.growthStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Measured</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(latestGrowth.measurementDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-4xl mb-2">growth</div>
                  <p className="text-gray-600">No growth records yet</p>
                  <a
                    href={`/healthcare-dashboard/children/${childId}/growth`}
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Growth Record
                  </a>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href={`/healthcare-dashboard/children/${childId}/growth`}
                  className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Growth Record
                </a>
                <a
                  href={`/healthcare-dashboard/vaccinations/child/${childId}`}
                  className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Vaccinations
                </a>
                <a
                  href={`/healthcare-dashboard/mothers/${child.motherId._id}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Mother
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
