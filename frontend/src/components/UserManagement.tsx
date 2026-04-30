'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AddUserForm } from './AddUserForm';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId?: string | { name?: string } | null;
  woredaId?: string | { name?: string } | null;
  assignedRegion?: string;
  phoneNumber?: string;
  createdAt: string;
}

export function UserManagement() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchHospitals();
    fetchWoredas();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      setAllUsers(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on current user's role and permissions
  const getFilteredUsers = () => {
    if (!user) return allUsers;
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        // Super Admin can see all users
        return allUsers;
      
      case 'SYSTEM_ADMIN':
        // System Admin gets already filtered data from backend
        return allUsers;
      
      case 'WOREDA_ADMIN':
        // Woreda Admin can only see users in their woreda
        return allUsers.filter(u => 
          (u.woredaId && typeof u.woredaId === 'string' && u.woredaId === user.woredaId) ||
          (u.hospitalId && typeof u.hospitalId === 'string' && 
           hospitals.some(h => h._id === u.hospitalId && h.woredaId === user.woredaId))
        );
      
      case 'HOSPITAL_ADMIN':
        // Hospital Admin can only see users in their hospital
        return allUsers.filter(u => 
          (u.hospitalId && typeof u.hospitalId === 'string' && u.hospitalId === user.hospitalId)
        );
      
      case 'HEALTH_CENTER_ADMIN':
        // Health Center Admin can only see users in their health center
        return allUsers.filter(u => 
          (u.hospitalId && typeof u.hospitalId === 'string' && u.hospitalId === user.hospitalId)
        );
      
      default:
        // Other roles can only see themselves
        return allUsers.filter(u => u._id === user.id);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await api.getHospitals();
      setHospitals(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error('Failed to fetch hospitals:', err);
    }
  };

  const fetchWoredas = async () => {
    try {
      const response = await api.getWoredas();
      setWoredas(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error('Failed to fetch woredas:', err);
    }
  };

  const handleAddUserSuccess = () => {
    fetchUsers();
    setShowAddUser(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowAddUser(true);
  };

  const handleEditUserSuccess = () => {
    setEditingUser(null);
    setShowAddUser(false);
    fetchUsers(); // Refresh the users list after edit
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const getHospitalName = (hospitalId: any) => {
    if (!hospitalId) return '-';
    if (typeof hospitalId === 'object' && hospitalId.name) return hospitalId.name;
    
    const hospital = hospitals.find(h => h._id === hospitalId);
    return hospital ? hospital.name : hospitalId;
  };

  const getWoredaName = (woredaId: any) => {
    if (!woredaId) return '-';
    if (typeof woredaId === 'object' && woredaId.name) return woredaId.name;
    
    const woreda = woredas.find(w => w._id === woredaId);
    return woreda ? woreda.name : woredaId;
  };

  const getWoredaFromHospital = (user: any) => {
    if (!user.hospitalId) return '-';
    
    const hospital = hospitals.find(h => h._id === user.hospitalId);
    if (hospital && hospital.woredaId) {
      const woreda = woredas.find(w => w._id === hospital.woredaId._id);
      if (woreda) {
        return `${woreda.name} (${woreda.region})`;
      }
    }
    
    return '-';
  };

  // Check if current user can edit/delete a specific user
  const canEditUser = (targetUser: User) => {
    if (!user) return false;
    
    // Debug logging for MOTHER role
    if (targetUser.role === 'MOTHER') {
      console.log('DEBUG MOTHER user:', targetUser);
      console.log('DEBUG MOTHER fields:', Object.keys(targetUser));
    }
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return true; // Super Admin can edit anyone
      
      case 'SYSTEM_ADMIN':
        // System Admin can edit all users in their assigned region
        if (!user.assignedRegion) return false;
        
        // Check if target user is in System Admin's region
        const isInRegion = targetUser.assignedRegion === user.assignedRegion;
        
        // Check if target user has woreda in System Admin's region
        const hasWoredaInRegion = targetUser.woredaId && 
          woredas.some(w => w._id === targetUser.woredaId && w.region === user.assignedRegion);
        
        // Check if target user has hospital in System Admin's region
        const hasHospitalInRegion = targetUser.hospitalId && 
          hospitals.some(h => h._id === targetUser.hospitalId && 
            h.woredaId && woredas.some(w => w._id === h.woredaId._id && w.region === user.assignedRegion));
        
        return isInRegion || hasWoredaInRegion || hasHospitalInRegion;
      
      case 'WOREDA_ADMIN':
        // Can edit users in their woreda
        return (targetUser.woredaId && typeof targetUser.woredaId === 'string' && targetUser.woredaId === user.woredaId) ||
               (targetUser.hospitalId && typeof targetUser.hospitalId === 'string' && 
                hospitals.some(h => h._id === targetUser.hospitalId && h.woredaId === user.woredaId));
      
      case 'HOSPITAL_ADMIN':
        // Can edit users in their hospital
        return (targetUser.hospitalId && typeof targetUser.hospitalId === 'string' && targetUser.hospitalId === user.hospitalId);
      
      case 'HEALTH_CENTER_ADMIN':
        // Can edit users in their health center
        return (targetUser.hospitalId && typeof targetUser.hospitalId === 'string' && targetUser.hospitalId === user.hospitalId);
      
      default:
        // Other roles can only edit themselves
        return targetUser._id === user.id;
    }
  };

  const canDeleteUser = (targetUser: User) => {
    // Same logic as edit, but can't delete themselves
    if (!user) return false;
    return canEditUser(targetUser) && targetUser._id !== user.id;
  };

  // Get filtered users based on current user's role
  const filteredUsers = getFilteredUsers().filter((userItem: User) => {
    const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || userItem.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'SYSTEM_ADMIN': return 'bg-blue-100 text-blue-800';
      case 'WOREDA_ADMIN': return 'bg-green-100 text-green-800';
      case 'HOSPITAL_ADMIN': return 'bg-yellow-100 text-yellow-800';
      case 'DOCTOR': return 'bg-red-100 text-red-800';
      case 'NURSE': return 'bg-pink-100 text-pink-800';
      case 'MIDWIFE': return 'bg-indigo-100 text-indigo-800';
      case 'DISPATCHER': return 'bg-orange-100 text-orange-800';
      case 'EMERGENCY_ADMIN': return 'bg-red-100 text-red-800';
      case 'LIAISON_OFFICER': return 'bg-cyan-100 text-cyan-800';
      case 'HOSPITAL_APPROVER': return 'bg-teal-100 text-teal-800';
      case 'GATEKEEPER': return 'bg-amber-100 text-amber-800';
      case 'SPECIALIST': return 'bg-violet-100 text-violet-800';
      case 'MOTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Management</h2>
          <button
            onClick={() => setShowAddUser(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Add New User
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="WOREDA_ADMIN">Woreda Admin</option>
            <option value="HOSPITAL_ADMIN">Hospital Admin</option>
            <option value="HEALTH_CENTER_ADMIN">Health Center Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="MIDWIFE">Midwife</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="EMERGENCY_ADMIN">Emergency Admin</option>
            <option value="LIAISON_OFFICER">Liaison Officer</option>
            <option value="HOSPITAL_APPROVER">Hospital Approver</option>
            <option value="GATEKEEPER">Gatekeeper</option>
            <option value="SPECIALIST">Specialist</option>
            <option value="MOTHER">Mother</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Woreda/Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getHospitalName(user.hospitalId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.assignedRegion || getWoredaFromHospital(user) || getWoredaName(user.woredaId) || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.phoneNumber || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {canEditUser(user) && (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                  )}
                  {canDeleteUser(user) && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                  {!canEditUser(user) && !canDeleteUser(user) && (
                    <span className="text-gray-400">No permissions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {showAddUser && (
        <AddUserForm
          onClose={() => {
            setShowAddUser(false);
            setEditingUser(null);
          }}
          onSuccess={handleAddUserSuccess}
          userToEdit={editingUser || undefined}
        />
      )}
    </div>
  );
}
