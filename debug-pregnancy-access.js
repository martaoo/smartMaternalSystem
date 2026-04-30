// Debug script for pregnancy access issues
// Run this in browser console on the pregnancy tracking page

console.log('=== PREGNANCY ACCESS DEBUG ===');

// Check user data
const userStr = localStorage.getItem('user');
if (userStr) {
  const user = JSON.parse(userStr);
  console.log('User data:', user);
  console.log('User role:', user.role);
  console.log('User hospitalId:', user.hospitalId);
  console.log('User hospitalId type:', typeof user.hospitalId);
} else {
  console.error('No user data found in localStorage');
}

// Test pregnancy API calls
const token = localStorage.getItem('token');

// Test 1: Get all pregnancy records
console.log('\n--- Testing GET /pregnancy ---');
fetch('http://localhost:3001/api/pregnancy', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  console.log('GET all pregnancies status:', response.status);
  return response.json();
})
.then(data => {
  console.log('GET all pregnancies data:', data);
  console.log('Number of pregnancy records:', data.length);
  
  if (data.length > 0) {
    const firstRecord = data[0];
    console.log('First pregnancy record:', firstRecord);
    console.log('First record hospitalId:', firstRecord.hospitalId);
    console.log('First record hospitalId type:', typeof firstRecord.hospitalId);
    
    // Test 2: Try to get specific record by ID
    console.log('\n--- Testing GET /pregnancy/:id ---');
    return fetch(`http://localhost:3001/api/pregnancy/${firstRecord._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
})
.then(response => {
  if (response) {
    console.log('GET pregnancy by ID status:', response.status);
    return response.json();
  }
})
.then(data => {
  if (data) {
    console.log('GET pregnancy by ID data:', data);
  }
})
.catch(error => {
  console.error('API error:', error);
});

console.log('=== END DEBUG ===');
