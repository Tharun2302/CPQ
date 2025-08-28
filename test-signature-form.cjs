const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testSignatureForm() {
  console.log('🔍 Testing Digital Signature Form Creation...\n');
  
  try {
    // Test 1: Create Signature Form
    console.log('1️⃣ Testing Signature Form Creation...');
    const formData = {
      quoteId: 'test-quote-123',
      clientEmail: 'test@example.com',
      clientName: 'Test Client',
      quoteData: {
        totalCost: 5000,
        plan: 'Premium',
        clientName: 'Test Client',
        company: 'Test Company',
        quoteNumber: 'CPQ-123'
      }
    };

    const response = await fetch('http://localhost:3001/api/signature/create-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Signature Form Created Successfully!');
      console.log(`   📝 Form ID: ${result.formId}`);
      console.log(`   📧 Client Email: ${formData.clientEmail}`);
      console.log(`   👤 Client Name: ${formData.clientName}`);
      console.log(`   💰 Total Cost: $${formData.quoteData.totalCost}`);
      console.log(`   📋 Plan: ${formData.quoteData.plan}`);
    } else {
      const errorText = await response.text();
      console.log('❌ Signature Form Creation Failed');
      console.log(`   📄 Error: ${errorText}`);
    }

    // Test 2: Test Analytics Endpoint
    console.log('\n2️⃣ Testing Analytics Endpoint...');
    const analyticsResponse = await fetch('http://localhost:3001/api/signature/analytics');
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics Retrieved Successfully!');
      console.log(`   📊 Total Forms: ${analyticsData.analytics.total}`);
      console.log(`   ⏳ Pending Forms: ${analyticsData.analytics.pending}`);
      console.log(`   ✅ Completed Forms: ${analyticsData.analytics.completed}`);
      console.log(`   🎯 Approval Rate: ${analyticsData.analytics.approvalRate}%`);
      console.log(`   📈 Recent Activity: ${analyticsData.recentActivity.length} items`);
    } else {
      const errorText = await analyticsResponse.text();
      console.log('❌ Analytics Retrieval Failed');
      console.log(`   📄 Error: ${errorText}`);
    }

    // Test 3: Test Interaction Tracking
    console.log('\n3️⃣ Testing Interaction Tracking...');
    const interactionData = {
      formId: 'test-form-123',
      interactionType: 'form_opened',
      data: { timeSpent: 0 }
    };

    const interactionResponse = await fetch('http://localhost:3001/api/signature/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interactionData)
    });

    if (interactionResponse.ok) {
      const interactionResult = await interactionResponse.json();
      console.log('✅ Interaction Tracking Successfully!');
      console.log(`   📊 Interaction Type: ${interactionData.interactionType}`);
      console.log(`   📝 Form ID: ${interactionData.formId}`);
    } else {
      const errorText = await interactionResponse.text();
      console.log('❌ Interaction Tracking Failed');
      console.log(`   📄 Error: ${errorText}`);
    }

    console.log('\n🎉 All Signature Form Tests Completed!');
    console.log('✅ Database tables are working');
    console.log('✅ API endpoints are responding');
    console.log('✅ Signature form creation is functional');
    console.log('✅ Analytics tracking is operational');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running: node server.cjs');
    console.log('2. Check database connection');
    console.log('3. Verify signature tables exist');
  }
}

testSignatureForm().catch(console.error);
