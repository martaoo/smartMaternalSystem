// Debug script to check user data and hospital assignment
// Run this in browser console on the mother registration page

console.log('=== USER DATA DEBUG ===');

// Check localStorage
const userStr = localStorage.getItem('user');
console.log('1. User string from localStorage:', userStr);

if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('2. Parsed user object:', user);
    console.log('3. User hospitalId:', user.hospitalId);
    console.log('4. User hospitalId type:', typeof user.hospitalId);
    console.log('5. User role:', user.role);
    console.log('6. User name:', user.name);
    
    // Test API call
    console.log('7. Testing hospitals API...');
    fetch('http://localhost:3001/api/hospitals', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => response.json())
    .then(hospitals => {
      console.log('8. Hospitals from API:', hospitals);
      console.log('9. Number of hospitals:', hospitals.length);
      
      if (user.hospitalId && hospitals.length > 0) {
        const foundHospital = hospitals.find(h => h._id === user.hospitalId);
        console.log('10. Found hospital by exact match:', foundHospital);
        
        // Try string comparison
        const foundByString = hospitals.find(h => h._id === String(user.hospitalId));
        console.log('11. Found hospital by string match:', foundByString);
        
        // Show all hospital IDs for comparison
        console.log('12. All hospital IDs:', hospitals.map(h => ({ id: h._id, name: h.name })));
      }
    })
    .catch(error => {
      console.error('Error fetching hospitals:', error);
    });
    
  } catch (e) {
    console.error('Error parsing user:', e);
  }
} else {
  console.log('No user data found in localStorage');
}

console.log('=== END DEBUG ===');
