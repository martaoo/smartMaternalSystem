// Test script for child registration mothers dropdown
// Run this in browser console on the child registration page

console.log('=== CHILD REGISTRATION TEST ===');

// Test mothers API
console.log('Testing mothers API...');
fetch('http://localhost:3001/api/mothers', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => {
  console.log('Mothers API status:', response.status);
  return response.json();
})
.then(mothers => {
  console.log('Mothers data:', mothers);
  console.log('Number of mothers:', mothers.length);
  
  if (mothers.length > 0) {
    console.log('First mother:', mothers[0]);
    console.log('Mother fields:', Object.keys(mothers[0]));
  } else {
    console.log('No mothers found - you need to register mothers first!');
  }
})
.catch(error => {
  console.error('Mothers API error:', error);
});

// Test hospitals API
console.log('\nTesting hospitals API...');
fetch('http://localhost:3001/api/hospitals', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => {
  console.log('Hospitals API status:', response.status);
  return response.json();
})
.then(hospitals => {
  console.log('Hospitals data:', hospitals);
  console.log('Number of hospitals:', hospitals.length);
})
.catch(error => {
  console.error('Hospitals API error:', error);
});

// Test health workers API
console.log('\nTesting health workers API...');
fetch('http://localhost:3001/api/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => {
  console.log('Users API status:', response.status);
  return response.json();
})
.then(users => {
  const healthWorkers = users.filter(user => 
    ['DOCTOR', 'NURSE', 'MIDWIFE'].includes(user.role)
  );
  console.log('Health workers:', healthWorkers);
  console.log('Number of health workers:', healthWorkers.length);
})
.catch(error => {
  console.error('Users API error:', error);
});

console.log('=== END TEST ===');
