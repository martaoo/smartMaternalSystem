'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mothersApi } from '@/lib/healthcare-api';
import { useAuth } from '@/contexts/AuthContext';

interface Mother {
  _id: string;
  name: string;
  phone: string;
  age: number;
  address: string;
  healthCenter: string;
  woredaId?: string;
  lastVisitDate?: string;
  riskLevel?: string;
  pregnancyCount?: number;
  childCount?: number;
}

export default function ReferralMotherSelection() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Only fetch mothers when auth is not loading
    if (!authLoading) {
      fetchMothers();
    }
  }, [authLoading]);

  const fetchMothers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated - token is stored in HTTP-only cookie
      console.log('Mother selection auth check:', { user: !!user, authLoading });
      
      if (!user) {
        // Only redirect if user is missing (token is in cookie)
        console.log('No user found in mother selection, redirecting to login');
        router.push('/auth');
        return;
      }
      
      const mothersData = await mothersApi.getAll();
      setMothers(Array.isArray(mothersData) ? mothersData : []);
    } catch (err) {
      console.error('Error fetching mothers:', err);
      setError('Failed to load mothers');
    } finally {
      setLoading(false);
    }
  };

  const filteredMothers = mothers.filter(mother =>
    mother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mother.phone.includes(searchTerm) ||
    mother.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMother = (motherId: string) => {
    router.push(`/healthcare-dashboard/referrals/create/${motherId}`);
  };

  const handleCreateReferralDirect = () => {
    router.push('/healthcare-dashboard/mothers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mothers...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Create Referral</h1>
              <p className="text-sm text-gray-600">Select a mother to create referral for</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/healthcare-dashboard/referrals/manage')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Referrals
              </button>
              <button
                onClick={() => router.push('/healthcare-dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleCreateReferralDirect}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Register New Mother
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

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search mothers by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchMothers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Mothers List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Mother ({filteredMothers.length})
            </h2>
          </div>

          {filteredMothers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👩‍👧‍👦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No mothers found' : 'No mothers registered'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Register some mothers first'}
              </p>
              <button
                onClick={() => router.push('/healthcare-dashboard/mothers/register')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Mother
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMothers.map((mother) => (
                <div
                  key={mother._id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectMother(mother._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-lg">
                              {mother.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{mother.name}</h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                            <span>📞 {mother.phone}</span>
                            <span>🎂 {mother.age} years</span>
                            <span>📍 {mother.address || 'No address'}</span>
                            <span>🏥 {(mother.healthCenter as any)?.name || mother.healthCenter || 'No health center'}</span>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            {mother.lastVisitDate && (
                              <span className="text-gray-600">
                                Last visit: {new Date(mother.lastVisitDate as any).toLocaleDateString()}
                              </span>
                            )}
                            {mother.pregnancyCount !== undefined && (
                              <span className="text-blue-600">
                                Pregnancies: {mother.pregnancyCount}
                              </span>
                            )}
                            {mother.childCount !== undefined && (
                              <span className="text-purple-600">
                                Children: {mother.childCount}
                              </span>
                            )}
                            {mother.riskLevel && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mother.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                mother.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {mother.riskLevel} Risk
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Select
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
