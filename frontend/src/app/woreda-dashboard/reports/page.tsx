'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { childrenApi, referralsApi, vaccinationsApi } from '@/lib/healthcare-api';
import { api } from '@/lib/api';

export default function WoredaReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [children, setChildren]     = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [refStats, setRefStats]     = useState<any>({});
  const [vacStats, setVacStats]     = useState<any>({});
  const [childStats, setChildStats] = useState<any>({});

  const fetchAll = useCallback(async () => {
    if (!user?.woredaId) return;
    setLoading(true);
    try {
      const woredaId = typeof user.woredaId === 'string' ? user.woredaId : (user.woredaId as any)?._id?.toString() ?? '';
      const [ch, hosp, rs, vs, cs] = await Promise.all([
        childrenApi.getByWoreda(woredaId).catch(() => []),
        api.getHospitals().catch(() => []),
        referralsApi.getAdminStats().catch(() => ({})),
        vaccinationsApi.getVaccinationStats().catch(() => ({})),
        childrenApi.getStats().catch(() => ({})),
      ]);
      const allChildren = Array.isArray(ch) ? ch : [];
      const allHosp = Array.isArray(hosp) ? hosp : [];
      const woredaFacilities = allHosp.filter((h: any) => {
        const fWoreda = h.woredaId?._id?.toString() ?? h.woredaId?.toString() ?? '';
        return fWoreda === woredaId;
      });
      setChildren(allChildren);
      setFacilities(woredaFacilities);
      setRefStats(rs || {});
      setVacStats(vs || {});
      setChildStats(cs || {});
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const issued  = children.filter((c: any) => c.verified).length;
  const pending = children.filter((c: any) => !c.verified).length;
  const hospitals    = facilities.filter((f: any) => f.type === 'HOSPITAL').length;
  const healthCenters = facilities.filter((f: any) => f.type === 'HEALTH_CENTER').length;

  const Stat = ({ label, value, bg, text }: { label: string; value: any; bg: string; text: string }) => (
    <div className={`rounded-lg p-4 border ${bg}`}>
      <p className={`text-xs font-medium mb-1 opacity-70 ${text}`}>{label}</p>
      <p className={`text-3xl font-bold ${text}`}>{loading ? '…' : value}</p>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="WOREDA_ADMIN">
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Woreda Reports</h1>
                  <p className="text-sm text-gray-500">Woreda: {user?.woredaId || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium">
                  🖨️ Print / Export PDF
                </button>
                <Link href="/woreda-dashboard"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  ← Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Print header */}
          <div className="hidden print:block text-center mb-4 border-b pb-4">
            <h1 className="text-2xl font-bold">Woreda Administration Report</h1>
            <p className="text-gray-500 text-sm">Smart Maternal Health System · {new Date().toLocaleString()}</p>
          </div>

          {/* Birth Certificates */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">📄 Birth Certificate Report</h3>
            <p className="text-xs text-gray-400 mb-4">Certificate issuance status for children in this woreda</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Total Children"        value={children.length} bg="bg-blue-50 border-blue-200"   text="text-blue-900" />
              <Stat label="Certificates Issued"   value={issued}          bg="bg-green-50 border-green-200" text="text-green-900" />
              <Stat label="Pending Certificate"   value={pending}         bg="bg-yellow-50 border-yellow-200" text="text-yellow-900" />
            </div>
            {children.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Certificate Issuance Rate</span>
                  <span className="font-semibold">{Math.round((issued / children.length) * 100)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round((issued / children.length) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">🏥 Facilities Report</h3>
            <p className="text-xs text-gray-400 mb-4">Health facilities registered in this woreda</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Total Facilities"  value={facilities.length} bg="bg-gray-50 border-gray-200"     text="text-gray-900" />
              <Stat label="Hospitals"         value={hospitals}         bg="bg-indigo-50 border-indigo-200" text="text-indigo-900" />
              <Stat label="Health Centers"    value={healthCenters}     bg="bg-teal-50 border-teal-200"     text="text-teal-900" />
            </div>
            {facilities.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Facility Name', 'Type', 'Location', 'Contact'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {facilities.map((f: any) => (
                      <tr key={f._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{f.name}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${f.type === 'HOSPITAL' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                            {f.type === 'HEALTH_CENTER' ? 'Health Center' : f.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{f.location || '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{f.contact || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Children & Vaccination */}
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
                <span className="font-semibold">{Math.round(vacStats.coverageRate ?? 0)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(vacStats.coverageRate??0)>=80?'bg-green-500':(vacStats.coverageRate??0)>=50?'bg-yellow-500':'bg-red-500'}`}
                  style={{ width: `${Math.min(vacStats.coverageRate??0, 100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(vacStats.coverageRate??0)>=80?'✅ Good coverage':(vacStats.coverageRate??0)>=50?'⚠️ Moderate — improvement needed':'🔴 Low — urgent action required'}
              </p>
            </div>
          </div>

          {/* Referral Report */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">🔄 Referral Report</h3>
            <p className="text-xs text-gray-400 mb-4">Maternal referral statistics</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Total Referrals" value={refStats.total??0}     bg="bg-blue-50 border-blue-200"     text="text-blue-900" />
              <Stat label="Completed"       value={refStats.completed??0} bg="bg-green-50 border-green-200"   text="text-green-900" />
              <Stat label="Pending"         value={refStats.pending??0}   bg="bg-yellow-50 border-yellow-200" text="text-yellow-900" />
              <Stat label="Rejected"        value={refStats.rejected??0}  bg="bg-red-50 border-red-200"       text="text-red-900" />
            </div>
          </div>

          {/* Print footer */}
          <div className="hidden print:block text-center text-xs text-gray-400 mt-8 border-t pt-4">
            Smart Maternal Health System — Woreda Administration · {new Date().toLocaleString()}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
