import { API_BASE, handleResponse } from './api';

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  let token: string | undefined;
  try {
    token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
  } catch {
    token = undefined;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Mother Management APIs
export const mothersApi = {
  // Create mother
  create: (motherData: any) =>
    fetch(`${API_BASE}/mothers`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(motherData),
    }).then(handleResponse),

  // Get all mothers
  getAll: () =>
    fetch(`${API_BASE}/mothers`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get mother by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Update mother
  update: (id: string, motherData: any) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(motherData),
    }).then(handleResponse),

  // Delete mother
  delete: (id: string) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Search mothers
  search: (query: string) =>
    fetch(`${API_BASE}/mothers/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get mothers by health worker
  getByHealthWorker: (healthWorkerId: string) =>
    fetch(`${API_BASE}/mothers/health-worker/${healthWorkerId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// Pregnancy Tracking APIs
export const pregnancyApi = {
  // Create pregnancy visit
  create: (pregnancyData: any) =>
    fetch(`${API_BASE}/pregnancy`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(pregnancyData),
    }).then(handleResponse),

  // Get all pregnancy records
  getAll: () =>
    fetch(`${API_BASE}/pregnancy`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get pregnancy records by mother
  getByMotherId: (motherId: string) =>
    fetch(`${API_BASE}/pregnancy/mother/${motherId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get pregnancy by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Update pregnancy record
  update: (id: string, pregnancyData: any) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(pregnancyData),
    }).then(handleResponse),

  // Mark visit as completed
  completeVisit: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Reschedule a visit (manual override — requires overrideReason)
  rescheduleVisit: (id: string, newDate: string, overrideReason: string) =>
    fetch(`${API_BASE}/pregnancy/${id}/reschedule`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ newDate, overrideReason }),
    }).then(handleResponse),

  // Create a manual visit (ANC, PNC, Emergency, Custom)
  createManualVisit: (data: {
    motherId: string;
    visitDate: string;
    visitType: 'ANC' | 'PNC' | 'EMERGENCY' | 'CUSTOM';
    notes?: string;
    overrideReason: string;
    retrospectiveEntry?: boolean;
    gestationalAge?: number;
    week?: number;
    riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  }) =>
    fetch(`${API_BASE}/pregnancy/manual`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Full schedule: visits + vaccines + next visit + overdue + warnings
  getFullSchedule: (motherId: string) =>
    fetch(`${API_BASE}/pregnancy/full-schedule/${motherId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // WHO ANC 8-visit grid with status
  getAncSchedule: (motherId: string) =>
    fetch(`${API_BASE}/pregnancy/anc-schedule/${motherId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Delete pregnancy record
  delete: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get pregnancy statistics
  getStats: () =>
    fetch(`${API_BASE}/pregnancy/stats`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get high risk pregnancies
  getHighRisk: () =>
    fetch(`${API_BASE}/pregnancy/high-risk`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get upcoming visits
  getUpcomingVisits: () =>
    fetch(`${API_BASE}/pregnancy/upcoming-visits`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// Child Monitoring APIs
export const childrenApi = {
  // Create child
  create: (childData: any) =>
    fetch(`${API_BASE}/children`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(childData),
    }).then(handleResponse),

  // Get all children
  getAll: () =>
    fetch(`${API_BASE}/children`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get child by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/children/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Update child
  update: (id: string, childData: any) =>
    fetch(`${API_BASE}/children/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(childData),
    }).then(handleResponse),

  // Delete child
  delete: (id: string) =>
    fetch(`${API_BASE}/children/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Verify child registration
  verify: (id: string) =>
    fetch(`${API_BASE}/children/${id}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Issue birth certificate (woreda admin)
  issueBirthCertificate: (id: string, data: { fatherName?: string; fatherPhone?: string; birthLocation?: string }) =>
    fetch(`${API_BASE}/children/${id}/issue-certificate`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Get children by woreda
  getByWoreda: (woredaId: string) =>
    fetch(`${API_BASE}/children/woreda/${woredaId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Search children
  search: (query: string) =>
    fetch(`${API_BASE}/children/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get children by mother
  getByMotherId: (motherId: string) =>
    fetch(`${API_BASE}/children/mother/${motherId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get children statistics
  getStats: () =>
    fetch(`${API_BASE}/children/stats`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get children needing follow-up
  getFollowUpNeeded: () =>
    fetch(`${API_BASE}/children/follow-up-needed`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Growth Records
  createGrowthRecord: (childId: string, growthData: any) =>
    fetch(`${API_BASE}/children/${childId}/growth-records`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(growthData),
    }).then(handleResponse),

  getGrowthRecords: (childId: string) =>
    fetch(`${API_BASE}/children/${childId}/growth-records`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getLatestGrowthRecord: (childId: string) =>
    fetch(`${API_BASE}/children/${childId}/growth-records/latest`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateGrowthRecord: (id: string, growthData: any) =>
    fetch(`${API_BASE}/children/growth-records/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(growthData),
    }).then(handleResponse),

  deleteGrowthRecord: (id: string) =>
    fetch(`${API_BASE}/children/growth-records/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// Vaccination APIs
export const vaccinationsApi = {
  // Vaccines
  getAllVaccines: () =>
    fetch(`${API_BASE}/vaccinations/vaccines`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getVaccineById: (id: string) =>
    fetch(`${API_BASE}/vaccinations/vaccines/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Vaccination Records
  createVaccinationRecord: (recordData: any) =>
    fetch(`${API_BASE}/vaccinations/records`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(recordData),
    }).then(handleResponse),

  getVaccinationRecordsByChild: (childId: string) =>
    fetch(`${API_BASE}/vaccinations/records/child/${childId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getVaccinationRecordsByStatus: (status: string) =>
    fetch(`${API_BASE}/vaccinations/records/status/${status}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getUpcomingVaccinations: (days: number = 30) =>
    fetch(`${API_BASE}/vaccinations/records/upcoming?days=${days}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getOverdueVaccinations: () =>
    fetch(`${API_BASE}/vaccinations/records/overdue`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Schedule Management
  generateVaccinationSchedule: (childId: string) =>
    fetch(`${API_BASE}/vaccinations/schedule/${childId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Action endpoints
  markVaccinationAdministered: (id: string, administrationData: any) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/administer`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(administrationData),
    }).then(handleResponse),

  markVaccinationMissed: (id: string, missReason: string) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/miss`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ missReason }),
    }).then(handleResponse),

  deferVaccination: (id: string, deferReason: string, newScheduledDate: string) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/defer`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ deferReason, newScheduledDate }),
    }).then(handleResponse),

  updateVaccinationRecord: (id: string, updateData: any) =>
    fetch(`${API_BASE}/vaccinations/records/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updateData),
    }).then(handleResponse),

  // Statistics
  getVaccinationStats: () =>
    fetch(`${API_BASE}/vaccinations/stats`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// Hospitals API
export const hospitalsApi = {
  // Get all hospitals
  getAll: () =>
    fetch(`${API_BASE}/hospitals`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// Referrals API
export const referralsApi = {
  // Create referral
  create: (data: any) =>
    fetch(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Update referral draft
  update: (id: string, data: any) =>
    fetch(`${API_BASE}/referrals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Send referral (liaison)
  send: (id: string, targetHospitalId: string, liaisonNote?: string) =>
    fetch(`${API_BASE}/referrals/${id}/send`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ targetHospitalId, liaisonNote }),
    }).then(handleResponse),

  // Respond to referral
  respond: (id: string, data: any) =>
    fetch(`${API_BASE}/referrals/${id}/respond`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Gate check-in
  checkIn: (data: any) =>
    fetch(`${API_BASE}/referrals/gate-check-in`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Get referral by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/referrals/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Update referral status
  updateStatus: (id: string, status: string, note?: string) =>
    fetch(`${API_BASE}/referrals/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, note }),
    }).then(handleResponse),

  // Unlock clinical data
  unlock: (data: any) =>
    fetch(`${API_BASE}/referrals/unlock`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Submit feedback
  complete: (id: string, data: any) =>
    fetch(`${API_BASE}/referrals/${id}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Get referrals with type filter
  getAll: (type: 'inbound' | 'outbound' = 'outbound') =>
    fetch(`${API_BASE}/referrals?type=${type}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get liaison outbox
  getOutbox: () =>
    fetch(`${API_BASE}/referrals/liaison/outbox`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get specialist queue
  getQueue: () =>
    fetch(`${API_BASE}/referrals/specialist/queue`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Get MOH/System referral stats
  getAdminStats: () =>
    fetch(`${API_BASE}/referrals/admin/stats`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Delete referral
  delete: (id: string) =>
    fetch(`${API_BASE}/referrals/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};
