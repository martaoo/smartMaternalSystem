import { API_BASE, handleResponse } from './api';

// Mother Management APIs
export const mothersApi = {
  // Create mother
  create: (motherData: any) =>
    fetch(`${API_BASE}/mothers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(motherData),
    }).then(handleResponse),

  // Get all mothers
  getAll: () =>
    fetch(`${API_BASE}/mothers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get mother by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Update mother
  update: (id: string, motherData: any) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(motherData),
    }).then(handleResponse),

  // Delete mother
  delete: (id: string) =>
    fetch(`${API_BASE}/mothers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Search mothers
  search: (query: string) =>
    fetch(`${API_BASE}/mothers/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get mothers by health worker
  getByHealthWorker: (healthWorkerId: string) =>
    fetch(`${API_BASE}/mothers/health-worker/${healthWorkerId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),
};

// Pregnancy Tracking APIs
export const pregnancyApi = {
  // Create pregnancy visit
  create: (pregnancyData: any) =>
    fetch(`${API_BASE}/pregnancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(pregnancyData),
    }).then(handleResponse),

  // Get all pregnancy records
  getAll: () =>
    fetch(`${API_BASE}/pregnancy`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get pregnancy records by mother
  getByMotherId: (motherId: string) =>
    fetch(`${API_BASE}/pregnancy/mother/${motherId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get pregnancy by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Update pregnancy record
  update: (id: string, pregnancyData: any) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(pregnancyData),
    }).then(handleResponse),

  // Delete pregnancy record
  delete: (id: string) =>
    fetch(`${API_BASE}/pregnancy/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get pregnancy statistics
  getStats: () =>
    fetch(`${API_BASE}/pregnancy/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get high risk pregnancies
  getHighRisk: () =>
    fetch(`${API_BASE}/pregnancy/high-risk`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get upcoming visits
  getUpcomingVisits: () =>
    fetch(`${API_BASE}/pregnancy/upcoming-visits`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),
};

// Child Monitoring APIs
export const childrenApi = {
  // Create child
  create: (childData: any) =>
    fetch(`${API_BASE}/children`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(childData),
    }).then(handleResponse),

  // Get all children
  getAll: () =>
    fetch(`${API_BASE}/children`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get child by ID
  getById: (id: string) =>
    fetch(`${API_BASE}/children/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Update child
  update: (id: string, childData: any) =>
    fetch(`${API_BASE}/children/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(childData),
    }).then(handleResponse),

  // Delete child
  delete: (id: string) =>
    fetch(`${API_BASE}/children/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Verify child registration
  verify: (id: string) =>
    fetch(`${API_BASE}/children/${id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Search children
  search: (query: string) =>
    fetch(`${API_BASE}/children/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get children by mother
  getByMotherId: (motherId: string) =>
    fetch(`${API_BASE}/children/mother/${motherId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get children statistics
  getStats: () =>
    fetch(`${API_BASE}/children/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Get children needing follow-up
  getFollowUpNeeded: () =>
    fetch(`${API_BASE}/children/follow-up-needed`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Growth Records
  createGrowthRecord: (childId: string, growthData: any) =>
    fetch(`${API_BASE}/children/${childId}/growth-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(growthData),
    }).then(handleResponse),

  getGrowthRecords: (childId: string) =>
    fetch(`${API_BASE}/children/${childId}/growth-records`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  getLatestGrowthRecord: (childId: string) =>
    fetch(`${API_BASE}/children/${childId}/growth-records/latest`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  updateGrowthRecord: (id: string, growthData: any) =>
    fetch(`${API_BASE}/children/growth-records/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(growthData),
    }).then(handleResponse),

  deleteGrowthRecord: (id: string) =>
    fetch(`${API_BASE}/children/growth-records/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),
};

// Vaccination APIs
export const vaccinationsApi = {
  // Vaccines
  getAllVaccines: () =>
    fetch(`${API_BASE}/vaccinations/vaccines`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  getVaccineById: (id: string) =>
    fetch(`${API_BASE}/vaccinations/vaccines/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Vaccination Records
  createVaccinationRecord: (recordData: any) =>
    fetch(`${API_BASE}/vaccinations/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(recordData),
    }).then(handleResponse),

  getVaccinationRecordsByChild: (childId: string) =>
    fetch(`${API_BASE}/vaccinations/records/child/${childId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  getVaccinationRecordsByStatus: (status: string) =>
    fetch(`${API_BASE}/vaccinations/records/status/${status}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  getUpcomingVaccinations: (days: number = 30) =>
    fetch(`${API_BASE}/vaccinations/records/upcoming?days=${days}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  getOverdueVaccinations: () =>
    fetch(`${API_BASE}/vaccinations/records/overdue`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Schedule Management
  generateVaccinationSchedule: (childId: string) =>
    fetch(`${API_BASE}/vaccinations/schedule/${childId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(handleResponse),

  // Action endpoints
  markVaccinationAdministered: (id: string, administrationData: any) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/administer`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(administrationData),
    }).then(handleResponse),

  markVaccinationMissed: (id: string, missReason: string) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/miss`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ missReason }),
    }).then(handleResponse),

  deferVaccination: (id: string, deferReason: string, newScheduledDate: string) =>
    fetch(`${API_BASE}/vaccinations/records/${id}/defer`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ deferReason, newScheduledDate }),
    }).then(handleResponse),

  // Statistics
  getVaccinationStats: () =>
    fetch(`${API_BASE}/vaccinations/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),
};
