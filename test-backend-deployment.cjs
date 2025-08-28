const axios = require('axios');

async function testBackendDeployment() {
  console.log('🔍 Testing Backend Deployment\n');
  
  // Test local backend first
  console.log('1️⃣ Testing local backend...');
  try {
    const localResponse = await axios.get('http://localhost:3001/api/health', {
      timeout: 5000
    });
    console.log('✅ Local backend is running');
    console.log('   Status:', localResponse.status);
    console.log('   Response:', localResponse.data);
  } catch (error) {
    console.log('❌ Local backend not running:', error.message);
  }
  
  console.log('\n2️⃣ Testing HubSpot connection...');
  try {
    const hubspotResponse = await axios.get('http://localhost:3001/api/hubspot/test', {
      timeout: 10000
    });
    console.log('✅ HubSpot connection working');
    console.log('   Status:', hubspotResponse.status);
    console.log('   Response:', hubspotResponse.data);
  } catch (error) {
    console.log('❌ HubSpot connection failed:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Deploy backend to Render (see DEPLOYMENT_GUIDE.md)');
  console.log('2. Get your Render URL (e.g., https://your-app.onrender.com)');
  console.log('3. Add VITE_BACKEND_URL to Netlify environment variables');
  console.log('4. Test the deployed backend URL');
  
  console.log('\n🧪 To test deployed backend:');
  console.log('   curl https://your-app.onrender.com/api/health');
  console.log('   curl https://your-app.onrender.com/api/hubspot/test');
}

testBackendDeployment().catch(console.error);
