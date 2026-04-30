import { API_BASE, handleResponse } from './api';

// Mother Management APIs
export const mothersApi = {
  // Create mother
  create: (motherData: any) =>
    fetch(`${API_BASE}/mothers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(motherData),
    }).then(handleResponse),

  // Get all mothers
  getAll: () =>
    fetch(`${API_BASE}/mothers`).then(handleResponse),

  // Get mother by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/mothers/${id}`).then(handleResponse),

  // Update mother
  update: (id: string, motherData: any) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(motherData),
    }).then(handleResponse),

  // Delete mother
  delete: (id: string) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),

  // Search mothers
  search: (query: string) =>
    fetch(`${API_BASE}/mothers/search?q=${encodeURIComponent(query)}`).then(handleResponse),

  // Get mothers by health worker
  getByHealthWorker: (healthWorkerId: string) =>
    fetch(`${API_BASE}/mothers/health-worker/${healthWorkerId}`).then(handleResponse),
};

// Pregnancy Tracking APIs
export const pregnancyApi = {
  // Create pregnancy visit
  create: (pregnancyData: any) =>
    fetch(`${API_BASE}/pregnancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(pregnancyData),
    }).then(handleResponse),

  // Get all pregnancy records
  getAll: () =>
    fetch(`${API_BASE}/pregnancy`).then(handleResponse),

  // Get pregnancy records by mother
  getByMotherId: (motherId: string) =>
    fetch(`${API_BASE}/pregnancy/mother/${motherId}`).then(handleResponse),

  // Get pregnancy by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}`).then(handleResponse),

  // Update pregnancy record
  update: (id: string, pregnancyData: any) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(pregnancyData),
    }).then(handleResponse),

  // Delete pregnancy record
  delete: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),

  // Get pregnancy statistics
  getStats: () =>
    fetch(`${API_BASE}/pregnancy/stats`).then(handleResponse),

  // Get high risk pregnancies
  getHighRisk: () =>
    fetch(`${API_BASE}/pregnancy/high-risk`).then(handleResponse),

  // Get upcoming visits
  getUpcomingVisits: () =>
    fetch(`${API_BASE}/pregnancy/upcoming-visits`).then(handleResponse),
};

// Child Monitoring APIs
export const childrenApi = {
  // Create child
  create: (childData: any) =>
    fetch(`${API_BASE}/children`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(childData),
    }).then(handleResponse),

  // Get all children
  getAll: () =>
    fetch(`${API_BASE}/children`).then(handleResponse),

  // Get child by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/children/${id}`).then(handleResponse),

  // Update child
  update: (id: string, childData: any) =>
    fetch(`${API_BASE}/children/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(childData),
    }).then(handleResponse),

  // Delete child
  delete: (id: string) =>
    fetch(`${API_BASE}/children/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),

  // Verify child registration
  verify: (id: string) =>
    fetch(`${API_BASE}/children/${id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Search children
  search: (query: string) =>
    fetch(`${API_BASE}/children/search?q=${encodeURIComponent(query)}`).then(handleResponse),

  // Get children by mother
  getByMotherId: (motherId: string) =>
    fetch(`${API_BASE}/children/mother/${motherId}`).then(handleResponse),

  // Get children statistics
  getStats: () =>
    fetch(`${API_BASE}/children/stats`).then(handleResponse),

  // Get children needing follow-up
  getFollowUpNeeded: () =>
    fetch(`${API_BASE}/children/follow-up-needed`).then(handleResponse),

  // Growth Records
  createGrowthRecord: (childId: string, growthData: any) =>
    fetch(`${API_BASE}/children/${childId}/growth-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(growthData),
    }).then(handleResponse),

  getGrowthRecords: (childId: string) =>
    fetch(`${API_BASE}/children/${childId}/growth-records`).then(handleResponse),

  getLatestGrowthRecord: (childId: string) =>
    fetch(`${API_BASE}/children/${childId}/growth-records/latest`).then(handleResponse),

  updateGrowthRecord: (id: string, growthData: any) =>
    fetch(`${API_BASE}/children/growth-records/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(growthData),
    }).then(handleResponse),

  deleteGrowthRecord: (id: string) =>
    fetch(`${API_BASE}/children/growth-records/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};

// Vaccination APIs
export const vaccinationsApi = {
  // Vaccines
  getAllVaccines: () =>
    fetch(`${API_BASE}/vaccinations/vaccines`).then(handleResponse),

  getVaccineById: (id: string) =>
    fetch(`${API_BASE}/vaccinations/vaccines/${id}`).then(handleResponse),

  // Vaccination Records
  createVaccinationRecord: (recordData: any) =>
    fetch(`${API_BASE}/vaccinations/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    }).then(handleResponse),

  getVaccinationRecordsByChild: (childId: string) =>
    fetch(`${API_BASE}/vaccinations/records/child/${childId}`).then(handleResponse),

  getVaccinationRecordsByStatus: (status: string) =>
    fetch(`${API_BASE}/vaccinations/records/status/${status}`).then(handleResponse),

  getUpcomingVaccinations: (days: number = 30) =>
    fetch(`${API_BASE}/vaccinations/records/upcoming?days=${days}`).then(handleResponse),

  getOverdueVaccinations: () =>
    fetch(`${API_BASE}/vaccinations/records/overdue`).then(handleResponse),

  // Schedule Management
  generateVaccinationSchedule: (childId: string) =>
    fetch(`${API_BASE}/vaccinations/schedule/${childId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(childId),
    }).then(handleResponse),

  // Action endpoints
  markVaccinationAdministered: (id: string, administrationData: any) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/administer`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(administrationData),
    }).then(handleResponse),

  markVaccinationMissed: (id: string, missReason: string) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/miss`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ missReason }),
    }).then(handleResponse),

  deferVaccination: (id: string, deferReason: string, newScheduledDate: string) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/defer`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deferReason, newScheduledDate }),
    }).then(handleResponse),

  // Statistics
  getVaccinationStats: () =>
    fetch(`${API_BASE}/vaccinations/stats`).then(handleResponse),
};

// Hospitals API
export const hospitalsApi = {
  // Get all hospitals
  getAll: () =>
    fetch(`${API_BASE}/hospitals`).then(handleResponse),
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

  // Send referral (liaison)
  send: (id: string, targetHospitalId: string) =>
    fetch(`${API_BASE}/referrals/${id}/send`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify({ targetHospitalId }),
    }).then(handleResponse),

  // Respond to referral
  respond: (id: string, data: any) =>
    fetch(`${API_BASE}/referrals/${id}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Gate check-in
  checkIn: (data: any) =>
    fetch(`${API_BASE}/referrals/gate-check-in`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Unlock clinical data
  unlock: (data: any) =>
    fetch(`${API_BASE}/referrals/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Submit feedback
  complete: (id: string, data: any) =>
    fetch(`${API_BASE}/referrals/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Get referrals
  getAll: (type: 'inbound' | 'outbound' = 'outbound') =>
    fetch(`${API_BASE}/referrals?type=${type}`).then(handleResponse),

  // Get liaison outbox
  getOutbox: () =>
    fetch(`${API_BASE}/referrals/liaison/outbox`).then(handleResponse),

  // Get specialist queue
  getQueue: () =>
    fetch(`${API_BASE}/referrals/specialist/queue`).then(handleResponse),

  // Get single referral
  getById: (id: string) =>
    fetch(`${API_BASE}/referrals/${id}`).then(handleResponse),

  // Get MOH/System referral stats
  getAdminStats: () =>
    fetch(`${API_BASE}/referrals/admin/stats`).then(handleResponse),
};
