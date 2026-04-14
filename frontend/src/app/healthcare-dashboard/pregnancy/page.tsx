'use client';

import { useState, useEffect } from 'react';
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
  createdBy: {
    name: string;
    role: string;
  };
}

export default function PregnancyTracking() {
  const [pregnancyRecords, setPregnancyRecords] = useState<PregnancyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PregnancyRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPregnancyRecords();
  }, []);

  useEffect(() => {
    let filtered = pregnancyRecords;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(record =>
        record.motherId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.motherId.phone.includes(searchQuery)
      );
    }

    // Apply risk filter
    if (filterRisk !== 'all') {
      filtered = filtered.filter(record => record.riskLevel === filterRisk);
    }

    setFilteredRecords(filtered);
  }, [searchQuery, filterRisk, pregnancyRecords]);

  const fetchPregnancyRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pregnancyApi.getAll();
      setPregnancyRecords(data);
      setFilteredRecords(data);
    } catch (err: any) {
      console.error('Error fetching pregnancy records:', err);
      setError(err.message || 'Failed to load pregnancy records');
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
          <p className="mt-4 text-gray-600">Loading pregnancy records...</p>
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
            onClick={fetchPregnancyRecords}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
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
              <h1 className="text-2xl font-bold text-gray-900">Pregnancy Tracking</h1>
              <p className="text-sm text-gray-600">Monitor and manage pregnancy visits</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/healthcare-dashboard/pregnancy/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Visit
              </a>
              <a
                href="/healthcare-dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by mother name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MODERATE">Moderate Risk</option>
                  <option value="HIGH">High Risk</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {filteredRecords.length} visits</span>
              <span>High Risk: {pregnancyRecords.filter(r => r.riskLevel === 'HIGH').length}</span>
              <span>Emergency: {pregnancyRecords.filter(r => r.emergency).length}</span>
            </div>
          </div>
        </div>

        {/* Pregnancy Records List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">pregnancy</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterRisk !== 'all' ? 'No pregnancy records found' : 'No pregnancy records yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterRisk !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Start by recording a pregnancy visit'
                }
              </p>
              {!searchQuery && filterRisk === 'all' && (
                <a
                  href="/healthcare-dashboard/pregnancy/new"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record First Visit
                </a>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mother
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pregnancy Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vital Signs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.motherId.name}</div>
                          <div className="text-xs text-gray-500">{record.motherId.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Week {record.week} ({record.gestationalAge} weeks)
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.presentation && `Presentation: ${record.presentation}`}
                        </div>
                        {record.nextVisitDate && (
                          <div className="text-xs text-gray-500">
                            Next: {new Date(record.nextVisitDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.systolicBP && record.diastolicBP && (
                            <div>BP: {record.systolicBP}/{record.diastolicBP}</div>
                          )}
                          {record.weight && <div>Weight: {record.weight}kg</div>}
                          {record.fundalHeight && <div>FH: {record.fundalHeight}cm</div>}
                          {record.fetalHeartRate && <div>FHR: {record.fetalHeartRate}bpm</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(record.riskLevel)}`}>
                            {getRiskLevelText(record.riskLevel)}
                          </span>
                          {record.emergency && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Emergency
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/healthcare-dashboard/pregnancy/${record._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </a>
                          <a
                            href={`/healthcare-dashboard/mothers/${record.motherId._id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mother
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
      </main>
    </div>
  );
}
