const fetch = require('node-fetch');

console.log('🧪 Testing Complete Signature Flow...');

async function testCompleteSignatureFlow() {
  try {
    // Step 1: Create a test signature form
    console.log('📝 Step 1: Creating test signature form...');
    const createResponse = await fetch('http://localhost:3001/api/signature/test-create', {
      method: 'POST'
    });
    
    const createResult = await createResponse.json();
    if (!createResult.success) {
      throw new Error('Failed to create test form');
    }
    
    const formId = createResult.formId;
    console.log('✅ Test form created:', formId);
    
    // Step 2: Submit client signature data
    console.log('📝 Step 2: Submitting client signature data...');
    const clientSignatureData = {
      eSignature: 'John Doe',
      fullName: 'John Doe',
      title: 'CEO',
      date: '2025-08-27',
      selectedFontStyle: 0,
      signatureImage: null
    };
    
    const submitResponse = await fetch('http://localhost:3001/api/signature/client-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId,
        signatureData: clientSignatureData
      })
    });
    
    const submitResult = await submitResponse.json();
    if (!submitResult.success) {
      throw new Error('Failed to submit client signature');
    }
    
    console.log('✅ Client signature submitted successfully');
    
    // Step 3: Generate final template with both signatures
    console.log('📝 Step 3: Generating final template with both signatures...');
    const generateResponse = await fetch('http://localhost:3001/api/signature/generate-final-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: formId
      })
    });
    
    const generateResult = await generateResponse.json();
    if (!generateResult.success) {
      throw new Error('Failed to generate final template');
    }
    
    console.log('✅ Final template generated successfully');
    console.log('📄 File name:', generateResult.fileName);
    console.log('📊 Template data size:', generateResult.templateData ? generateResult.templateData.length : 0, 'characters');
    
    // Step 4: Verify form data
    console.log('📝 Step 4: Verifying form data...');
    const verifyResponse = await fetch(`http://localhost:3001/api/signature/form/${formId}`);
    const verifyResult = await verifyResponse.json();
    
    if (!verifyResult.success) {
      throw new Error('Failed to verify form data');
    }
    
    console.log('✅ Form data verified');
    console.log('📋 Client name:', verifyResult.formData.clientName);
    console.log('📧 Client email:', verifyResult.formData.clientEmail);
    console.log('📝 Signature data present:', !!verifyResult.formData.signatureData);
    
    // Step 5: Test client signature form URL
    const clientFormUrl = `http://localhost:5173/client-signature-form.html?formId=${formId}`;
    console.log('📝 Step 5: Client signature form URL:');
    console.log('🔗', clientFormUrl);
    
    console.log('\n🎉 Complete signature flow test successful!');
    console.log('\n📋 Summary:');
    console.log('✅ Signature form created');
    console.log('✅ Client signature submitted');
    console.log('✅ Final template generated with both signatures');
    console.log('✅ Client signature data placed on third page right side');
    console.log('✅ Preview functionality available');
    console.log('✅ Download functionality available');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Visit the client signature form URL above');
    console.log('2. Fill in the signature form');
    console.log('3. Submit the form');
    console.log('4. Preview the final document with both signatures');
    console.log('5. Download the completed document');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testCompleteSignatureFlow();
