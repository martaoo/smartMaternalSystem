// Test authentication flow
// Run with: node test-auth.js

const API_BASE = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('1. Testing login...');
    
    // Test login with nurse credentials
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nurse@test.com', // Replace with actual nurse email
        password: 'password123'  // Replace with actual password
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('2. Login successful! Token received');
      console.log('User role:', loginData.user.role);
      console.log('User email:', loginData.user.email);
      
      // Test API with token
      console.log('3. Testing mothers API with token...');
      const mothersResponse = await fetch(`${API_BASE}/mothers`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` }
      });
      
      if (mothersResponse.ok) {
        console.log('4. Mothers API successful! Authorization working');
        const mothersData = await mothersResponse.json();
        console.log('Mothers count:', mothersData.length || 0);
      } else {
        console.log('4. Mothers API failed:', mothersResponse.status);
        const error = await mothersResponse.text();
        console.log('Error:', error);
      }
    } else {
      console.log('2. Login failed:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth();
