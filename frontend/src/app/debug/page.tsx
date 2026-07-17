// app/debug/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Check what's in localStorage
    const authToken = localStorage.getItem('auth_token');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setToken(authToken || token);
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/proxy/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ error: String(err) });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Information</h1>
      
      <div style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0' }}>
        <h3>LocalStorage Contents:</h3>
        <pre>
          auth_token: {localStorage.getItem('auth_token') ? '✓ Present' : '✗ Missing'}
          {'\n'}
          token: {localStorage.getItem('token') ? '✓ Present' : '✗ Missing'}
          {'\n'}
          user: {localStorage.getItem('user') ? '✓ Present' : '✗ Missing'}
        </pre>
      </div>

      <div style={{ margin: '10px 0', padding: '10px', background: '#e0f0e0' }}>
        <h3>Token Value:</h3>
        <pre>{token ? token.substring(0, 100) + '...' : 'No token found'}</pre>
      </div>

      <div style={{ margin: '10px 0', padding: '10px', background: '#e0e0f0' }}>
        <h3>User Data:</h3>
        <pre>{user ? JSON.stringify(user, null, 2) : 'No user data'}</pre>
      </div>

      <button onClick={testApiCall} style={{ padding: '10px', margin: '10px 0' }}>
        Test API Call
      </button>

      {apiResponse && (
        <div style={{ margin: '10px 0', padding: '10px', background: '#f0e0e0' }}>
          <h3>API Response:</h3>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}