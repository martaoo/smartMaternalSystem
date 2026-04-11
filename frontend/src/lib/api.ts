'use client';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(res => res.json()),

  register: (data: any) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  // Users
  getUsers: () =>
    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json()),

  getUser: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json()),

  createUser: (data: any) =>
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  updateUser: (id: string, data: any) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  deleteUser: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Hospitals
  getHospitals: () =>
    fetch(`${API_BASE}/hospitals`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json()),

  createHospital: (data: any) =>
    fetch(`${API_BASE}/hospitals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  deleteHospital: (id: string) =>
    fetch(`${API_BASE}/hospitals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json()),

  // Woredas
  getWoredas: () =>
    fetch(`${API_BASE}/woredas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json()),

  createWoreda: (data: any) =>
    fetch(`${API_BASE}/woredas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  deleteWoreda: (id: string) =>
    fetch(`${API_BASE}/woredas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json()),
};