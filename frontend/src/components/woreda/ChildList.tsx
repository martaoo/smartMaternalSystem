'use client';

import React, { useState } from 'react';

interface Child {
  _id: string;
  name?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  mother: {
    _id: string;
    name: string;
    phone: string;
  };
  birthFacility: {
    _id: string;
    name: string;
    type: 'HOSPITAL' | 'HEALTH_CENTER';
  };
  woreda: string;
  registrationTimestamp: string;
  verified: boolean;
}

interface ChildListProps {
  children: Child[];
  onVerify: (childId: string) => void;
  onRefresh: () => void;
}

export function ChildList({ children, onVerify, onRefresh }: ChildListProps) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');

  // Get unique facilities for filter dropdown
  const facilities = Array.from(new Set(children.map(c => c.birthFacility.name)));

  // Filter children based on selected filters
  const filteredChildren = children.filter(child => {
    const statusMatch = filter === 'all' || 
      (filter === 'verified' && child.verified) || 
      (filter === 'pending' && !child.verified);
    
    const facilityMatch = facilityFilter === 'all' || child.birthFacility.name === facilityFilter;
    
    return statusMatch && facilityMatch;
  });

  const handleViewDetails = (child: Child) => {
    setSelectedChild(child);
    setShowDetailModal(true);
  };

  const handleVerify = async (childId: string) => {
    if (window.confirm('Are you sure you want to verify this child record?')) {
      await onVerify(childId);
    }
  };

  const getGenderColor = (gender: string) => {
    return gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  };

  const getVerificationColor = (verified: boolean) => {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Newborn Children Registration</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Children ({children.length})</option>
              <option value="pending">Pending Verification ({children.filter(c => !c.verified).length})</option>
              <option value="verified">Verified ({children.filter(c => c.verified).length})</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Facility Filter</label>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Facilities</option>
              {facilities.map(facility => (
                <option key={facility} value={facility}>{facility}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Children Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredChildren.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">{'\ud83d\udc76'}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' && facilityFilter === 'all' ? 'No children registered' : 'No children found'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' && facilityFilter === 'all' 
                ? 'No newborn children have been registered from facilities in your woreda yet.'
                : 'Try adjusting your filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mother
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Birth Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <div className="text-sm font-medium text-gray-900">
                        {child.name || 'Not Named Yet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(child.dateOfBirth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGenderColor(child.gender)}`}>
                        {child.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{child.mother.name}</div>
                      <div className="text-xs text-gray-500">{child.mother.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{child.birthFacility.name}</div>
                      <div className="text-xs text-gray-500">{child.birthFacility.type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(child.registrationTimestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationColor(child.verified)}`}>
                        {child.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(child)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {!child.verified && (
                          <button
                            onClick={() => handleVerify(child._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Child Detail Modal */}
      {showDetailModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Child Registration Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Child Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Child Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedChild.name || 'Not Named Yet'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date of Birth:</span>
                      <span className="text-sm font-medium">{formatDate(selectedChild.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gender:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGenderColor(selectedChild.gender)}`}>
                        {selectedChild.gender}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Woreda:</span>
                      <span className="text-sm font-medium">{selectedChild.woreda}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Registration Date:</span>
                      <span className="text-sm font-medium">{formatDate(selectedChild.registrationTimestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verification Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationColor(selectedChild.verified)}`}>
                        {selectedChild.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mother Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mother Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedChild.mother.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{selectedChild.mother.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Birth Facility</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Facility Name:</span>
                      <span className="text-sm font-medium">{selectedChild.birthFacility.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Facility Type:</span>
                      <span className="text-sm font-medium">{selectedChild.birthFacility.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              {!selectedChild.verified && (
                <button
                  onClick={() => {
                    handleVerify(selectedChild._id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Verify Registration
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
