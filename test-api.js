// Simple API test file
// Run with: node test-api.js

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test root endpoint
    const rootResponse = await fetch(API_BASE);
    console.log('Root endpoint:', rootResponse.status, await rootResponse.text());
    
    // Test mothers endpoint (without auth)
    const mothersResponse = await fetch(`${API_BASE}/mothers`);
    console.log('Mothers endpoint:', mothersResponse.status);
    
    if (mothersResponse.status === 401) {
      console.log('✅ API is working, but requires authentication (expected)');
    } else if (mothersResponse.status === 200) {
      console.log('✅ API is working and accessible');
    } else {
      console.log('❌ API returned unexpected status:', mothersResponse.status);
    }
    
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    console.log('💡 Make sure backend server is running on http://localhost:3001');
  }
}

testAPI();
