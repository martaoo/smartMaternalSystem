'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserProfilePage } from '@/components/UserProfilePage';

export default function ProfilePage() {
  const { logout } = useAuth();
  return <UserProfilePage onLogout={logout} backHref="/health-center-dashboard" />;
}
