'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function HospitalAnalyticsPage() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('patients');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedChart]);

  const fetchAnalytics = async () => {
    try {
      // Simulate analytics data - in real app, this would come from API
      const mockAnalytics = {
        patientTrends: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [12, 19, 15, 25, 22, 30, 28]
        },
        staffPerformance: {
          doctors: { present: 8, absent: 2, total: 10 },
          nurses: { present: 15, absent: 3, total: 18 },
          dispatchers: { present: 4, absent: 1, total: 5 }
        },
        departmentLoad: {
          emergency: { current: 24, capacity: 25, percentage: 96 },
          maternity: { current: 18, capacity: 25, percentage: 72 },
          general: { current: 32, capacity: 50, percentage: 64 },
          icu: { current: 8, capacity: 10, percentage: 80 }
        },
        monthlyStats: {
          admissions: 340,
          discharges: 312,
          emergency: 96,
          surgeries: 45
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPatientTrends = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Admissions Trend</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {analytics?.patientTrends.labels.map((label: string, index: number) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
              style={{ height: `${(analytics.patientTrends.data[index] / Math.max(...analytics.patientTrends.data)) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-2">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStaffPerformance = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
      <div className="space-y-6">
        {Object.entries(analytics?.staffPerformance || {}).map(([role, data]: [string, any]) => (
          <div key={role}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
              <span className="text-sm text-gray-500">{data.present}/{data.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(data.present / data.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDepartmentLoad = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Load</h3>
      <div className="space-y-4">
        {Object.entries(analytics?.departmentLoad || {}).map(([dept, data]: [string, any]) => (
          <div key={dept}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">{dept}</span>
              <span className="text-sm text-gray-500">{data.current}/{data.capacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  data.percentage > 90 ? 'bg-red-500' : 
                  data.percentage > 75 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${data.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="HOSPITAL_ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hospital Analytics</h1>
                  <p className="text-sm text-gray-500">Advanced analytics and insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/hospital-dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Chart Selector */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Data Visualization</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedChart('patients')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedChart === 'patients' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Patient Trends
                </button>
                <button
                  onClick={() => setSelectedChart('staff')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedChart === 'staff' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Staff Performance
                </button>
                <button
                  onClick={() => setSelectedChart('departments')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedChart === 'departments' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Department Load
                </button>
                <button
                  onClick={fetchAnalytics}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Main Chart */}
            {loading ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                {selectedChart === 'patients' && renderPatientTrends()}
                {selectedChart === 'staff' && renderStaffPerformance()}
                {selectedChart === 'departments' && renderDepartmentLoad()}
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Monthly Admissions</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics?.monthlyStats.admissions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Monthly Discharges</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics?.monthlyStats.discharges}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Emergency Cases</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics?.monthlyStats.emergency}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Surgeries</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics?.monthlyStats.surgeries}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Real-time Updates */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-gray-500">Live</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Emergency Room Capacity</span>
                    <span className="text-sm font-medium text-red-600">96% Full</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Staff on Duty</span>
                    <span className="text-sm font-medium text-green-600">27/33</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Available Beds</span>
                    <span className="text-sm font-medium text-blue-600">23</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
