'use client';

import { useState, useEffect } from 'react';
import { mothersApi } from '@/lib/healthcare-api';

interface Mother {
  _id: string;
  name: string;
  phone: string;
  age: number;
  address: string;
  healthCenter: {
    _id: string;
    name: string;
    type: string;
  };
  assignedHealthWorker?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: 'ACTIVE' | 'DELIVERED' | 'INACTIVE';
  registrationDate: string;
  expectedDeliveryDate?: string;
  highRisk: boolean;
}

export default function MothersManagement() {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [filteredMothers, setFilteredMothers] = useState<Mother[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMothers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMothers(mothers);
    } else {
      const filtered = mothers.filter(mother =>
        mother.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mother.phone.includes(searchQuery) ||
        mother.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMothers(filtered);
    }
  }, [searchQuery, mothers]);

  const fetchMothers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mothersApi.getAll();
      setMothers(data);
      setFilteredMothers(data);
    } catch (err: any) {
      console.error('Error fetching mothers:', err);
      setError(err.message || 'Failed to load mothers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'DELIVERED':
        return 'Delivered';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return status;
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchMothers}
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
              <h1 className="text-2xl font-bold text-gray-900">Mother Management</h1>
              <p className="text-sm text-gray-600">View and manage registered mothers</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/healthcare-dashboard/mothers/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register New Mother
              </a>
              <a
                href="/healthcare-dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search mothers by name, phone, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {filteredMothers.length} mothers</span>
              <span>Active: {mothers.filter(m => m.status === 'ACTIVE').length}</span>
              <span>High Risk: {mothers.filter(m => m.highRisk).length}</span>
            </div>
          </div>
        </div>

        {/* Mothers List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredMothers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👩</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No mothers found' : 'No mothers registered'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Start by registering a new mother in the system'
                }
              </p>
              {!searchQuery && (
                <a
                  href="/healthcare-dashboard/mothers/register"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register First Mother
                </a>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health Center
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMothers.map((mother) => (
                    <tr key={mother._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mother.name}</div>
                          {mother.assignedHealthWorker && (
                            <div className="text-xs text-gray-500">
                              Assigned to: {mother.assignedHealthWorker.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mother.phone}</div>
                        <div className="text-xs text-gray-500">{mother.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mother.age} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mother.healthCenter.name}</div>
                        <div className="text-xs text-gray-500">{mother.healthCenter.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mother.status)}`}>
                          {getStatusText(mother.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mother.highRisk ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            High Risk
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(mother.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/healthcare-dashboard/mothers/${mother._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </a>
                          <a
                            href={`/healthcare-dashboard/pregnancy/mother/${mother._id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Pregnancy
                          </a>
                          <a
                            href={`/healthcare-dashboard/children/mother/${mother._id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Children
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
