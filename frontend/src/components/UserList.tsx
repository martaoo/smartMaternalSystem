'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserForm, UserForEdit } from './AddUserForm';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId?: string | { name?: string } | null;
  woredaId?: string | { name?: string } | null;
  phoneNumber?: string;
}

interface UserListProps {
  /** Show additional columns like hospital/woreda (useful for MOH view) */
  showOrgColumns?: boolean;
  /** Called when user list fails to load */
  onError?: (message: string) => void;
  /** Trigger to refresh the list */
  refreshTrigger?: number;
}

export function UserList({ showOrgColumns = true, onError }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [editingUser, setEditingUser] = useState<UserForEdit | null>(null);
  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.getUsers();
      if (Array.isArray(result)) {
        setUsers(result);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      const message = err?.message || 'Unable to load users';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const roles = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => set.add(u.role));
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesName = filterName
        ? user.name?.toLowerCase().includes(filterName.toLowerCase())
        : true;
      const matchesRole = filterRole ? user.role === filterRole : true;
      return matchesName && matchesRole;
    });
  }, [users, filterName, filterRole]);

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await api.deleteUser(userId);
      await loadUsers();
    } catch (err: any) {
      const message = err?.message || 'Unable to delete user';
      setError(message);
      onError?.(message);
    }
  };

  const resetEditing = () => setEditingUser(null);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Registered Users</h2>
          <p className="text-sm text-gray-600">View and filter users by name or role.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Search by name</label>
          <input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Search..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Filter by role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-600">Loading users...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                {showOrgColumns && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Woreda</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={showOrgColumns ? 7 : 5} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No users match the current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role.replace('_', ' ')}</td>
                    {showOrgColumns && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof user.hospitalId === 'object'
                            ? (user.hospitalId as any)?.name
                            : user.hospitalId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof user.woredaId === 'object'
                            ? (user.woredaId as any)?.name
                            : user.woredaId || '-'}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingUser(user as UserForEdit)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <AddUserForm
          onClose={resetEditing}
          onSuccess={() => {
            loadUsers();
            resetEditing();
          }}
          userToEdit={editingUser}
          allowedRoles={
            currentUser?.role === 'HOSPITAL_ADMIN'
              ? ['DOCTOR', 'NURSE', 'DISPATCHER']
              : undefined
          }
          hideHospitalSelect={currentUser?.role === 'HOSPITAL_ADMIN'}
          fixedHospitalId={
            typeof currentUser?.hospitalId === 'string'
              ? currentUser.hospitalId
              : (currentUser?.hospitalId as any)?._id
          }
        />
      )}
    </div>
  );
}
