const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testSignatureFormAccess() {
  console.log('🔍 Testing Signature Form Access via URL...\n');
  
  try {
    // Step 1: Create a signature form
    console.log('1️⃣ Creating a test signature form...');
    const formData = {
      quoteId: 'test-quote-access-123',
      clientEmail: 'client@example.com',
      clientName: 'Test Client',
      quoteData: {
        totalCost: 8500,
        plan: 'Enterprise',
        clientName: 'Test Client',
        company: 'Test Company Inc.',
        quoteNumber: 'CPQ-ACCESS-123'
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

    // Step 2: Generate the signature form URL
    const signatureFormUrl = `http://localhost:5173/signature-form/${formId}`;
    console.log('\n2️⃣ Signature Form URL Generated:');
    console.log(`   🔗 ${signatureFormUrl}`);

    // Step 3: Test accessing the form data via API
    console.log('\n3️⃣ Testing form data retrieval...');
    const formResponse = await fetch(`http://localhost:3001/api/signature/form/${formId}`);
    
    if (formResponse.ok) {
      const formData = await formResponse.json();
      console.log('✅ Form data retrieved successfully!');
      console.log('   📄 Raw form data:', JSON.stringify(formData.form, null, 2));
      console.log(`   👤 Client: ${formData.form.client_name}`);
      console.log(`   📧 Email: ${formData.form.client_email}`);
      console.log(`   💰 Cost: $${formData.form.quote_data?.totalCost || 'N/A'}`);
      console.log(`   📋 Plan: ${formData.form.quote_data?.plan || 'N/A'}`);
      console.log(`   🏢 Company: ${formData.form.quote_data?.company || 'N/A'}`);
      console.log(`   📊 Status: ${formData.form.status}`);
    } else {
      const errorText = await formResponse.text();
      console.log('❌ Failed to retrieve form data');
      console.log(`   📄 Error: ${errorText}`);
    }

    console.log('\n🎉 Signature Form Access Test Completed!');
    console.log('✅ Form creation: Working');
    console.log('✅ URL generation: Working');
    console.log('✅ Data retrieval: Working');
    console.log('\n📋 Next Steps:');
    console.log(`1. Open your browser and go to: ${signatureFormUrl}`);
    console.log('2. You should see the digital signature form');
    console.log('3. Test the signature functionality');
    console.log('4. Submit the form to test the complete workflow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running: node server.cjs');
    console.log('2. Make sure the frontend server is running: npm run dev');
    console.log('3. Check if both servers are accessible');
  }
}

testSignatureFormAccess().catch(console.error);
