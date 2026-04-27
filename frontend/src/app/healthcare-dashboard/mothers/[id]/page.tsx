'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mothersApi, pregnancyApi, childrenApi } from '@/lib/healthcare-api';

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
  assignedHealthWorker?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: 'ACTIVE' | 'DELIVERED' | 'INACTIVE';
  registrationDate: string;
  expectedDeliveryDate?: string;
  highRisk: boolean;
  medicalHistory?: string;
  emergencyContact?: string;
  gravida?: number;
  para?: number;
  lmp?: string;
}

export default function MotherDetail() {
  const params = useParams();
  const router = useRouter();
  const motherId = params.id as string;

  const [mother, setMother] = useState<Mother | null>(null);
  const [pregnancyHistory, setPregnancyHistory] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (motherId) {
      fetchMotherData();
    }
  }, [motherId]);

  const fetchMotherData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== MOTHER DETAIL DEBUG ===');
      console.log('Fetching data for motherId:', motherId);

      const [motherData, pregnancyData, childrenData] = await Promise.all([
        mothersApi.getById(motherId),
        pregnancyApi.getByMotherId(motherId)
          .then(data => {
            console.log('Pregnancy data received:', data);
            console.log('Pregnancy data length:', Array.isArray(data) ? data.length : 'Not an array');
            return data;
          })
          .catch(err => {
            console.error('Error fetching pregnancy data:', err);
            return [];
          }),
        childrenApi.getByMotherId(motherId).catch(() => [])
      ]);

      console.log('Final pregnancy history:', pregnancyData);
      setMother(motherData);
      setPregnancyHistory(pregnancyData);
      setChildren(childrenData);
    } catch (err: any) {
      console.error('Error fetching mother data:', err);
      setError(err.message || 'Failed to load mother data');
    } finally {
      setLoading(false);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'DELIVERED':
        return 'Delivered';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mother details...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Mother Details</h1>
              <p className="text-sm text-gray-600">{mother.name} - {mother.age} years old</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/healthcare-dashboard/pregnancy/new`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                New Pregnancy Visit
              </a>
              <a
                href={`/healthcare-dashboard/children/register`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Register Child
              </a>
              <a
                href={`/healthcare-dashboard/mothers`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Mothers
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mother Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg font-medium text-gray-900">{mother.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Age</h3>
                  <p className="text-lg font-medium text-gray-900">{mother.age} years</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-lg font-medium text-gray-900">{mother.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {mother.emergencyContact || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="text-lg font-medium text-gray-900">{mother.address}</p>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(mother.status)}`}>
                    {getStatusText(mother.status)}
                  </span>
                  {mother.highRisk && (
                    <span className="ml-2 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      High Risk
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Health Center</h3>
                  <p className="text-lg font-medium text-gray-900">{mother.healthCenter.name}</p>
                  <p className="text-sm text-gray-600">{mother.healthCenter.type}</p>
                </div>
                {mother.assignedHealthWorker && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assigned Health Worker</h3>
                    <p className="text-lg font-medium text-gray-900">{mother.assignedHealthWorker.name}</p>
                    <p className="text-sm text-gray-600">{mother.assignedHealthWorker.role}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(mother.registrationDate).toLocaleDateString()}
                  </p>
                </div>
                {mother.expectedDeliveryDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expected Delivery Date</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(mother.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {mother.medicalHistory && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Medical History</h3>
                    <p className="text-gray-900">{mother.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pregnancy History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Pregnancy History</h2>
                <a
                  href={`/healthcare-dashboard/pregnancy/new/${motherId}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  New Visit
                </a>
              </div>
              {pregnancyHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">pregnancy</div>
                  <p className="text-gray-600">No pregnancy visits recorded</p>
                  <a
                    href={`/healthcare-dashboard/pregnancy/new`}
                    className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Record First Visit
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Week
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Risk Level
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pregnancyHistory.map((record) => (
                        <tr key={record._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">Week {record.week}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                              record.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {record.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(record.visitDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <a
                              href={`/healthcare-dashboard/pregnancy/${record._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Children */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Children</h2>
                <a
                  href={`/healthcare-dashboard/children/register`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Register Child
                </a>
              </div>
              {children.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">child</div>
                  <p className="text-gray-600">No children registered</p>
                  <a
                    href={`/healthcare-dashboard/children/register`}
                    className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Register First Child
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {children.map((child) => (
                    <div key={child._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-600">
                            {child.gender === 'MALE' ? 'Male' : 'Female'} - Born {new Date(child.birthDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          child.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                          child.healthStatus === 'NEEDS_ATTENTION' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {child.healthStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={`/healthcare-dashboard/children/${child._id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View
                        </a>
                        <a
                          href={`/healthcare-dashboard/children/${child._id}/growth`}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Growth
                        </a>
                        <a
                          href={`/healthcare-dashboard/vaccinations/child/${child._id}`}
                          className="text-purple-600 hover:text-purple-900 text-sm"
                        >
                          Vaccines
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Pregnancy Visits</span>
                  <span className="text-lg font-medium text-gray-900">{pregnancyHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Children</span>
                  <span className="text-lg font-medium text-gray-900">{children.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">High Risk Visits</span>
                  <span className="text-lg font-medium text-gray-900">
                    {pregnancyHistory.filter(p => p.riskLevel === 'HIGH').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Emergency Visits</span>
                  <span className="text-lg font-medium text-gray-900">
                    {pregnancyHistory.filter(p => p.emergency).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href={`/healthcare-dashboard/pregnancy/new`}
                  className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
                >
                  New Pregnancy Visit
                </a>
                <a
                  href={`/healthcare-dashboard/children/register`}
                  className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Register Child
                </a>
                <a
                  href={`/healthcare-dashboard/mothers/${motherId}/edit`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Mother
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
