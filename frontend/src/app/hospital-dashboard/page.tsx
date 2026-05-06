'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserForm } from '@/components/AddUserForm';
import { api } from '@/lib/api';
import { referralsApi } from '@/lib/healthcare-api';

interface Stats {
  totalStaff: number;
  pendingReferrals: number;
  inboundReferrals: number;
}

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalStaff: 0, pendingReferrals: 0, inboundReferrals: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, outbound, inbound] = await Promise.allSettled([
          api.getUsers(),
          referralsApi.getOutbox(),
          referralsApi.getAll('inbound'),
        ]);

        const u = users.status === 'fulfilled' && Array.isArray(users.value) ? users.value : [];
        const ob = outbound.status === 'fulfilled' && Array.isArray(outbound.value) ? outbound.value : [];
        const ib = inbound.status === 'fulfilled' && Array.isArray(inbound.value) ? inbound.value : [];

        setStats({
          totalStaff: u.length,
          pendingReferrals: ob.filter((r: any) => r.status === 'PENDING').length,
          inboundReferrals: ib.filter((r: any) => r.status === 'PENDING').length,
        });
      } catch {
        // stats are non-critical, silently fail
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  const handleAddUserSuccess = () => {
    setShowAddUser(false);
    setStatsLoading(true);
    api.getUsers()
      .then((u) => {
        setStats((prev) => ({ ...prev, totalStaff: Array.isArray(u) ? u.length : prev.totalStaff }));
      })
      .catch(() => { /* non-admin roles can't list users — ignore */ })
      .finally(() => setStatsLoading(false));
  };

  const statVal = (n: number) => statsLoading ? '…' : n;

  return (
    <ProtectedRoute requiredRole="HOSPITAL_ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hospital Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/hospital-dashboard/profile" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                  My Profile
                </Link>
                <button
                  onClick={logout}
                  className="whitespace-nowrap bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 space-y-6">

            {/* ── Stats row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-teal-500">
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.totalStaff)}</p>
                <p className="text-xs text-gray-400 mt-1">Registered at your facility</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-500">Pending Outbound Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.pendingReferrals)}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting receiving hospital response</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-500">Pending Inbound Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.inboundReferrals)}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting your response</p>
              </div>
            </div>

            {/* ── Navigation cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Staff Management */}
              <Link
                href="/hospital-dashboard/users"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
                </div>
                <p className="text-sm text-gray-600">View, add, edit and remove doctors, nurses, midwives and support staff.</p>
                <p className="text-xs text-teal-600 mt-3 font-medium group-hover:underline">Manage staff →</p>
              </Link>

              {/* Reports */}
              <Link
                href="/hospital-dashboard/reports"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
                </div>
                <p className="text-sm text-gray-600">View maternal health, referral, vaccination and staff statistics for your hospital.</p>
                <p className="text-xs text-blue-600 mt-3 font-medium group-hover:underline">View reports →</p>
              </Link>

              {/* Analytics */}
              <Link
                href="/hospital-dashboard/analytics"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
                </div>
                <p className="text-sm text-gray-600">Detailed analytics on patient flows, referral trends and facility performance.</p>
                <p className="text-xs text-purple-600 mt-3 font-medium group-hover:underline">View analytics →</p>
              </Link>
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200" onClick={() => setShowAddUser(true)}>
                  Add Staff
                </button>

                <Link
                  href="/hospital-dashboard/users"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage Staff
                </Link>
                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                  Number of Mothers Registered
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Number of Children Registered
                </button>
                <button className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                  View Reports
                </Link>

                <Link
                  href="/hospital-dashboard/profile"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
              </div>
            </div>

          </div>
        </main>

        {showAddUser && (
          <AddUserForm
            onClose={() => setShowAddUser(false)}
            onSuccess={handleAddUserSuccess}
            allowedRoles={['DOCTOR', 'NURSE', 'MIDWIFE', 'LIAISON_OFFICER', 'DISPATCHER', 'HOSPITAL_APPROVER', 'SPECIALIST', 'GATEKEEPER']}
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
