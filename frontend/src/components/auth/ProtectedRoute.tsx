'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      const rolesArray = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);
      
      if (rolesArray.length > 0 && !rolesArray.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'SUPER_ADMIN':
            router.push('/moh-dashboard');
            break;
          case 'SYSTEM_ADMIN':
            router.push('/system-dashboard');
            break;
          case 'WOREDA_ADMIN':
            router.push('/woreda-dashboard');
            break;
          case 'HOSPITAL_ADMIN':
            router.push('/hospital-dashboard');
            break;
          case 'DOCTOR':
          case 'NURSE':
          case 'MIDWIFE':
            router.push('/clinic-dashboard');
            break;
          case 'DISPATCHER':
          case 'EMERGENCY_ADMIN':
            router.push('/dispatch-dashboard');
            break;
          case 'MOTHER':
            router.push('/mother-dashboard');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, isLoading, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const rolesArray = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);
  if (rolesArray.length > 0 && !rolesArray.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
