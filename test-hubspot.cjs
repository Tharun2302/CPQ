const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || 'pat-na1-635cc313-80cb-4701-810a-a0492691b28d';
const HUBSPOT_BASE_URL = 'https://api.hubapi.com';

async function testHubSpotConnection() {
  console.log('🔍 Testing HubSpot API Connection...');
  console.log('🔑 Using API Key:', HUBSPOT_API_KEY.substring(0, 10) + '...');
  console.log('🌐 API URL:', `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`);
  console.log('');

  try {
    const response = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ HubSpot API Connection Successful!');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
      
      if (data.results && data.results.length > 0) {
        console.log('✅ Found real contacts in HubSpot account');
        console.log('📊 Total contacts available:', data.total || 'Unknown');
        console.log('📄 Sample contact ID:', data.results[0].id);
      } else {
        console.log('⚠️ No contacts found in HubSpot account');
        console.log('💡 This might be why you\'re seeing demo data');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ HubSpot API Connection Failed!');
      console.log('📄 Error Response:', errorText);
      
      if (response.status === 401 || response.status === 403) {
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check if your API key is valid');
        console.log('2. Ensure the API key has proper permissions');
        console.log('3. Verify the key is not expired');
        console.log('4. Make sure you have contacts in your HubSpot account');
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify HubSpot API is accessible');
    console.log('3. Check if there are any firewall restrictions');
  }
}

async function testBackendServer() {
  console.log('');
  console.log('🔍 Testing Backend Server...');
  
  try {
    const response = await fetch('http://localhost:4000/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is running!');
      console.log('📄 Health check response:', data);
    } else {
      console.log('❌ Backend server error:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend server not available:', error.message);
    console.log('');
    console.log('🔧 To start the backend server:');
    console.log('1. Open a new terminal');
    console.log('2. Navigate to the project directory');
    console.log('3. Run: node server.cjs');
  }
}

async function testBackendHubSpot() {
  console.log('');
  console.log('🔍 Testing Backend HubSpot Integration...');
  
  try {
    const response = await fetch('http://localhost:4000/api/hubspot/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend HubSpot test successful!');
      console.log('📄 Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Backend HubSpot test failed:', response.status);
      console.log('📄 Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Backend HubSpot test error:', error.message);
  }
}

async function main() {
  console.log('🚀 HubSpot Integration Test');
  console.log('==========================');
  console.log('');

  // Test direct HubSpot API connection
  await testHubSpotConnection();
  
  // Test backend server
  await testBackendServer();
  
  // Test backend HubSpot integration
  await testBackendHubSpot();
  
  console.log('');
  console.log('📋 Summary:');
  console.log('1. If direct HubSpot API fails → Check your API key');
  console.log('2. If backend server fails → Start the server with: node server.cjs');
  console.log('3. If backend HubSpot fails → Check API key in .env file');
  console.log('4. If all tests pass but still see demo data → Check if you have real contacts/deals in HubSpot');
}

main().catch(console.error);
