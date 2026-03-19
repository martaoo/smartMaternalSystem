'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserList } from '@/components/UserList';
import { AddUserForm } from '@/components/AddUserForm';
import { useAuth } from '@/contexts/AuthContext';

export default function MOHUsersPage() {
  const { user, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);

  const handleAddUserSuccess = () => {
    alert('User added successfully!');
  };

  return (
    <ProtectedRoute requiredRole="MOH_ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MOH Users</h1>
                  <p className="text-sm text-gray-500">All registered users visible to MOH administration.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/moh-dashboard"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Back to Dashboard
                </Link>
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

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Add User
              </button>
            </div>

            <UserList showOrgColumns />
          </div>
        </main>

        {showAddUser && (
          <AddUserForm onClose={() => setShowAddUser(false)} onSuccess={handleAddUserSuccess} />
        )}
      </div>
    </ProtectedRoute>
  );
}
