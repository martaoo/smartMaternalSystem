'use client';

export const API_BASE = 'http://localhost:3001/api';

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
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (data: any) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Users
  getUsers: () =>
    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  getUser: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  createUser: (data: any) =>
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateUser: (id: string, data: any) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteUser: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  // Hospitals
  getHospitals: () =>
    fetch(`${API_BASE}/hospitals`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  createHospital: (data: any) =>
    fetch(`${API_BASE}/hospitals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Woredas
  getWoredas: () =>
    fetch(`${API_BASE}/woredas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(handleResponse),

  createWoreda: (data: any) =>
    fetch(`${API_BASE}/woredas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(handleResponse),
};