export type UserRole =
  | 'SUPER_ADMIN'
  | 'MOH_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'WOREDA_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'HOSPITAL_APPROVER'
  | 'DOCTOR'
  | 'NURSE'
  | 'MIDWIFE'
  | 'LIAISON_OFFICER'
  | 'SPECIALIST'
  | 'GATEKEEPER'
  | 'DISPATCHER'
  | 'EMERGENCY_ADMIN'
  | 'MOTHER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  woredaId?: string;
  assignedRegion?: string;
  department?: string;
  phoneNumber?: string;
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
  role: UserRole;
}
