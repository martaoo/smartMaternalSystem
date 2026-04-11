'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AddUserForm } from '@/components/AddUserForm';
import { AddWoredaForm } from '@/components/AddWoredaForm';
import { AddHospitalForm } from '@/components/AddHospitalForm';
import { UserManagement } from '@/components/UserManagement';
import { HospitalWoredaList } from '@/components/HospitalWoredaList';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function SystemDashboard() {
  const { user, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddWoredaAdmin, setShowAddWoredaAdmin] = useState(false);
  const [showAddWoreda, setShowAddWoreda] = useState(false);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [showHospitalsList, setShowHospitalsList] = useState(false);
  const [showWoredasList, setShowWoredasList] = useState(false);
  
  // Store filtered facility data
  const [filteredWoredas, setFilteredWoredas] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  
  // Real data states
  const [stats, setStats] = useState({
    totalWoredas: 0,
    totalUsers: 0,
    totalWoredaAdmins: 0,
    totalHospitals: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersResponse, woredasResponse, hospitalsResponse] = await Promise.all([
        api.getUsers(),
        api.getWoredas(),
        api.getHospitals()
      ]);

      const users = Array.isArray(usersResponse) ? usersResponse : [];
      const woredas = Array.isArray(woredasResponse) ? woredasResponse : [];
      const hospitals = Array.isArray(hospitalsResponse) ? hospitalsResponse : [];

      // Data is already filtered by backend based on user role and region
      const usersInRegion = users;
      const regionalWoredas = woredas;
      const regionalHospitals = hospitals;

      // Store filtered facility data
      setFilteredWoredas(regionalWoredas);
      setFilteredHospitals(regionalHospitals);

      // Calculate stats
      const newStats = {
        totalWoredas: regionalWoredas.length,
        totalUsers: usersInRegion.length,
        totalWoredaAdmins: usersInRegion.filter(u => u.role === 'WOREDA_ADMIN').length,
        totalHospitals: regionalHospitals.length
      };

      // Generate recent activities from recent user creations in region
      const activities = usersInRegion
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((user: any) => ({
          id: user._id,
          type: 'user_created',
          message: `${user.name} (${user.role.replace('_', ' ')}) created`,
          timestamp: user.createdAt,
          color: getActivityColor(user.role)
        }));

      setStats(newStats);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-600';
      case 'SYSTEM_ADMIN': return 'bg-blue-600';
      case 'WOREDA_ADMIN': return 'bg-green-600';
      case 'HOSPITAL_ADMIN': return 'bg-yellow-600';
      case 'DOCTOR': return 'bg-red-600';
      case 'NURSE': return 'bg-pink-600';
      case 'MIDWIFE': return 'bg-indigo-600';
      case 'DISPATCHER': return 'bg-orange-600';
      case 'EMERGENCY_ADMIN': return 'bg-red-600';
      case 'MOTHER': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleAddUserSuccess = () => {
    fetchDashboardData();
    alert('User added successfully!');
  };

  const handleAddWoredaAdminSuccess = () => {
    fetchDashboardData();
    alert('Woreda Admin added successfully!');
  };

  const handleAddWoredaSuccess = () => {
    fetchDashboardData();
    alert('Woreda added successfully!');
  };

  const handleAddHospitalSuccess = () => {
    fetchDashboardData();
    alert('Hospital added successfully!');
  };

  return (
    <ProtectedRoute requiredRole="SYSTEM_ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">System Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Region: {user?.assignedRegion || 'System Administration'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" 
                     onClick={() => setShowWoredasList(!showWoredasList)}>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Woredas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalWoredas}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <svg className={`h-5 w-5 text-gray-400 transform transition-transform ${showWoredasList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Woreda Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalWoredaAdmins}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" 
                     onClick={() => setShowHospitalsList(!showHospitalsList)}>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hospitals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalHospitals}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <svg className={`h-5 w-5 text-gray-400 transform transition-transform ${showHospitalsList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Facility Lists */}
            {showWoredasList && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Woredas in {user?.assignedRegion || 'Your Region'}</h3>
                <HospitalWoredaList 
                  showHospitals={false} 
                  showWoredas={true} 
                  preFilteredHospitals={[]}
                  preFilteredWoredas={filteredWoredas}
                />
              </div>
            )}

            {showHospitalsList && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospitals in {user?.assignedRegion || 'Your Region'}</h3>
                <HospitalWoredaList 
                  showHospitals={true} 
                  showWoredas={false} 
                  preFilteredHospitals={filteredHospitals}
                  preFilteredWoredas={[]}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Administration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setShowAddWoredaAdmin(true)}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Woreda Admin
                </button>
                <button 
                  onClick={() => setShowAddWoreda(true)}
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Create Woreda
                </button>
                <button 
                  onClick={() => setShowAddHospital(true)}
                  className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Create Hospital
                </button>
                <button 
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Staff
                </button>
              </div>
            </div>

            {/* User Management Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <UserManagement />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-400">Loading recent activities...</p>
                  </div>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                      <p className="text-sm text-gray-600">{activity.message}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <p className="text-sm text-gray-400">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      {showAddUser && (
        <AddUserForm 
          onClose={() => setShowAddUser(false)} 
          onSuccess={handleAddUserSuccess}
          allowedRoles={['WOREDA_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'EMERGENCY_ADMIN', 'MOTHER']}
        />
      )}
      {showAddWoredaAdmin && (
        <AddUserForm 
          onClose={() => setShowAddWoredaAdmin(false)} 
          onSuccess={handleAddWoredaAdminSuccess}
          allowedRoles={['WOREDA_ADMIN']}
        />
      )}
      {showAddWoreda && (
        <AddWoredaForm 
          onClose={() => setShowAddWoreda(false)} 
          onSuccess={handleAddWoredaSuccess} 
        />
      )}
      {showAddHospital && (
        <AddHospitalForm 
          onClose={() => setShowAddHospital(false)} 
          onSuccess={handleAddHospitalSuccess} 
        />
      )}
    </ProtectedRoute>
  );
}
