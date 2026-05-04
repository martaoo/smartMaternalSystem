'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, UnauthorizedError } from '@/lib/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  department?: string;
  licenseNumber?: string;
  hospitalId?: { _id: string; name: string; type?: string } | string | null;
  woredaId?: { _id: string; name: string } | string | null;
  assignedRegion?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditForm { name: string; email: string; phoneNumber: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

const ROLE_BADGE_COLORS: Record<string, string> = {
  MOH_ADMIN: 'bg-blue-100 text-blue-800',
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  SYSTEM_ADMIN: 'bg-blue-100 text-blue-800',
  WOREDA_ADMIN: 'bg-green-100 text-green-800',
  HOSPITAL_ADMIN: 'bg-yellow-100 text-yellow-800',
  HEALTH_CENTER_ADMIN: 'bg-teal-100 text-teal-800',
  DOCTOR: 'bg-red-100 text-red-800',
  NURSE: 'bg-pink-100 text-pink-800',
  MIDWIFE: 'bg-indigo-100 text-indigo-800',
  DISPATCHER: 'bg-orange-100 text-orange-800',
  EMERGENCY_ADMIN: 'bg-red-100 text-red-800',
  LIAISON_OFFICER: 'bg-cyan-100 text-cyan-800',
  HOSPITAL_APPROVER: 'bg-lime-100 text-lime-800',
  GATEKEEPER: 'bg-amber-100 text-amber-800',
  SPECIALIST: 'bg-violet-100 text-violet-800',
  MOTHER: 'bg-gray-100 text-gray-800',
};

function roleBadgeColor(role: string) {
  return ROLE_BADGE_COLORS[role] ?? 'bg-gray-100 text-gray-800';
}
function formatRole(role: string) { return role.replace(/_/g, ' '); }

function facilityName(hospitalId: UserProfile['hospitalId']): string {
  if (!hospitalId) return 'Not Assigned';
  if (typeof hospitalId === 'object') return hospitalId.name ?? 'Unknown';
  return hospitalId;
}
function woredaName(woredaId: UserProfile['woredaId']): string {
  if (!woredaId) return 'Not Assigned';
  if (typeof woredaId === 'object') return woredaId.name ?? 'Unknown';
  return woredaId;
}
function facilityType(hospitalId: UserProfile['hospitalId']): string | null {
  if (!hospitalId || typeof hospitalId !== 'object') return null;
  const t = String(hospitalId.type ?? '').toUpperCase().replace(/\s+/g, '_');
  if (t === 'HEALTH_CENTER') return 'Health Center';
  if (t === 'HOSPITAL') return 'Hospital';
  return null;
}

interface Props { onLogout: () => void; backHref: string; }

export function UserProfilePage({ onLogout, backHref }: Props) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', phoneNumber: '' });
  const [editLoading, setEditLoading] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const handleUnauthorized = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth');
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMe();
      const merged = {
        ...data,
        woredaId: data.woredaId ?? authUser?.woredaId ?? null,
        assignedRegion: data.assignedRegion ?? authUser?.assignedRegion ?? null,
      };
      setProfile(merged);
      setEditForm({ name: merged.name, email: merged.email, phoneNumber: merged.phoneNumber ?? '' });
    } catch (err: any) {
      if (err instanceof UnauthorizedError) { handleUnauthorized(); return; }
      setError(err.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setEditLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await api.updateMe({ name: editForm.name, email: editForm.email, phoneNumber: editForm.phoneNumber });
      setProfile((prev) => prev ? { ...prev, ...updated } : updated);
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.name = updated.name;
        parsed.email = updated.email;
        parsed.phoneNumber = updated.phoneNumber;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      if (err instanceof UnauthorizedError) { handleUnauthorized(); return; }
      setError(err.message ?? 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setError('New passwords do not match.'); return; }
    if (passwordForm.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setPasswordLoading(true);
    try {
      await api.updateMe({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setSuccess('Password changed successfully.');
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      if (err instanceof UnauthorizedError) { handleUnauthorized(); return; }
      setError(err.message ?? 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ── Error / not found state ──
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error ?? 'Profile not found'}</p>
          <button onClick={fetchProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — matches admin dashboard style */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center py-4 gap-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">{profile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={backHref} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                ← Back to Dashboard
              </Link>
              <button
                onClick={() => { onLogout(); router.push('/auth'); }}
                className="whitespace-nowrap px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — avatar card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <div className="mt-3">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${roleBadgeColor(profile.role)}`}>
                    {formatRole(profile.role)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                </div>
                {profile.department && (
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{profile.department}</p>
                  </div>
                )}
                {profile.licenseNumber && (
                  <div>
                    <p className="text-gray-500">License No.</p>
                    <p className="font-medium text-gray-900">{profile.licenseNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => { setIsEditing(true); setError(null); setSuccess(null); }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => { setIsChangingPassword(true); setError(null); setSuccess(null); }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right — detail cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Facility Assignment */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Assigned Facility</p>
                  <div className="mt-1 flex items-center gap-2">
                    {profile.hospitalId && (
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        facilityType(profile.hospitalId) === 'Health Center' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                    )}
                    <p className="font-medium text-gray-900">{facilityName(profile.hospitalId)}</p>
                  </div>
                  {facilityType(profile.hospitalId) && (
                    <p className="text-gray-500 mt-0.5">{facilityType(profile.hospitalId)}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500">Woreda</p>
                  <p className="font-medium text-gray-900 mt-1">{woredaName(profile.woredaId)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Region</p>
                  <p className="font-medium text-gray-900 mt-1">{profile.assignedRegion || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">{profile._id}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900 mt-1">{profile.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900 mt-1">{profile.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900 mt-1">{profile.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium text-gray-900 mt-1">{formatRole(profile.role)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900 mt-1">{new Date(profile.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" required value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={editForm.phoneNumber} placeholder="+251911234567"
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-60">
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" required value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" required minLength={6} value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" required minLength={6} value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-60">
                  {passwordLoading ? 'Changing…' : 'Change Password'}
                </button>
                <button type="button" onClick={() => setIsChangingPassword(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
