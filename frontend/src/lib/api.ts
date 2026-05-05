'use client';

export const API_BASE = '/api/proxy';

export async function handleResponse(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
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