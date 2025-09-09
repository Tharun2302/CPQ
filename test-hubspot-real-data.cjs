const axios = require('axios');
require('dotenv').config();

async function testHubSpotConnection() {
  console.log('🔍 Testing HubSpot API connection with real data...');
  
  // Check if API key is configured
  const apiKey = process.env.HUBSPOT_API_KEY;
  console.log('🔑 API Key configured:', apiKey ? 'Yes' : 'No');
  console.log('🔑 API Key type:', apiKey === 'demo-key' ? 'DEMO' : 'REAL');
  
  if (!apiKey || apiKey === 'demo-key') {
    console.log('❌ No real HubSpot API key configured');
    console.log('📝 Please create a .env file with your HubSpot API key:');
    console.log('   HUBSPOT_API_KEY=your-real-api-key-here');
    return;
  }
  
  try {
    console.log('🔄 Testing HubSpot API connection...');
    
    const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=5', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ HubSpot API connection successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Total contacts:', response.data.total || 0);
    console.log('📄 Contacts returned:', response.data.results?.length || 0);
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('📋 Sample contact:');
      const contact = response.data.results[0];
      console.log('   - ID:', contact.id);
      console.log('   - Name:', `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim());
      console.log('   - Email:', contact.properties.email);
      console.log('   - Company:', contact.properties.company);
    }
    
    console.log('\n🎉 Real HubSpot data is working!');
    console.log('📝 Your HubSpot integration should now show real data instead of demo data.');
    
  } catch (error) {
    console.error('❌ HubSpot API connection failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check if your API key is correct');
      console.log('   2. Ensure your HubSpot account has the necessary permissions');
      console.log('   3. Verify the API key hasn\'t expired');
    }
  }
}

// Test backend server connection
async function testBackendServer() {
  console.log('\n🔍 Testing backend server connection...');
  
  try {
    const response = await axios.get('http://localhost:3001/api/hubspot/test', {
      timeout: 10000
    });
    
    console.log('✅ Backend server is running');
    console.log('📊 Response:', response.data);
    
    if (response.data.isDemo) {
      console.log('⚠️ Backend is still in demo mode');
      console.log('📝 Make sure your .env file has the correct HUBSPOT_API_KEY');
    } else {
      console.log('✅ Backend is connected to real HubSpot data');
    }
    
  } catch (error) {
    console.error('❌ Backend server not available:', error.message);
    console.log('📝 Make sure to start the server with: node server.cjs');
  }
}

// Run tests
async function runTests() {
  console.log('🚀 HubSpot Real Data Test\n');
  
  await testHubSpotConnection();
  await testBackendServer();
  
  console.log('\n📋 Next Steps:');
  console.log('   1. If API key test passed: Your HubSpot integration will show real data');
  console.log('   2. If backend test passed: The frontend will connect properly');
  console.log('   3. If both failed: Check your .env file and restart the server');
}

runTests().catch(console.error);
