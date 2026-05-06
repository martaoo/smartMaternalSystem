// Maternal Referral System Types and Constants

export enum ReferralStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING', 
  ACCEPTED = 'ACCEPTED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  NO_SHOW = 'NO_SHOW',
  EXPIRED = 'EXPIRED'
}

export enum UrgencyLevel {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY'
}

export enum RiskLevel {
  LOW = 'LOW',
  HIGH = 'HIGH'
}

export interface MaternalReferral {
  _id: string;
  referralCode: string;
  motherId: string;
  mother?: {
    _id: string;
    name: string;
    phone: string;
    age: number;
    address?: string;
  };
  fromHospital: string;
  toHospital: string;
  fromHospitalName?: string;
  toHospitalName?: string;
  status: ReferralStatus;
  urgency: UrgencyLevel;
  riskLevel: RiskLevel;
  
  // Maternal-specific fields
  gestationalAge?: number;
  expectedDeliveryDate?: string;
  gravida?: number;
  para?: number;
  clinicalCondition?: string;
  
  // Standard referral fields
  reasonForReferral: string;
  clinicalNotes?: string;
  doctorName?: string;
  
  // Lifecycle tracking
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  
  // Activity log
  activityLog: ReferralActivity[];
  
  // Transport tracking for emergency cases
  transportInfo?: {
    vehicleType?: string;
    driverName?: string;
    driverPhone?: string;
    estimatedArrival?: string;
    actualArrival?: string;
  };
}

export interface ReferralActivity {
  status: ReferralStatus;
  actor: string | null;
  actorName?: string;
  timestamp: string;
  note?: string;
}

export interface CreateMaternalReferralRequest {
  motherId: string;
  fromHospital: string;
  toHospital: string;
  urgency: UrgencyLevel;
  riskLevel: RiskLevel;
  gestationalAge?: number;
  expectedDeliveryDate?: string;
  gravida?: number;
  para?: number;
  clinicalCondition?: string;
  reasonForReferral: string;
  clinicalNotes: string;
  doctorName?: string;
}

export interface ReferralAction {
  status: ReferralStatus;
  label: string;
  icon?: string;
  color: string;
  allowedRoles: string[];
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Status-based action mapping
export const REFERRAL_ACTIONS: Record<ReferralStatus, ReferralAction[]> = {
  [ReferralStatus.CREATED]: [
    {
      status: ReferralStatus.PENDING,
      label: 'Send Referral',
      icon: 'send',
      color: 'blue',
      allowedRoles: ['HEALTH_CENTER_ADMIN', 'DOCTOR', 'NURSE', 'MIDWIFE'],
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to send this referral?'
    }
  ],
  [ReferralStatus.PENDING]: [
    {
      status: ReferralStatus.ACCEPTED,
      label: 'Accept Referral',
      icon: 'check',
      color: 'green',
      allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR'],
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to accept this referral?'
    },
    {
      status: ReferralStatus.REJECTED,
      label: 'Reject Referral',
      icon: 'x',
      color: 'red',
      allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR'],
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to reject this referral?'
    }
  ],
  [ReferralStatus.ACCEPTED]: [
    {
      status: ReferralStatus.IN_TRANSIT,
      label: 'Start Transport',
      icon: 'truck',
      color: 'orange',
      allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'],
      requiresConfirmation: true,
      confirmationMessage: 'Start transport for this referral?'
    }
  ],
  [ReferralStatus.IN_TRANSIT]: [
    {
      status: ReferralStatus.ARRIVED,
      label: 'Mark Arrived',
      icon: 'map-pin',
      color: 'purple',
      allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'],
      requiresConfirmation: true,
      confirmationMessage: 'Mark patient as arrived at hospital?'
    }
  ],
  [ReferralStatus.ARRIVED]: [
    {
      status: ReferralStatus.IN_PROGRESS,
      label: 'Start Treatment',
      icon: 'play',
      color: 'indigo',
      allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'],
      requiresConfirmation: true,
      confirmationMessage: 'Start treatment for this patient?'
    }
  ],
  [ReferralStatus.IN_PROGRESS]: [
    {
      status: ReferralStatus.COMPLETED,
      label: 'Complete Referral',
      icon: 'check-circle',
      color: 'green',
      allowedRoles: ['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'],
      requiresConfirmation: true,
      confirmationMessage: 'Mark this referral as completed?'
    }
  ],
  [ReferralStatus.COMPLETED]: [],
  [ReferralStatus.REJECTED]: [],
  [ReferralStatus.NO_SHOW]: [],
  [ReferralStatus.EXPIRED]: []
};

// Status display configuration
export const STATUS_CONFIG: Record<ReferralStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  [ReferralStatus.CREATED]: {
    label: 'Created',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'file-text',
    description: 'Referral created, ready to send'
  },
  [ReferralStatus.PENDING]: {
    label: 'Pending',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'clock',
    description: 'Waiting for hospital response'
  },
  [ReferralStatus.ACCEPTED]: {
    label: 'Accepted',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'check',
    description: 'Referral accepted by receiving hospital'
  },
  [ReferralStatus.IN_TRANSIT]: {
    label: 'In Transit',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'truck',
    description: 'Patient being transported'
  },
  [ReferralStatus.ARRIVED]: {
    label: 'Arrived',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'map-pin',
    description: 'Patient has arrived at hospital'
  },
  [ReferralStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: 'play',
    description: 'Treatment in progress'
  },
  [ReferralStatus.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'check-circle',
    description: 'Referral completed successfully'
  },
  [ReferralStatus.REJECTED]: {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'x-circle',
    description: 'Referral rejected by hospital'
  },
  [ReferralStatus.NO_SHOW]: {
    label: 'No Show',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'user-x',
    description: 'Patient did not arrive'
  },
  [ReferralStatus.EXPIRED]: {
    label: 'Expired',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'alert-circle',
    description: 'Referral expired'
  }
};

// Urgency level configuration
export const URGENCY_CONFIG: Record<UrgencyLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  priority: number;
}> = {
  [UrgencyLevel.ROUTINE]: {
    label: 'Routine',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'calendar',
    priority: 1
  },
  [UrgencyLevel.URGENT]: {
    label: 'Urgent',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'alert-triangle',
    priority: 2
  },
  [UrgencyLevel.EMERGENCY]: {
    label: 'Emergency',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'alert-circle',
    priority: 3
  }
};

// Risk level configuration
export const RISK_CONFIG: Record<RiskLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  [RiskLevel.LOW]: {
    label: 'Low Risk',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'shield'
  },
  [RiskLevel.HIGH]: {
    label: 'High Risk',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'alert-triangle'
  }
};
