// Test script for mother edit functionality
// Run this in browser console on the mothers detail page

console.log('=== MOTHER EDIT TEST ===');

// Check if we're on a mother detail page
const pathParts = window.location.pathname.split('/');
const isMotherDetailPage = pathParts.includes('mothers') && pathParts.length === 4 && pathParts[3] !== 'edit';

if (isMotherDetailPage) {
  console.log('✅ On mother detail page');
  
  // Find the edit button
  const editButton = Array.from(document.querySelectorAll('a')).find(a => 
    a.textContent.trim() === 'Edit Mother'
  );
  
  if (editButton) {
    console.log('✅ Edit button found:', editButton.href);
    
    // Test the edit button link
    const motherId = pathParts[3];
    const expectedEditUrl = `/healthcare-dashboard/mothers/${motherId}/edit`;
    
    if (editButton.href.includes(expectedEditUrl)) {
      console.log('✅ Edit button has correct URL');
    } else {
      console.error('❌ Edit button has wrong URL:', editButton.href, 'Expected:', expectedEditUrl);
    }
    
    // Test clicking the edit button
    console.log('Testing edit button click...');
    editButton.addEventListener('click', (e) => {
      console.log('Edit button clicked, navigating to:', editButton.href);
    });
    
  } else {
    console.error('❌ Edit button not found');
  }
} else {
  console.log('❌ Not on mother detail page. Current page:', window.location.pathname);
}

console.log('=== END TEST ===');
