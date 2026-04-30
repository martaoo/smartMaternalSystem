'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pregnancyApi } from '@/lib/healthcare-api';

interface PregnancyRecord {
  _id: string;
  motherId: {
    _id: string;
    name: string;
    phone: string;
  };
  week: number;
  gestationalAge: number;
  systolicBP?: number;
  diastolicBP?: number;
  weight?: number;
  fundalHeight?: number;
  fetalHeartRate?: number;
  presentation?: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  symptoms: string[];
  medications: string[];
  nextVisitDate?: string;
  ultrasoundFindings?: string;
  complications: string[];
  recommendations?: string;
  emergency: boolean;
  emergencyReason?: string;
  visitDate: string;
  healthWorkerId?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
}

export default function PregnancyDetail() {
  const params = useParams();
  const router = useRouter();
  const pregnancyId = params.id as string;

  const [pregnancyRecord, setPregnancyRecord] = useState<PregnancyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pregnancyId) {
      fetchPregnancyRecord();
    }
  }, [pregnancyId]);

  const fetchPregnancyRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pregnancyApi.getById(pregnancyId);
      setPregnancyRecord(data);
    } catch (err: any) {
      console.error('Error fetching pregnancy record:', err);
      setError(err.message || 'Failed to load pregnancy record');
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

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'Low Risk';
      case 'MODERATE':
        return 'Moderate Risk';
      case 'HIGH':
        return 'High Risk';
      default:
        return riskLevel;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pregnancy record...</p>
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

  if (!pregnancyRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">pregnancy</div>
          <p className="text-gray-600">Pregnancy record not found</p>
          <button
            onClick={() => router.push('/healthcare-dashboard/pregnancy')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Pregnancy Tracking
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
              <h1 className="text-2xl font-bold text-gray-900">Pregnancy Visit Details</h1>
              <p className="text-sm text-gray-600">
                {pregnancyRecord.motherId.name} - Week {pregnancyRecord.week}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/healthcare-dashboard/pregnancy/new`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Visit
              </a>
              <a
                href={`/healthcare-dashboard/pregnancy`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Pregnancy
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mother</h3>
                  <p className="text-lg font-medium text-gray-900">{pregnancyRecord.motherId.name}</p>
                  <p className="text-sm text-gray-600">{pregnancyRecord.motherId.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Visit Date</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(pregnancyRecord.visitDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pregnancy Week</h3>
                  <p className="text-lg font-medium text-gray-900">Week {pregnancyRecord.week}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gestational Age</h3>
                  <p className="text-lg font-medium text-gray-900">{pregnancyRecord.gestationalAge} weeks</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Risk Level</h3>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getRiskLevelColor(pregnancyRecord.riskLevel)}`}>
                    {getRiskLevelText(pregnancyRecord.riskLevel)}
                  </span>
                  {pregnancyRecord.emergency && (
                    <span className="ml-2 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      Emergency
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Recorded By</h3>
                  <p className="text-lg font-medium text-gray-900">{pregnancyRecord.healthWorkerId?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{pregnancyRecord.healthWorkerId?.role || 'Unknown'}</p>
                </div>
                {pregnancyRecord.nextVisitDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Next Visit Date</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(pregnancyRecord.nextVisitDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {pregnancyRecord.emergency && pregnancyRecord.emergencyReason && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Emergency Reason</h3>
                    <p className="text-lg font-medium text-red-600">{pregnancyRecord.emergencyReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pregnancyRecord.systolicBP && pregnancyRecord.diastolicBP && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Blood Pressure</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {pregnancyRecord.systolicBP}/{pregnancyRecord.diastolicBP} mmHg
                    </p>
                  </div>
                )}
                {pregnancyRecord.weight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                    <p className="text-lg font-medium text-gray-900">{pregnancyRecord.weight} kg</p>
                  </div>
                )}
                {pregnancyRecord.fundalHeight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fundal Height</h3>
                    <p className="text-lg font-medium text-gray-900">{pregnancyRecord.fundalHeight} cm</p>
                  </div>
                )}
                {pregnancyRecord.fetalHeartRate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fetal Heart Rate</h3>
                    <p className="text-lg font-medium text-gray-900">{pregnancyRecord.fetalHeartRate} bpm</p>
                  </div>
                )}
                {pregnancyRecord.presentation && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fetal Presentation</h3>
                    <p className="text-lg font-medium text-gray-900">{pregnancyRecord.presentation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Assessment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Assessment</h2>
              <div className="space-y-4">
                {pregnancyRecord.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pregnancyRecord.symptoms.map((symptom, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pregnancyRecord.medications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Medications</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pregnancyRecord.medications.map((medication, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pregnancyRecord.complications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Complications</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pregnancyRecord.complications.map((complication, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {complication}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pregnancyRecord.ultrasoundFindings && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ultrasound Findings</h3>
                    <p className="text-gray-900">{pregnancyRecord.ultrasoundFindings}</p>
                  </div>
                )}
                {pregnancyRecord.recommendations && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Recommendations</h3>
                    <p className="text-gray-900">{pregnancyRecord.recommendations}</p>
                  </div>
                )}
                {pregnancyRecord.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                    <p className="text-gray-900">{pregnancyRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href={`/healthcare-dashboard/pregnancy/new`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Visit
                </a>
                <a
                  href={`/healthcare-dashboard/mothers/${pregnancyRecord.motherId._id}`}
                  className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Mother
                </a>
                <a
                  href={`/healthcare-dashboard/children/register`}
                  className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Register Child
                </a>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level</span>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getRiskLevelColor(pregnancyRecord.riskLevel)}`}>
                    {getRiskLevelText(pregnancyRecord.riskLevel)}
                  </span>
                </div>
                {pregnancyRecord.emergency && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Emergency Visit</span>
                    <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      Yes
                    </span>
                  </div>
                )}
                {pregnancyRecord.complications.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Complications</span>
                    <span className="text-sm font-medium text-gray-900">
                      {pregnancyRecord.complications.length} identified
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Visit */}
            {pregnancyRecord.nextVisitDate && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Visit</h2>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Scheduled Date</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(pregnancyRecord.nextVisitDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Days Until</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {Math.ceil((new Date(pregnancyRecord.nextVisitDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
