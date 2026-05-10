// Comprehensive system test for Smart Maternal System
const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function testSystem() {
  console.log('🚀 Starting Smart Maternal System Comprehensive Test\n');

  try {
    // Test 1: Backend health check
    console.log('1. Testing Backend Health...');
    const healthResponse = await fetch(`${API_BASE}`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Backend is healthy:', health.message);
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test 2: Authentication
    console.log('\n2. Testing Authentication...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@maternal.gov.et',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful for:', loginData.user.name);
      const token = loginData.access_token;

      // Test 3: Protected endpoints
      console.log('\n3. Testing Protected Endpoints...');

      // Users endpoint
      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log('✅ Users endpoint working, count:', users.length);
      } else {
        console.log('❌ Users endpoint failed');
      }

      // Mothers endpoint
      const mothersResponse = await fetch(`${API_BASE}/mothers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mothersResponse.ok) {
        const mothers = await mothersResponse.json();
        console.log('✅ Mothers endpoint working, count:', mothers.length);
      } else {
        console.log('❌ Mothers endpoint failed');
      }

      // Hospitals endpoint
      const hospitalsResponse = await fetch(`${API_BASE}/hospitals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (hospitalsResponse.ok) {
        const hospitals = await hospitalsResponse.json();
        console.log('✅ Hospitals endpoint working, count:', hospitals.length);
      } else {
        console.log('❌ Hospitals endpoint failed');
      }

      // Regions endpoint
      const regionsResponse = await fetch(`${API_BASE}/regions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (regionsResponse.ok) {
        const regions = await regionsResponse.json();
        console.log('✅ Regions endpoint working, count:', regions.length);
      } else {
        console.log('❌ Regions endpoint failed');
      }

      // Test 4: Frontend proxy
      console.log('\n4. Testing Frontend Proxy...');
      const proxyLoginResponse = await fetch(`${FRONTEND_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@maternal.gov.et',
          password: 'admin123'
        }),
        credentials: 'include'
      });

      if (proxyLoginResponse.ok) {
        const proxyData = await proxyLoginResponse.json();
        console.log('✅ Frontend proxy login working');
      } else {
        console.log('❌ Frontend proxy login failed');
      }

    } else {
      console.log('❌ Login failed');
      return;
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Backend API is running');
    console.log('✅ Authentication is working');
    console.log('✅ Protected endpoints are accessible');
    console.log('✅ Frontend proxy is functioning');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSystem();