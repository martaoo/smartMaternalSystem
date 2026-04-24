'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { childrenApi, mothersApi } from '@/lib/healthcare-api';

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

interface Child {
  _id: string;
  name: string;
  birthDate: string;
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

export default function MotherChildren() {
  const params = useParams();
  const router = useRouter();
  const motherId = params.id as string;

  const [mother, setMother] = useState<Mother | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (motherId) {
      fetchMotherChildren();
    }
  }, [motherId]);

  const fetchMotherChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const [motherData, childrenData] = await Promise.all([
        mothersApi.getById(motherId),
        childrenApi.getByMotherId(motherId)
      ]);

      setMother(motherData);
      setChildren(childrenData);
    } catch (err: any) {
      console.error('Error fetching mother children:', err);
      setError(err.message || 'Failed to load mother children');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <p className="mt-4 text-gray-600">Loading mother children...</p>
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

  if (!mother) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">mother</div>
          <p className="text-gray-600">Mother not found</p>
          <button
            onClick={() => router.push('/healthcare-dashboard/mothers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Mothers
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
              <h1 className="text-2xl font-bold text-gray-900">Mother's Children</h1>
              <p className="text-sm text-gray-600">{mother.name} - Registered children</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/healthcare-dashboard/children/register`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Child
              </a>
              <a
                href={`/healthcare-dashboard/mothers/${motherId}`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Mother
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Mother Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{mother.name}</h2>
              <p className="text-sm text-gray-600">
                {mother.age} years | {mother.phone}
              </p>
              <p className="text-sm text-gray-600">
                {mother.healthCenter.name} | {mother.address}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(mother.status)}`}>
                {mother.status}
              </span>
              {mother.highRisk && (
                <span className="ml-2 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  High Risk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Children List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Registered Children</h2>
          </div>
          
          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">child</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No children registered</h3>
              <p className="text-gray-600 mb-6">
                Register children for this mother to start tracking their growth and development
              </p>
              <a
                href={`/healthcare-dashboard/children/register`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register First Child
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Birth Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {children.map((child) => (
                    <tr key={child._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-lg mr-3">
                            {child.gender === 'MALE' ? 'boy' : 'girl'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{child.name}</div>
                            <div className="text-xs text-gray-500">
                              {child.birthWeight && `${child.birthWeight}g`}
                              {child.birthWeight && child.birthHeight && ' | '}
                              {child.birthHeight && `${child.birthHeight}cm`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(child.birthDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          child.gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {child.gender === 'MALE' ? 'Male' : 'Female'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{child.birthHospital.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(child.birthDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(child.healthStatus)}`}>
                          {child.healthStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(child.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/healthcare-dashboard/children/${child._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </a>
                          <a
                            href={`/healthcare-dashboard/children/${child._id}/growth`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Growth
                          </a>
                          <a
                            href={`/healthcare-dashboard/vaccinations/child/${child._id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Vaccines
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{children.length}</p>
              </div>
              <div className="text-3xl text-blue-600">child</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.filter(c => c.healthStatus === 'HEALTHY').length}
                </p>
              </div>
              <div className="text-3xl text-green-600">checkmark</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.filter(c => c.healthStatus === 'NEEDS_ATTENTION').length}
                </p>
              </div>
              <div className="text-3xl text-yellow-600">warning</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.filter(c => c.healthStatus === 'CRITICAL').length}
                </p>
              </div>
              <div className="text-3xl text-red-600">emergency</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
