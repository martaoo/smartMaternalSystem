'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserForm } from '@/components/AddUserForm';
import { api } from '@/lib/api';
import { referralsApi } from '@/lib/healthcare-api';

interface Stats {
  totalStaff: number;
  totalMothers: number;
  totalChildren: number;
  pendingReferrals: number;
  inboundReferrals: number;
}

export default function HealthCenterDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showAddUser, setShowAddUser] = useState(false);
  const [stats, setStats] = useState<Stats>({ 
    totalStaff: 0, 
    totalMothers: 0,
    totalChildren: 0,
    pendingReferrals: 0, 
    inboundReferrals: 0 
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const [usersRes, outboundRes, inboundRes] = await Promise.allSettled([
        api.getUsers(),
        referralsApi.getOutbox(),
        referralsApi.getAll('inbound'),
      ]);
      
      const allUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      const outbound = outboundRes.status === 'fulfilled' && Array.isArray(outboundRes.value) ? outboundRes.value : [];
      const inbound = inboundRes.status === 'fulfilled' && Array.isArray(inboundRes.value) ? inboundRes.value : [];
      
      const hospitalId = typeof user?.hospitalId === 'string' ? user.hospitalId : (user?.hospitalId as any)?._id;

      const getHospId = (usr: any) => {
        if (!usr.hospitalId) return null;
        return typeof usr.hospitalId === 'object' ? (usr.hospitalId._id?.toString() || usr.hospitalId.toString()) : usr.hospitalId.toString();
      };

      setStats({
        totalStaff: allUsers.filter((usr: any) => getHospId(usr) === hospitalId && usr.role !== 'MOTHER' && usr.role !== 'CHILD').length,
        totalMothers: allUsers.filter((usr: any) => getHospId(usr) === hospitalId && usr.role === 'MOTHER').length,
        totalChildren: allUsers.filter((usr: any) => getHospId(usr) === hospitalId && usr.role === 'CHILD').length,
        pendingReferrals: outbound.filter((r: any) => r.status === 'PENDING').length,
        inboundReferrals: inbound.filter((r: any) => r.status === 'PENDING').length,
      });
    } catch {
      // non-critical
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [user]);

  const statVal = (n: number) => statsLoading ? '…' : n;

  return (
    <ProtectedRoute requiredRole="HEALTH_CENTER_ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Health Center Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/health-center-dashboard/profile" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                  My Profile
                </Link>
                <button
                  onClick={() => logout(() => router.push('/auth'))}
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

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-teal-500">
                <p className="text-sm text-gray-500 font-medium">Total Staff</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.totalStaff)}</p>
                <p className="text-xs text-gray-400 mt-1">At your facility</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-pink-500">
                <p className="text-sm text-gray-500 font-medium">Total Mothers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.totalMothers)}</p>
                <p className="text-xs text-gray-400 mt-1">Registered patients</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 font-medium">Total Children</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.totalChildren)}</p>
                <p className="text-xs text-gray-400 mt-1">Tracked dependents</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-500 font-medium">Outbound Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.pendingReferrals)}</p>
                <p className="text-xs text-gray-400 mt-1">Pending response</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-500 font-medium">Inbound Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{statVal(stats.inboundReferrals)}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting decision</p>
              </div>
            </div>

            {/* Navigation cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Staff Management */}
              <Link
                href="/health-center-dashboard/users"
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
                href="/health-center-dashboard/reports"
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
                <p className="text-sm text-gray-600">View maternal health, referral, vaccination and staff statistics.</p>
                <p className="text-xs text-blue-600 mt-3 font-medium group-hover:underline">View reports →</p>
              </Link>

              {/* Analytics */}
              <Link
                href="/health-center-dashboard/analytics"
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
                <p className="text-sm text-gray-600">Detailed analytics on patient flows and facility service performance.</p>
                <p className="text-xs text-purple-600 mt-3 font-medium group-hover:underline">View analytics →</p>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Staff
                </button>

                <Link
                  href="/health-center-dashboard/patients"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                >
                  Manage Mothers
                </Link>

                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  Mothers: {statVal(stats.totalMothers)}
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Children: {statVal(stats.totalChildren)}
                </button>

                <Link
                  href="/healthcare-dashboard"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Open Care Dashboard
                </Link>
              </div>
            </div>

          </div>
        </main>

        {showAddUser && (
          <AddUserForm
            onClose={() => setShowAddUser(false)}
            onSuccess={() => { setShowAddUser(false); loadStats(); }}
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
