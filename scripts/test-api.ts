import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: join(__dirname, '../.env.local') });

// Test the API endpoint
async function testApi() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const url = `${baseUrl}/api/returns`;
  
  console.log(`Testing API endpoint: ${url}`);
  
  try {
    // Test GET request
    console.log('\nTesting GET /api/returns...');
    const getResponse = await fetch(url);
    const getData = await getResponse.json();
    console.log('GET Response:', {
      status: getResponse.status,
      statusText: getResponse.statusText,
      data: getData
    });
    
    // Test POST request
    console.log('\nTesting POST /api/returns...');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roundName: 'r1' })
    });
    
    const postData = await postResponse.json();
    console.log('POST Response:', {
      status: postResponse.status,
      statusText: postResponse.statusText,
      data: postData
    });
    
  } catch (error) {
    console.error('\nAPI Test Failed:', error);
    
    // Provide troubleshooting steps
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure the development server is running (pnpm dev)');
    console.log('2. Check if the API endpoint is accessible in your browser:', url);
    console.log('3. Verify your .env.local file has the correct DATABASE_URL');
    console.log('4. Check the server logs for any errors');
  }
}

// Run the test
testApi();
