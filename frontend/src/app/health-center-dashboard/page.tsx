'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserForm } from '@/components/AddUserForm';

export default function HealthCenterDashboard() {
  const { user, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);

  const handleAddUserSuccess = () => {
    alert('User added successfully!');
  };

  return (
    <ProtectedRoute requiredRole="HEALTH_CENTER_ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 22a7 7 0 00-14 0" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Health Center Dashboard</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Health Center Overview</h2>
                <p className="text-gray-600">View and manage service activity, staff, and daily operations for your health center.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Staff Management</h2>
                <p className="text-gray-600">Add and update doctors, nurses, midwives, and support staff accounts.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Care Tracking</h2>
                <p className="text-gray-600">Monitor maternal and child health services and keep records updated.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200"
                  onClick={() => setShowAddUser(true)}
                >
                  Add User
                </button>
                <Link
                  href="/health-center-dashboard"
                  className="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  View Users
                </Link>
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Add Patient Record
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Manage Staff
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                  View Reports
                </button>
                <button className="w-full bg-cyan-600 text-white px-4 py-3 rounded-lg hover:bg-cyan-700 transition-colors duration-200">
                  Service Summary
                </button>
              </div>
            </div>
          </div>
        </main>

        {showAddUser && (
          <AddUserForm
            onClose={() => setShowAddUser(false)}
            onSuccess={handleAddUserSuccess}
            allowedRoles={['DOCTOR', 'NURSE', 'MIDWIFE', 'DISPATCHER', 'LIAISON_OFFICER', 'HOSPITAL_APPROVER', 'SPECIALIST', 'GATEKEEPER']}
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
