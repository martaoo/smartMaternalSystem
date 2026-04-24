'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vaccinationsApi, childrenApi } from '@/lib/healthcare-api';

interface VaccinationRecord {
  _id: string;
  childId: {
    _id: string;
    name: string;
    birthDate: string;
    motherId: {
      name: string;
      phone: string;
    };
  };
  vaccineId: {
    _id: string;
    name: string;
    code: string;
    category: string;
    recommendedAge: string;
  };
  doseNumber: number;
  scheduledDate: string;
  administeredDate?: string;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED' | 'DEFERRED' | 'CONTRAINDICATED';
  administeredBy?: {
    name: string;
    role: string;
  };
  batchNumber?: string;
  manufacturer?: string;
  adverseEvents?: string[];
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export default function ChildVaccinations() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;

  const [child, setChild] = useState<any>(null);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (childId) {
      fetchVaccinationData();
    }
  }, [childId]);

  const fetchVaccinationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [childData, vaccinationData] = await Promise.all([
        childrenApi.getById(childId),
        vaccinationsApi.getVaccinationRecordsByChild(childId)
      ]);

      setChild(childData);
      setVaccinationRecords(vaccinationData);
    } catch (err: any) {
      console.error('Error fetching vaccination data:', err);
      setError(err.message || 'Failed to load vaccination data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMINISTERED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'MISSED':
        return 'bg-red-100 text-red-800';
      case 'DEFERRED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONTRAINDICATED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ADMINISTERED':
        return 'Administered';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'MISSED':
        return 'Missed';
      case 'DEFERRED':
        return 'Deferred';
      case 'CONTRAINDICATED':
        return 'Contraindicated';
      default:
        return status;
    }
  };

  const handleMarkAdministered = async (recordId: string) => {
    try {
      await vaccinationsApi.markVaccinationAdministered(recordId, {
        batchNumber: 'BATCH-' + Date.now(),
        manufacturer: 'Default Manufacturer',
        injectionSite: 'Left Thigh',
        route: 'IM'
      });
      fetchVaccinationData(); // Refresh data
    } catch (err: any) {
      console.error('Error marking as administered:', err);
      setError('Failed to mark vaccination as administered');
    }
  };

  const handleMarkMissed = async (recordId: string) => {
    const reason = prompt('Please provide reason for missed vaccination:');
    if (reason) {
      try {
        await vaccinationsApi.markVaccinationMissed(recordId, reason);
        fetchVaccinationData(); // Refresh data
      } catch (err: any) {
        console.error('Error marking as missed:', err);
        setError('Failed to mark vaccination as missed');
      }
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      await vaccinationsApi.generateVaccinationSchedule(childId);
      fetchVaccinationData(); // Refresh data
    } catch (err: any) {
      console.error('Error generating schedule:', err);
      setError('Failed to generate vaccination schedule');
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
          <p className="mt-4 text-gray-600">Loading vaccination records...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Child Vaccinations</h1>
              <p className="text-sm text-gray-600">
                {child.name} - {calculateAge(child.birthDate)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateSchedule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate Schedule
              </button>
              <a
                href={`/healthcare-dashboard/children/${childId}`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Child
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Child Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{child.name}</h2>
              <p className="text-sm text-gray-600">
                {calculateAge(child.birthDate)} | {child.gender === 'MALE' ? 'Male' : 'Female'}
              </p>
              <p className="text-sm text-gray-600">
                Mother: {child.motherId.name} | {child.motherId.phone}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Health Status</div>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                child.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                child.healthStatus === 'NEEDS_ATTENTION' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {child.healthStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Vaccination Records */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vaccination Records</h2>
          </div>
          
          {vaccinationRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">vaccine</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vaccination records found</h3>
              <p className="text-gray-600 mb-6">
                Generate a vaccination schedule to get started
              </p>
              <button
                onClick={handleGenerateSchedule}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Vaccination Schedule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaccine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommended Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Administered Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccinationRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.vaccineId.name}</div>
                          <div className="text-xs text-gray-500">{record.vaccineId.code}</div>
                          <div className="text-xs text-gray-500">{record.vaccineId.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Dose {record.doseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.vaccineId.recommendedAge}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.administeredDate 
                          ? new Date(record.administeredDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                        {record.followUpRequired && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Follow-up
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {record.status === 'SCHEDULED' && (
                            <>
                              <button
                                onClick={() => handleMarkAdministered(record._id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Administer
                              </button>
                              <button
                                onClick={() => handleMarkMissed(record._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Miss
                              </button>
                            </>
                          )}
                          {record.administeredBy && (
                            <div className="text-xs text-gray-500">
                              By {record.administeredBy.name}
                            </div>
                          )}
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
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vaccinationRecords.filter(r => r.status === 'ADMINISTERED').length}
                </p>
              </div>
              <div className="text-3xl text-green-600">checkmark</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vaccinationRecords.filter(r => r.status === 'SCHEDULED').length}
                </p>
              </div>
              <div className="text-3xl text-blue-600">calendar</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vaccinationRecords.filter(r => r.status === 'MISSED').length}
                </p>
              </div>
              <div className="text-3xl text-red-600">warning</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deferred</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vaccinationRecords.filter(r => r.status === 'DEFERRED').length}
                </p>
              </div>
              <div className="text-3xl text-yellow-600">clock</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
