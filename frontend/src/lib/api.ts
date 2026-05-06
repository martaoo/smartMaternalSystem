'use client';

export const API_BASE = '/api/proxy';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
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
    fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (data: any) =>
    fetch(`/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Users
  getUsers: () =>
    fetch(`${API_BASE}/users`).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/users/me`).then(handleResponse),

  updateMe: (data: { name?: string; email?: string; phoneNumber?: string; currentPassword?: string; newPassword?: string }) =>
    fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getUser: (id: string) =>
    fetch(`${API_BASE}/users/${id}`).then(handleResponse),

  createUser: (data: any) =>
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateUser: (id: string, data: any) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteUser: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),

  // Hospitals
  getHospitals: () =>
    fetch(`${API_BASE}/hospitals`).then(handleResponse),

  getHospital: (id: string) =>
    fetch(`${API_BASE}/hospitals/${id}`).then(handleResponse),

  createHospital: (data: any) =>
    fetch(`${API_BASE}/hospitals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateHospital: (id: string, data: any) =>
    fetch(`${API_BASE}/hospitals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteHospital: (id: string) =>
    fetch(`${API_BASE}/hospitals/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),

  // Woredas
  getWoredas: () =>
    fetch(`${API_BASE}/woredas`).then(handleResponse),

  getWoreda: (id: string) =>
    fetch(`${API_BASE}/woredas/${id}`).then(handleResponse),

  createWoreda: (data: any) =>
    fetch(`${API_BASE}/woredas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateWoreda: (id: string, data: any) =>
    fetch(`${API_BASE}/woredas/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteWoreda: (id: string) =>
    fetch(`${API_BASE}/woredas/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};