// Quick debug script - run this in browser console on the mother registration page

console.log('=== QUICK DEBUG ===');

// Check localStorage
console.log('1. Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
console.log('2. User string:', localStorage.getItem('user'));

// Parse user if exists
const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('3. Parsed user:', user);
    console.log('4. User keys:', Object.keys(user));
    console.log('5. hospitalId:', user.hospitalId);
    console.log('6. hospitalId type:', typeof user.hospitalId);
    
    // Check for alternative field names
    console.log('7. hospitalId (alt):', user.hospital);
    console.log('8. healthCenterId:', user.healthCenterId);
    console.log('9. assignedHospital:', user.assignedHospital);
    
  } catch (e) {
    console.error('Error parsing user:', e);
  }
} else {
  console.log('No user data found');
}

// Test hospitals API
console.log('10. Testing hospitals API...');
fetch('http://localhost:3001/api/hospitals', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => {
  console.log('11. API response status:', response.status);
  return response.json();
})
.then(hospitals => {
  console.log('12. Hospitals count:', hospitals.length);
  console.log('13. First hospital:', hospitals[0]);
  if (hospitals.length > 0) {
    console.log('14. Available hospital IDs:', hospitals.map(h => h._id));
  }
})
.catch(error => {
  console.error('15. API error:', error);
});

console.log('=== END DEBUG ===');
