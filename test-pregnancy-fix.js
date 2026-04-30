// Test script to check pregnancy access after fix
// Run this in browser console

console.log('=== PREGNANCY ACCESS TEST ===');

// Get user data
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
console.log('User:', user);

// Get a pregnancy record from the list
fetch('http://localhost:3001/api/pregnancy', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(pregnancies => {
  console.log('Found pregnancies:', pregnancies.length);
  
  if (pregnancies.length > 0) {
    const firstPregnancy = pregnancies[0];
    console.log('First pregnancy:', firstPregnancy);
    
    // Test accessing the specific pregnancy
    console.log('\n--- Testing pregnancy detail access ---');
    return fetch(`http://localhost:3001/api/pregnancy/${firstPregnancy._id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
})
.then(response => {
  console.log('Pregnancy detail response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Pregnancy detail data:', data);
})
.catch(error => {
  console.error('Error:', error);
});

console.log('=== END TEST ===');
