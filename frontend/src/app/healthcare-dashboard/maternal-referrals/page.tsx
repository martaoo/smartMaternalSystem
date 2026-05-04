'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { referralsApi } from '@/lib/healthcare-api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MaternalReferral, 
  ReferralStatus, 
  UrgencyLevel, 
  RiskLevel,
  STATUS_CONFIG,
  URGENCY_CONFIG,
  RISK_CONFIG
} from '@/types/referral';

export default function MaternalReferralDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [referrals, setReferrals] = useState<MaternalReferral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<MaternalReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'ALL'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'ALL'>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');

  useEffect(() => {
    if (!authLoading) {
      fetchReferrals();
    }
  }, [authLoading]);

  useEffect(() => {
    filterReferrals();
  }, [referrals, searchTerm, statusFilter, urgencyFilter, riskFilter]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        router.push('/auth');
        return;
      }

      const response = await referralsApi.getAll();
      const referralData = Array.isArray(response) ? response : [];
      
      // Sort by priority (emergency first), then by creation date (newest first)
      const sortedReferrals = referralData.sort((a: MaternalReferral, b: MaternalReferral) => {
        // Priority by urgency
        const urgencyPriorityA = URGENCY_CONFIG[a.urgency].priority;
        const urgencyPriorityB = URGENCY_CONFIG[b.urgency].priority;
        
        if (urgencyPriorityA !== urgencyPriorityB) {
          return urgencyPriorityB - urgencyPriorityA; // Higher priority first
        }
        
        // Then by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setReferrals(sortedReferrals);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const filterReferrals = () => {
    let filtered = referrals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(referral => 
        referral.mother?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.toHospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(referral => referral.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'ALL') {
      filtered = filtered.filter(referral => referral.urgency === urgencyFilter);
    }

    // Risk filter
    if (riskFilter !== 'ALL') {
      filtered = filtered.filter(referral => referral.riskLevel === riskFilter);
    }

    setFilteredReferrals(filtered);
  };

  const getStatusColor = (status?: ReferralStatus) => {
    if (!status || !STATUS_CONFIG[status]) {
      return STATUS_CONFIG[ReferralStatus.CREATED].bgColor;
    }
    return STATUS_CONFIG[status].bgColor;
  };

  const getStatusTextColor = (status?: ReferralStatus) => {
    if (!status || !STATUS_CONFIG[status]) {
      return STATUS_CONFIG[ReferralStatus.CREATED].color;
    }
    return STATUS_CONFIG[status].color;
  };

  const getStatusLabel = (status?: ReferralStatus) => {
    if (!status || !STATUS_CONFIG[status]) {
      return STATUS_CONFIG[ReferralStatus.CREATED].label;
    }
    return STATUS_CONFIG[status].label;
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    return URGENCY_CONFIG[urgency].bgColor;
  };

  const getUrgencyTextColor = (urgency: UrgencyLevel) => {
    return URGENCY_CONFIG[urgency].color;
  };

  const getRiskColor = (risk?: RiskLevel) => {
    if (!risk || !RISK_CONFIG[risk]) {
      return RISK_CONFIG[RiskLevel.LOW].bgColor;
    }
    return RISK_CONFIG[risk].bgColor;
  };

  const getRiskTextColor = (risk?: RiskLevel) => {
    if (!risk || !RISK_CONFIG[risk]) {
      return RISK_CONFIG[RiskLevel.LOW].color;
    }
    return RISK_CONFIG[risk].color;
  };

  const getRiskLabel = (risk?: RiskLevel) => {
    if (!risk || !RISK_CONFIG[risk]) {
      return RISK_CONFIG[RiskLevel.LOW].label;
    }
    return RISK_CONFIG[risk].label;
  };

  const isEmergency = (referral: MaternalReferral) => {
    return referral.urgency === UrgencyLevel.EMERGENCY;
  };

  const handleReferralClick = (referralId: string) => {
    router.push(`/healthcare-dashboard/maternal-referrals/${referralId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referrals...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Maternal Referrals</h1>
              <p className="text-sm text-gray-600">Manage maternal care referrals</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/healthcare-dashboard/maternal-referrals/create')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Referral
              </button>
              <button
                onClick={() => router.push('/healthcare-dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={logout}
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by mother name, referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                {Object.values(ReferralStatus).map(status => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Urgencies</option>
                {Object.values(UrgencyLevel).map(urgency => (
                  <option key={urgency} value={urgency}>
                    {URGENCY_CONFIG[urgency].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Risk Levels</option>
                {Object.values(RiskLevel).map(risk => (
                  <option key={risk} value={risk}>
                    {RISK_CONFIG[risk].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Referrals ({filteredReferrals.length})
            </h2>
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {referrals.length === 0 ? 'No referrals found' : 'No referrals match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {referrals.length === 0 
                  ? 'Create your first maternal referral to get started'
                  : 'Try adjusting your filters'
                }
              </p>
              {referrals.length === 0 && (
                <button
                  onClick={() => router.push('/healthcare-dashboard/maternal-referrals/create')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Referral
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <div
                  key={referral._id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isEmergency(referral) ? 'border-l-4 border-red-500' : ''
                  }`}
                  onClick={() => handleReferralClick(referral._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Emergency Indicator */}
                      {isEmergency(referral) && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="mr-1">🚨</span>
                            EMERGENCY
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-lg">
                              {referral.mother?.name?.charAt(0).toUpperCase() || 'M'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {referral.mother?.name || 'Unknown Mother'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)} ${getStatusTextColor(referral.status)}`}>
                              {getStatusLabel(referral.status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>📋 {referral.referralCode}</span>
                            <span>📞 {referral.mother?.phone || 'No phone'}</span>
                            <span>🏥 {referral.toHospitalName || 'Unknown hospital'}</span>
                            <span>📅 {new Date(referral.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)} ${getUrgencyTextColor(referral.urgency)}`}>
                              {URGENCY_CONFIG[referral.urgency].label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(referral.riskLevel)} ${getRiskTextColor(referral.riskLevel)}`}>
                              {getRiskLabel(referral.riskLevel)}
                            </span>
                            {referral.gestationalAge && (
                              <span className="text-gray-600">
                                🤰 {referral.gestationalAge} weeks
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
