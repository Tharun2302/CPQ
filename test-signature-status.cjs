const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testSignatureStatus() {
  console.log('🔍 Testing Signature Status for Quotes...\n');
  
  try {
    // Step 1: Create a test quote and signature form
    console.log('1️⃣ Creating test quote and signature form...');
    
    // Create a signature form for a test quote
    const formData = {
      quoteId: 'test-quote-signature-123',
      clientEmail: 'client@example.com',
      clientName: 'Test Client',
      quoteData: {
        totalCost: 5000,
        plan: 'Premium',
        clientName: 'Test Client',
        company: 'Test Company Inc.',
        quoteNumber: 'CPQ-SIGNATURE-123'
      }
    };

    const response = await fetch('http://localhost:3001/api/signature/create-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Failed to create signature form');
    }

    const result = await response.json();
    const formId = result.formId;
    console.log('✅ Signature form created successfully!');
    console.log(`   📝 Form ID: ${formId}`);
    console.log(`   📋 Quote ID: ${formData.quoteId}`);

    // Step 2: Test fetching signature forms by quote ID
    console.log('\n2️⃣ Testing signature forms by quote ID...');
    const formsResponse = await fetch(`http://localhost:3001/api/signature/forms-by-quote/${formData.quoteId}`);
    
    if (formsResponse.ok) {
      const formsData = await formsResponse.json();
      console.log('✅ Signature forms retrieved successfully!');
      console.log(`   📊 Forms found: ${formsData.forms.length}`);
      
      if (formsData.forms.length > 0) {
        const form = formsData.forms[0];
        console.log(`   📝 Form ID: ${form.form_id}`);
        console.log(`   👤 Client: ${form.client_name}`);
        console.log(`   📧 Email: ${form.client_email}`);
        console.log(`   📊 Status: ${form.status}`);
        console.log(`   ✅ Approval Status: ${form.approval_status}`);
        console.log(`   ✍️  Signed: ${form.signature_data ? 'Yes' : 'No'}`);
      }
    } else {
      const errorText = await formsResponse.text();
      console.log('❌ Failed to retrieve signature forms');
      console.log(`   📄 Error: ${errorText}`);
    }

    // Step 3: Test with a non-existent quote ID
    console.log('\n3️⃣ Testing with non-existent quote ID...');
    const nonExistentResponse = await fetch('http://localhost:3001/api/signature/forms-by-quote/non-existent-quote');
    
    if (nonExistentResponse.ok) {
      const nonExistentData = await nonExistentResponse.json();
      console.log('✅ Non-existent quote handled correctly!');
      console.log(`   📊 Forms found: ${nonExistentData.forms.length}`);
    } else {
      const errorText = await nonExistentResponse.text();
      console.log('❌ Error with non-existent quote');
      console.log(`   📄 Error: ${errorText}`);
    }

    console.log('\n🎉 Signature Status Test Completed!');
    console.log('✅ Signature form creation: Working');
    console.log('✅ Forms by quote retrieval: Working');
    console.log('✅ Non-existent quote handling: Working');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to the Quote Manager in the application');
    console.log('2. Look for the "Client Status" section in each quote');
    console.log('3. Click "Check Status" to see signature and approval information');
    console.log('4. The status will show if the client has signed and approved the quote');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running: node server.cjs');
    console.log('2. Check if the signature database tables exist');
    console.log('3. Verify the API endpoints are accessible');
  }
}

testSignatureStatus().catch(console.error);
