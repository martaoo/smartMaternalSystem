// Simple backend health check
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend server is running! Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('🎯 API is accessible - frontend should work!');
  }
});

req.on('error', (err) => {
  console.log('❌ Backend server is NOT running');
  console.log('Error:', err.message);
  console.log('💡 Make sure to run: cd backend && npm run start:dev');
});

req.end();
