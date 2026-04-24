'use client';

import { useState, useEffect } from 'react';
import { mothersApi, pregnancyApi, childrenApi, vaccinationsApi } from '@/lib/healthcare-api';

interface DashboardStats {
  mothers: number;
  activePregnancies: number;
  highRiskPregnancies: number;
  children: number;
  upcomingVaccinations: number;
  overdueVaccinations: number;
  followUpNeeded: number;
}

export default function HealthcareDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    mothers: 0,
    activePregnancies: 0,
    highRiskPregnancies: 0,
    children: 0,
    upcomingVaccinations: 0,
    overdueVaccinations: 0,
    followUpNeeded: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        mothers,
        pregnancyStats,
        childrenStats,
        upcomingVaccinations,
        overdueVaccinations,
        followUpNeeded
      ] = await Promise.all([
        mothersApi.getAll().catch(() => []),
        pregnancyApi.getStats().catch(() => ({ total: 0, highRisk: 0 })),
        childrenApi.getStats().catch(() => ({ total: 0 })),
        vaccinationsApi.getUpcomingVaccinations(7).catch(() => []),
        vaccinationsApi.getOverdueVaccinations().catch(() => []),
        childrenApi.getFollowUpNeeded().catch(() => []),
      ]);

      setStats({
        mothers: Array.isArray(mothers) ? mothers.length : 0,
        activePregnancies: pregnancyStats.total || 0,
        highRiskPregnancies: pregnancyStats.highRisk || 0,
        children: childrenStats.total || 0,
        upcomingVaccinations: upcomingVaccinations.length || 0,
        overdueVaccinations: overdueVaccinations.length || 0,
        followUpNeeded: followUpNeeded.length || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`text-3xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchDashboardStats}
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
              <h1 className="text-2xl font-bold text-gray-900">Healthcare Worker Dashboard</h1>
              <p className="text-sm text-gray-600">Maternal and Child Health Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardStats}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Mothers"
            value={stats.mothers}
            color="text-blue-600"
            icon="👩"
          />
          <StatCard
            title="Active Pregnancies"
            value={stats.activePregnancies}
            color="text-green-600"
            icon="🤰"
          />
          <StatCard
            title="High Risk Pregnancies"
            value={stats.highRiskPregnancies}
            color="text-red-600"
            icon="⚠️"
          />
          <StatCard
            title="Total Children"
            value={stats.children}
            color="text-purple-600"
            icon="👶"
          />
          <StatCard
            title="Upcoming Vaccinations"
            value={stats.upcomingVaccinations}
            color="text-yellow-600"
            icon="💉"
          />
          <StatCard
            title="Overdue Vaccinations"
            value={stats.overdueVaccinations}
            color="text-red-600"
            icon="⏰"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/healthcare-dashboard/mothers/register"
                className="block px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Mother
              </a>
              <a
                href="/healthcare-dashboard/pregnancy/new"
                className="block px-4 py-3 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
              >
                Pregnancy Visit
              </a>
              <a
                href="/healthcare-dashboard/children/register"
                className="block px-4 py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
              >
                Register Child
              </a>
              <a
                href="/healthcare-dashboard/vaccinations"
                className="block px-4 py-3 bg-yellow-600 text-white text-center rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Vaccinations
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
            <div className="space-y-3">
              {stats.overdueVaccinations > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">⚠️</span>
                    <span className="text-red-800">
                      {stats.overdueVaccinations} overdue vaccination{stats.overdueVaccinations !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
              {stats.highRiskPregnancies > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">🤰</span>
                    <span className="text-yellow-800">
                      {stats.highRiskPregnancies} high-risk pregnanc{stats.highRiskPregnancies !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                </div>
              )}
              {stats.followUpNeeded > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">👶</span>
                    <span className="text-blue-800">
                      {stats.followUpNeeded} child{stats.followUpNeeded !== 1 ? 'ren' : ''} need follow-up
                    </span>
                  </div>
                </div>
              )}
              {stats.overdueVaccinations === 0 && stats.highRiskPregnancies === 0 && stats.followUpNeeded === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-green-800">All systems normal</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/healthcare-dashboard/mothers"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Mother Management</h3>
              <p className="text-sm text-gray-600 mt-1">Register and manage mothers</p>
            </a>
            <a
              href="/healthcare-dashboard/pregnancy"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Pregnancy Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor pregnancy progress</p>
            </a>
            <a
              href="/healthcare-dashboard/children"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Child Monitoring</h3>
              <p className="text-sm text-gray-600 mt-1">Track child growth and development</p>
            </a>
            <a
              href="/healthcare-dashboard/vaccinations"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Vaccinations</h3>
              <p className="text-sm text-gray-600 mt-1">Manage immunization schedules</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
