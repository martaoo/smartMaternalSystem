// Test liaison officer login and hospital access
const API_BASE = 'http://localhost:3001/api';

async function testLiaison() {
  try {
    console.log('Testing liaison officer login...');

    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'liaison@test.et',
        password: 'liaison123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful!');
      console.log('User role:', loginData.user.role);
      console.log('Hospital ID:', loginData.user.hospitalId);

      console.log('Testing hospitals API...');
      const hospitalsResponse = await fetch(`${API_BASE}/hospitals`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` }
      });

      if (hospitalsResponse.ok) {
        const hospitals = await hospitalsResponse.json();
        console.log('Hospitals API successful!');
        console.log('Hospitals count:', hospitals.length);
        hospitals.forEach(h => console.log('- ' + h.name + ' (' + h.type + ')'));
      } else {
        console.log('Hospitals API failed:', hospitalsResponse.status);
      }
    } else {
      console.log('Login failed:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLiaison();