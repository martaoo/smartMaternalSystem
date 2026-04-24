'use client';

import { useState, useEffect } from 'react';
import { childrenApi } from '@/lib/healthcare-api';

interface Child {
  _id: string;
  name: string;
  birthDate: string;
  motherId: {
    _id: string;
    name: string;
    phone: string;
  };
  gender: 'MALE' | 'FEMALE';
  birthHospital: {
    _id: string;
    name: string;
    type: string;
  };
  deliveredBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  birthWeight?: number;
  birthHeight?: number;
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  registrationDate: string;
  deceased: boolean;
}

export default function ChildrenManagement() {
  const [children, setChildren] = useState<Child[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChildren(children);
    } else {
      const filtered = children.filter(child =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.motherId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.motherId.phone.includes(searchQuery)
      );
      setFilteredChildren(filtered);
    }
  }, [searchQuery, children]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await childrenApi.getAll();
      setChildren(data);
      setFilteredChildren(data);
    } catch (err: any) {
      console.error('Error fetching children:', err);
      setError(err.message || 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800';
      case 'NEEDS_ATTENTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'Healthy';
      case 'NEEDS_ATTENTION':
        return 'Needs Attention';
      case 'CRITICAL':
        return 'Critical';
      default:
        return status;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 28) {
      return `${ageInDays} days`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} months`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const remainingMonths = Math.floor((ageInDays % 365) / 30);
      return `${years}y ${remainingMonths}m`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading children...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4"></div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchChildren}
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
              <h1 className="text-2xl font-bold text-gray-900">Child Monitoring</h1>
              <p className="text-sm text-gray-600">View and monitor registered children</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/healthcare-dashboard/children/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register New Child
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
                placeholder="Search children by name, mother, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {filteredChildren.length} children</span>
              <span>Healthy: {children.filter(c => c.healthStatus === 'HEALTHY').length}</span>
              <span>Needs Attention: {children.filter(c => c.healthStatus === 'NEEDS_ATTENTION').length}</span>
              <span>Critical: {children.filter(c => c.healthStatus === 'CRITICAL').length}</span>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredChildren.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No children found' : 'No children registered'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Start by registering a new child in the system'
                }
              </p>
              {!searchQuery && (
                <a
                  href="/healthcare-dashboard/children/register"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register First Child
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
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mother
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Birth Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health Status
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
                  {filteredChildren.map((child) => (
                    <tr key={child._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-lg mr-3">
                            {child.gender === 'MALE' ? 'boy' : 'girl'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{child.name}</div>
                            <div className="text-xs text-gray-500">
                              {child.birthWeight && `${child.birthWeight}g`}
                              {child.birthWeight && child.birthHeight && ' | '}
                              {child.birthHeight && `${child.birthHeight}cm`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(child.birthDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          child.gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {child.gender === 'MALE' ? 'Male' : 'Female'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{child.motherId.name}</div>
                        <div className="text-xs text-gray-500">{child.motherId.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{child.birthHospital.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(child.birthDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(child.healthStatus)}`}>
                          {getHealthStatusText(child.healthStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(child.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/healthcare-dashboard/children/${child._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </a>
                          <a
                            href={`/healthcare-dashboard/children/${child._id}/growth`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Growth
                          </a>
                          <a
                            href={`/healthcare-dashboard/vaccinations/child/${child._id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Vaccines
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
