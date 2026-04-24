'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pregnancyApi, mothersApi } from '@/lib/healthcare-api';

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

interface PregnancyRecord {
  _id: string;
  week: number;
  gestationalAge: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  emergency: boolean;
  visitDate: string;
  createdBy: {
    name: string;
    role: string;
  };
  nextVisitDate?: string;
}

export default function MotherPregnancyHistory() {
  const params = useParams();
  const router = useRouter();
  const motherId = params.id as string;

  const [mother, setMother] = useState<Mother | null>(null);
  const [pregnancyRecords, setPregnancyRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (motherId) {
      fetchPregnancyHistory();
    }
  }, [motherId]);

  const fetchPregnancyHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const [motherData, pregnancyData] = await Promise.all([
        mothersApi.getById(motherId),
        pregnancyApi.getByMotherId(motherId)
      ]);

      setMother(motherData);
      setPregnancyRecords(pregnancyData);
    } catch (err: any) {
      console.error('Error fetching pregnancy history:', err);
      setError(err.message || 'Failed to load pregnancy history');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pregnancy history...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Pregnancy History</h1>
              <p className="text-sm text-gray-600">{mother.name} - Pregnancy visits</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/healthcare-dashboard/pregnancy/new`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Visit
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

        {/* Pregnancy Records */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pregnancy Visits</h2>
          </div>
          
          {pregnancyRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">pregnancy</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pregnancy visits recorded</h3>
              <p className="text-gray-600 mb-6">
                Start tracking this mother's pregnancy journey
              </p>
              <a
                href={`/healthcare-dashboard/pregnancy/new`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Record First Visit
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Week
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gestational Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emergency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pregnancyRecords
                    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                    .map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Week {record.week}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.gestationalAge} weeks
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(record.riskLevel)}`}>
                          {record.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.emergency ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Emergency
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.nextVisitDate 
                          ? new Date(record.nextVisitDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{record.createdBy.name}</div>
                          <div className="text-xs text-gray-500">{record.createdBy.role}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{pregnancyRecords.length}</p>
              </div>
              <div className="text-3xl text-blue-600">calendar</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pregnancyRecords.filter(r => r.riskLevel === 'HIGH').length}
                </p>
              </div>
              <div className="text-3xl text-red-600">warning</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pregnancyRecords.filter(r => r.emergency).length}
                </p>
              </div>
              <div className="text-3xl text-orange-600">emergency</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pregnancyRecords.filter(r => r.riskLevel === 'LOW').length}
                </p>
              </div>
              <div className="text-3xl text-green-600">checkmark</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
