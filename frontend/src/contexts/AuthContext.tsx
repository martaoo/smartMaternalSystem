'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';

const getDashboardForRole = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'MOH_ADMIN':
      return '/moh-dashboard';
    case 'SYSTEM_ADMIN':
      return '/system-dashboard';
    case 'HOSPITAL_ADMIN':
      return '/hospital-dashboard';
    case 'DOCTOR':
    case 'NURSE':
    case 'MIDWIFE':
      return '/healthcare-dashboard';
    case 'LIAISON_OFFICER':
      return '/liaison-dashboard';
    case 'SPECIALIST':
    case 'HOSPITAL_APPROVER':
      return '/receiving-dashboard';
    case 'GATEKEEPER':
      return '/gate-dashboard';
    case 'DISPATCHER':
      return '/dispatch-dashboard';
    case 'WOREDA_ADMIN':
      return '/woreda-dashboard';
    default:
      return '/';
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, user: null, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Ensure hospitalId and woredaId are strings
        const normalizedUser: User = {
          ...user,
          hospitalId: user.hospitalId ? String(user.hospitalId) : undefined,
          woredaId: user.woredaId ? String(user.woredaId) : undefined,
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: normalizedUser });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        hospitalId: data.user.hospitalId ? String(data.user.hospitalId) : undefined,
        woredaId: data.user.woredaId ? String(data.user.woredaId) : undefined,
      };

      // Store both user and access token from API response
      localStorage.setItem('user', JSON.stringify(user));
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Registration failed. Email might already exist.');
      }

      const data = await response.json();
      const user: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role as User['role'],
      };
      
      // Auto-login or just set user (note: in a real app, API register might return token too)
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE', payload: error instanceof Error ? error.message : 'Registration failed' });
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
