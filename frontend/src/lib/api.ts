'use client';

export const API_BASE = '/api/proxy';

// Use API proxy for all environments to avoid CORS issues
export const BACKEND_URL = '/api/proxy';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

// Helper function to get auth token from localStorage
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem('token') || undefined;
  } catch {
    return undefined;
  }
}

// Helper function to create headers with auth
export function createAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function handleResponse(response: Response) {
  const text = await response.text();

  // Try to parse as JSON
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON — treat as plain string (strip surrounding quotes if present)
      data = text.replace(/^"|"$/g, '');
    }
  }

  if (!response.ok) {
    if (response.status === 401) throw new UnauthorizedError();
    // Extract a human-readable message from whatever the backend returned
    const message =
      (typeof data === 'object' && data !== null
        ? data?.message || data?.error
        : typeof data === 'string' && data.length < 200
          ? data
          : null) ||
      response.statusText ||
      'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (data: any) =>
    fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Users
  getUsers: () =>
    fetch(`${BACKEND_URL}/users`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BACKEND_URL}/users/me`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  updateMe: (data: { name?: string; email?: string; phoneNumber?: string; currentPassword?: string; newPassword?: string }) =>
    fetch(`${BACKEND_URL}/users/me`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getUser: (id: string) =>
    fetch(`${BACKEND_URL}/users/${id}`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  createUser: (data: any) =>
    fetch(`${BACKEND_URL}/users`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateUser: (id: string, data: any) =>
    fetch(`${BACKEND_URL}/users/${id}`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteUser: (id: string) =>
    fetch(`${BACKEND_URL}/users/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    }).then(handleResponse),

  // Hospitals
  getHospitals: () =>
    fetch(`${BACKEND_URL}/hospitals`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  getHospital: (id: string) =>
    fetch(`${BACKEND_URL}/hospitals/${id}`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  createHospital: (data: any) =>
    fetch(`${BACKEND_URL}/hospitals`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateHospital: (id: string, data: any) =>
    fetch(`${BACKEND_URL}/hospitals/${id}`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteHospital: (id: string) =>
    fetch(`${BACKEND_URL}/hospitals/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    }).then(handleResponse),

  updateHospital: (id: string, data: any) =>
    fetch(`${API_BASE}/hospitals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Woredas
  getWoredas: () =>
    fetch(`${BACKEND_URL}/woredas`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  getWoreda: (id: string) =>
    fetch(`${BACKEND_URL}/woredas/${id}`, {
      headers: createAuthHeaders(),
    }).then(handleResponse),

  createWoreda: (data: any) =>
    fetch(`${BACKEND_URL}/woredas`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateWoreda: (id: string, data: any) =>
    fetch(`${BACKEND_URL}/woredas/${id}`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteWoreda: (id: string) =>
    fetch(`${BACKEND_URL}/woredas/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    }).then(handleResponse),

  updateWoreda: (id: string, data: any) =>
    fetch(`${API_BASE}/woredas/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Regions
  getRegions: () =>
    fetch(`${API_BASE}/regions`).then(handleResponse),

  createRegion: (data: any) =>
    fetch(`${API_BASE}/regions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateRegion: (id: string, data: any) =>
    fetch(`${API_BASE}/regions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteRegion: (id: string) =>
    fetch(`${API_BASE}/regions/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};