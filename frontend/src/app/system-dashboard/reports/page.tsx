'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { referralsApi, vaccinationsApi, childrenApi } from '@/lib/healthcare-api';

export default function SystemAdminReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users,    setUsers]    = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [refStats,  setRefStats]  = useState<any>({});
  const [vacStats,  setVacStats]  = useState<any>({});
  const [childStats,setChildStats]= useState<any>({});

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [u, h, rs, vs, cs] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getHospitals().catch(() => []),
        referralsApi.getAdminStats().catch(() => ({})),
        vaccinationsApi.getVaccinationStats().catch(() => ({})),
        childrenApi.getStats().catch(() => ({})),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setHospitals(Array.isArray(h) ? h : []);
      setRefStats(rs || {});
      setVacStats(vs || {});
      setChildStats(cs || {});
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const hospitals_count   = hospitals.filter((h: any) => h.type === 'HOSPITAL').length;
  const hc_count          = hospitals.filter((h: any) => h.type === 'HEALTH_CENTER').length;
  const systemAdmins      = users.filter((u: any) => u.role === 'SYSTEM_ADMIN').length;
  const woredaAdmins      = users.filter((u: any) => u.role === 'WOREDA_ADMIN').length;
  const hospitalAdmins    = users.filter((u: any) => u.role === 'HOSPITAL_ADMIN' || u.role === 'HEALTH_CENTER_ADMIN').length;
  const clinicalStaff     = users.filter((u: any) => ['DOCTOR','NURSE','MIDWIFE'].includes(u.role)).length;

  const Stat = ({ label, value, bg, text }: { label: string; value: any; bg: string; text: string }) => (
    <div className={`rounded-lg p-4 border ${bg}`}>
      <p className={`text-xs font-medium mb-1 opacity-70 ${text}`}>{label}</p>
      <p className={`text-3xl font-bold ${text}`}>{loading ? '…' : value}</p>
    </div>
  );

  return (
    <ProtectedRoute requiredRole={['SYSTEM_ADMIN']}>
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">System Admin Reports</h1>
                  <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium">
                  🖨️ Print / Export PDF
                </button>
                <Link href="/system-dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  ← Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Print header */}
          <div className="hidden print:block text-center mb-4 border-b pb-4">
            <h1 className="text-2xl font-bold">System Administration Report</h1>
            <p className="text-gray-500 text-sm">Smart Maternal Health System · {new Date().toLocaleString()}</p>
          </div>

          {/* Referral Report */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">🔄 Referral Report</h3>
            <p className="text-xs text-gray-400 mb-4">Referral statistics across all facilities</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Total Referrals"    value={refStats.total??0}     bg="bg-blue-50 border-blue-200"     text="text-blue-900" />
              <Stat label="Completed"          value={refStats.completed??0} bg="bg-green-50 border-green-200"   text="text-green-900" />
              <Stat label="Pending"            value={refStats.pending??0}   bg="bg-yellow-50 border-yellow-200" text="text-yellow-900" />
              <Stat label="Accepted"           value={refStats.accepted??0}  bg="bg-indigo-50 border-indigo-200" text="text-indigo-900" />
              <Stat label="Rejected"           value={refStats.rejected??0}  bg="bg-red-50 border-red-200"       text="text-red-900" />
              <Stat label="Checked In"         value={refStats.checkedIn??0} bg="bg-purple-50 border-purple-200" text="text-purple-900" />
              <Stat label="Active"             value={refStats.active??0}    bg="bg-orange-50 border-orange-200" text="text-orange-900" />
              <Stat label="Expired"            value={refStats.expired??0}   bg="bg-gray-50 border-gray-200"     text="text-gray-900" />
            </div>
            {(refStats.total??0) > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Completion Rate</span>
                  <span className="font-semibold">{Math.round(((refStats.completed??0)/(refStats.total||1))*100)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{width:`${Math.round(((refStats.completed??0)/(refStats.total||1))*100)}%`}}/>
                </div>
              </div>
            )}
          </div>

          {/* Children & Vaccination Report */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">👶 Children & Vaccination Report</h3>
            <p className="text-xs text-gray-400 mb-4">Child health and immunization statistics</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Total Children"          value={childStats.total??0}           bg="bg-pink-50 border-pink-200"     text="text-pink-900" />
              <Stat label="Healthy"                 value={childStats.healthy??0}         bg="bg-green-50 border-green-200"   text="text-green-900" />
              <Stat label="Needs Attention"         value={childStats.needsAttention??0}  bg="bg-yellow-50 border-yellow-200" text="text-yellow-900" />
              <Stat label="Critical"                value={childStats.critical??0}        bg="bg-red-50 border-red-200"       text="text-red-900" />
              <Stat label="Vaccinations Scheduled"  value={vacStats.scheduled??0}         bg="bg-blue-50 border-blue-200"     text="text-blue-900" />
              <Stat label="Vaccinations Given"      value={vacStats.administered??0}      bg="bg-indigo-50 border-indigo-200" text="text-indigo-900" />
              <Stat label="Vaccinations Missed"     value={vacStats.missed??0}            bg="bg-orange-50 border-orange-200" text="text-orange-900" />
              <Stat label="Coverage Rate"           value={`${Math.round(vacStats.coverageRate??0)}%`} bg="bg-teal-50 border-teal-200" text="text-teal-900" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Vaccination Coverage</span>
                <span className="font-semibold">{Math.round(vacStats.coverageRate??0)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(vacStats.coverageRate??0)>=80?'bg-green-500':(vacStats.coverageRate??0)>=50?'bg-yellow-500':'bg-red-500'}`}
                  style={{width:`${Math.min(vacStats.coverageRate??0,100)}%`}}/>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(vacStats.coverageRate??0)>=80?'✅ Good coverage':(vacStats.coverageRate??0)>=50?'⚠️ Moderate — improvement needed':'🔴 Low — urgent action required'}
              </p>
            </div>
          </div>

          {/* Facilities & Users Report */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">🏥 Facilities & Users Report</h3>
            <p className="text-xs text-gray-400 mb-4">Infrastructure and user administration overview</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Total Hospitals"      value={hospitals_count}   bg="bg-indigo-50 border-indigo-200" text="text-indigo-900" />
              <Stat label="Total Health Centers" value={hc_count}          bg="bg-teal-50 border-teal-200"     text="text-teal-900" />
              <Stat label="Total Facilities"     value={hospitals.length}  bg="bg-gray-50 border-gray-200"     text="text-gray-900" />
              <Stat label="System Admins"        value={systemAdmins}      bg="bg-blue-50 border-blue-200"     text="text-blue-900" />
              <Stat label="Woreda Admins"        value={woredaAdmins}      bg="bg-green-50 border-green-200"   text="text-green-900" />
              <Stat label="Facility Admins"      value={hospitalAdmins}    bg="bg-purple-50 border-purple-200" text="text-purple-900" />
              <Stat label="Clinical Staff"       value={clinicalStaff}     bg="bg-pink-50 border-pink-200"     text="text-pink-900" />
              <Stat label="Total Users"          value={users.length}      bg="bg-slate-50 border-slate-200"   text="text-slate-900" />
            </div>
          </div>

          {/* Print footer */}
          <div className="hidden print:block text-center text-xs text-gray-400 mt-8 border-t pt-4">
            Smart Maternal Health System — System Administration · {new Date().toLocaleString()}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
