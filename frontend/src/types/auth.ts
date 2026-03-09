export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ambulance' | 'midwife' | 'wered' | 'admin';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role: 'ambulance' | 'midwife' | 'wered';
}
