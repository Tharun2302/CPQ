const { spawn } = require('child_process');
const fetch = require('node-fetch');

async function testClientSignatureFlow() {
  console.log('🧪 Testing complete client signature flow...');
  
  try {
    // Step 1: Create a test signature form
    console.log('📝 Step 1: Creating test signature form...');
    const createResponse = await fetch('http://localhost:3001/api/signature/test-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        quoteData: {
          plan: 'CloudFuze Purchase Agreement',
          companyName: 'Test Company Inc.',
          migrationType: 'Content',
          instanceType: 'Standard',
          duration: 12,
          totalPrice: 15000
        }
      })
    });

    const createResult = await createResponse.json();
    if (!createResult.success) {
      throw new Error(`Failed to create test form: ${createResult.message}`);
    }

    const formId = createResult.formId;
    console.log('✅ Test form created:', formId);

    // Step 2: Submit client signature
    console.log('✍️ Step 2: Submitting client signature...');
    const signatureData = {
      eSignature: 'John Doe',
      fullName: 'John Doe',
      title: 'CEO',
      date: new Date().toISOString().split('T')[0],
      selectedFontStyle: 0
    };

    const submitResponse = await fetch('http://localhost:3001/api/signature/client-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId,
        signatureData
      })
    });

    const submitResult = await submitResponse.json();
    if (!submitResult.success) {
      throw new Error(`Failed to submit signature: ${submitResult.message}`);
    }

    console.log('✅ Client signature submitted successfully');

    // Step 3: Generate final template
    console.log('📄 Step 3: Generating final template...');
    const generateResponse = await fetch('http://localhost:3001/api/signature/generate-final-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId
      })
    });

    const generateResult = await generateResponse.json();
    if (!generateResult.success) {
      throw new Error(`Failed to generate template: ${generateResult.message}`);
    }

    console.log('✅ Final template generated successfully');
    console.log('📄 File name:', generateResult.fileName);
    console.log('📄 Template data length:', generateResult.templateData.length);

    // Step 4: Verify template data
    if (!generateResult.templateData || generateResult.templateData.length < 1000) {
      throw new Error('Generated template data appears to be invalid or too small');
    }

    console.log('✅ Template data verification passed');

    // Step 5: Test client form URL
    const clientFormUrl = `http://localhost:5173/client-signature-form.html?formId=${formId}`;
    console.log('🔗 Client form URL:', clientFormUrl);

    console.log('\n🎉 All server-side tests passed!');
    console.log('\n📋 Next steps for manual testing:');
    console.log('1. Open the client form URL in a browser');
    console.log('2. Fill in the signature form');
    console.log('3. Submit the form');
    console.log('4. Verify preview and download buttons appear');
    console.log('5. Test preview functionality');
    console.log('6. Test download functionality');

    return {
      success: true,
      formId,
      clientFormUrl,
      templateData: generateResult.templateData,
      fileName: generateResult.fileName
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testClientSignatureFlow().then(result => {
  if (result.success) {
    console.log('\n✅ Complete client signature flow test passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Complete client signature flow test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
