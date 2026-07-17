const fetch = require('node-fetch');
const API_BASE = 'http://localhost:3001/api';

async function main() {
  try {
    const login = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'liaison@test.et', password: 'liaison123' }),
    });
    const loginData = await login.json();
    console.log('login status', login.status, loginData);
    const token = loginData.access_token;
    const referrals = await fetch(`${API_BASE}/referrals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await referrals.json();
    console.log('referrals status', referrals.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();