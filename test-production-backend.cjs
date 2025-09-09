const axios = require('axios');

async function testProductionBackend() {
  console.log('🔍 Testing Production Backend Deployment\n');
  
  // Replace this with your actual Render URL
  const backendUrl = 'https://your-app-name.onrender.com'; // UPDATE THIS
  
  console.log('🌐 Testing backend URL:', backendUrl);
  
  // Test 1: Health check
  console.log('\n1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await axios.get(`${backendUrl}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health check successful');
    console.log('   Status:', healthResponse.status);
    console.log('   Response:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('   Please check if your backend is deployed to Render');
    return;
  }
  
  // Test 2: HubSpot test
  console.log('\n2️⃣ Testing HubSpot connection...');
  try {
    const hubspotResponse = await axios.get(`${backendUrl}/api/hubspot/test`, {
      timeout: 15000
    });
    console.log('✅ HubSpot test successful');
    console.log('   Status:', hubspotResponse.status);
    console.log('   Response:', hubspotResponse.data);
    
    if (hubspotResponse.data.isDemo) {
      console.log('⚠️ Backend is in demo mode - check HUBSPOT_API_KEY in Render');
    } else {
      console.log('✅ Backend is connected to real HubSpot data');
    }
  } catch (error) {
    console.log('❌ HubSpot test failed:', error.message);
    if (error.response?.status === 401) {
      console.log('🔧 Fix: Check HUBSPOT_API_KEY in Render environment variables');
    }
  }
  
  // Test 3: Contacts endpoint
  console.log('\n3️⃣ Testing contacts endpoint...');
  try {
    const contactsResponse = await axios.get(`${backendUrl}/api/hubspot/contacts`, {
      timeout: 15000
    });
    console.log('✅ Contacts endpoint working');
    console.log('   Status:', contactsResponse.status);
    console.log('   Data count:', contactsResponse.data.data?.length || 0);
  } catch (error) {
    console.log('❌ Contacts endpoint failed:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Update VITE_BACKEND_URL in Netlify to:', backendUrl);
  console.log('2. Redeploy your Netlify site');
  console.log('3. Test the HubSpot integration again');
}

// Instructions
console.log('🚀 Production Backend Test');
console.log('📝 Before running this test:');
console.log('   1. Deploy your backend to Render');
console.log('   2. Update the backendUrl variable above with your Render URL');
console.log('   3. Make sure HUBSPOT_API_KEY is set in Render environment variables');
console.log('');

testProductionBackend().catch(console.error);
