'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserForm } from '@/components/AddUserForm';
import { api } from '@/lib/api';

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalNurses: 0,
    totalDispatchers: 0,
    totalPatients: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const usersResponse = await api.getUsers();
      const users = Array.isArray(usersResponse) ? usersResponse : [];
      
      // Filter users for this hospital
      const hospitalUsers = users.filter(u => 
        u.hospitalId === (typeof user?.hospitalId === 'string' ? user.hospitalId : (user?.hospitalId as any)?._id)
      );

      const newStats = {
        totalDoctors: hospitalUsers.filter(u => u.role === 'DOCTOR').length,
        totalNurses: hospitalUsers.filter(u => u.role === 'NURSE').length,
        totalDispatchers: hospitalUsers.filter(u => u.role === 'DISPATCHER').length,
        totalPatients: hospitalUsers.filter(u => u.role === 'MOTHER').length,
        recentActivity: Math.floor(Math.random() * 20) + 5 // Placeholder for recent activity
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserSuccess = () => {
    alert('User added successfully!');
    fetchDashboardStats(); // Refresh stats after adding user
  };

  return (
    <ProtectedRoute requiredRole="HOSPITAL_ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 22a7 7 0 00-14 0" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hospital Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalDoctors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Nurses</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalNurses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Dispatchers</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalDispatchers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalPatients}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <span className="text-sm text-gray-500">Last 24 hours</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Activities Today</p>
                  <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.recentActivity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200" onClick={() => setShowAddUser(true)}>
                  Add User
                </button>
                <Link
                  href="/hospital-dashboard/users"
                  className="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  View Users
                </Link>
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200" onClick={() => window.location.href = '/hospital-dashboard/patients'}>
                  Manage Patients
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200" onClick={() => window.location.href = '/hospital-dashboard/reports'}>
                  View Reports
                </button>
                <button className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200" onClick={() => window.location.href = '/hospital-dashboard/analytics'}>
                  Analytics
                </button>
                <button className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200" onClick={() => fetchDashboardStats()}>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </main>
        {showAddUser && (
          <AddUserForm
            onClose={() => setShowAddUser(false)}
            onSuccess={handleAddUserSuccess}
            allowedRoles={['DOCTOR', 'NURSE', 'DISPATCHER']}
            hideHospitalSelect={true}
            fixedHospitalId={
              typeof user?.hospitalId === 'string'
                ? user.hospitalId
                : (user?.hospitalId as any)?._id
            }
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
