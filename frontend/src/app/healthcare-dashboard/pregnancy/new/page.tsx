'use client';

import { useState, useEffect } from 'react';
import { mothersApi } from '@/lib/healthcare-api';
import { useRouter } from 'next/navigation';

export default function NewPregnancyVisit() {
  const router = useRouter();
  
  const [mothers, setMothers] = useState<any[]>([]);
  const [filteredMothers, setFilteredMothers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMothers();
  }, []);

  useEffect(() => {
    // Filter mothers based on search term
    const filtered = mothers.filter(mother => 
      mother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mother.phone.includes(searchTerm) ||
      (mother.email && mother.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMothers(filtered);
  }, [searchTerm, mothers]);

  const fetchMothers = async () => {
    try {
      const data = await mothersApi.getAll();
      const activeMothers = data.filter((mother: any) => mother.status === 'ACTIVE');
      setMothers(activeMothers);
      setFilteredMothers(activeMothers);
    } catch (err: any) {
      console.error('Error fetching mothers:', err);
      setError(err.message || 'Failed to load mothers');
    }
  };

  const handleMotherSelect = (mother: any) => {
    router.push(`/healthcare-dashboard/pregnancy/new/${mother._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Pregnancy Visit</h1>
              <p className="text-sm text-gray-600">Select a mother to record pregnancy visit</p>
            </div>
            <a
              href="/healthcare-dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Mother</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search mothers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">â</span>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {filteredMothers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">ð</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mothers found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No active mothers registered in the system'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMothers.map((mother) => (
                <div
                  key={mother._id}
                  onClick={() => handleMotherSelect(mother)}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {mother.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{mother.name}</h3>
                      <p className="text-sm text-gray-600">ID: {mother._id.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {mother.phone}
                    </div>
                    
                    {mother.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {mother.email}
                      </div>
                    )}
                    
                    {mother.bloodType && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86-.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 1.414L4.828 12.586a2 2 0 01-1.414-1.414l5-5A2 2 0 018 6.172V5z" />
                        </svg>
                        Blood Type: {mother.bloodType}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mother.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mother.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Select Mother
                    </button>
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
