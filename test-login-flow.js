// Test login flow
const backendUrl = 'http://localhost:3001/api';
const frontendUrl = 'http://localhost:3000';
let authCookie = null;  // Store cookie for subsequent requests

async function testBackendLogin() {
  console.log('\n=== Testing Direct Backend Login ===');
  try {
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@maternal.gov.et',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('✓ Status:', response.status);
    console.log('✓ Response:', data);
    console.log('✓ Token:', data.access_token ? 'Present ✓' : 'Missing ✗');
    
    return data.access_token;
  } catch (error) {
    console.error('✗ Backend login failed:', error.message);
  }
}

async function testFrontendLogin() {
  console.log('\n=== Testing Frontend Login (through proxy) ===');
  try {
    const response = await fetch(`${frontendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@maternal.gov.et',
        password: 'admin123'
      }),
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('✓ Status:', response.status);
    console.log('✓ Response:', data);
    
    // Extract and store cookie for manual handling (Node.js doesn't auto-manage)
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      authCookie = setCookie;
      console.log('✓ Set-Cookie header:', 'Present ✓');
      console.log('  Cookie:', setCookie.split(';')[0]);
    } else {
      console.log('✗ Set-Cookie header: Missing ✗');
    }
    
    if (response.status === 200) {
      console.log('✓ Login successful');
      
      // Try to fetch users with the cookie
      await testFrontendGetUsers();
    }
  } catch (error) {
    console.error('✗ Frontend login failed:', error.message);
  }
}

async function testFrontendGetUsers() {
  console.log('\n=== Testing Get Users (with cookie) ===');
  try {
    const headers = { 'Content-Type': 'application/json' };
    
    // In Node.js, manually add the cookie header (browsers do this automatically)
    if (authCookie) {
      headers['Cookie'] = authCookie.split(';')[0];  // Extract just the name=value part
    }
    
    const response = await fetch(`${frontendUrl}/api/proxy/users`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    console.log('✓ Status:', response.status);
    const text = await response.text();
    console.log('✓ Response length:', text.length);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✓ Users count:', Array.isArray(data) ? data.length : 'N/A');
      console.log('✓ Success! Data fetched.');
    } else {
      console.log('✗ Failed to get users:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('✗ Get users failed:', error.message);
  }
}

async function runTests() {
  console.log('Starting login flow tests...');
  console.log('Backend URL:', backendUrl);
  console.log('Frontend URL:', frontendUrl);
  
  // Test 1: Direct backend
  await testBackendLogin();
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: Through frontend proxy
  await testFrontendLogin();
}

runTests().catch(console.error);
