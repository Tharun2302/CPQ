const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testSimpleEmail() {
  console.log('🔍 Testing Simple Email Sending...\n');
  
  // Test simple email without file upload
  console.log('1️⃣ Testing Simple Email (No File Upload)...');
  const emailStart = Date.now();
  
  try {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Simple Email',
      message: 'This is a test email without file attachment.'
    };
    
    const emailResponse = await fetch('http://localhost:3001/api/email/send-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    const emailTime = Date.now() - emailStart;
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log(`✅ Simple Email: ${emailTime}ms`);
      console.log(`   📧 Message ID: ${emailResult.messageId}`);
      console.log(`   📧 Success: ${emailResult.success}`);
    } else {
      const errorText = await emailResponse.text();
      console.log(`❌ Simple Email: FAILED (${emailTime}ms)`);
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    const emailTime = Date.now() - emailStart;
    console.log(`❌ Simple Email: ERROR (${emailTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   📄 Error: Timeout after 30 seconds');
    } else {
      console.log(`   📄 Error: ${error.message}`);
    }
  }
  
  // Test FormData email with file upload
  console.log('\n2️⃣ Testing FormData Email (With File Upload)...');
  const formDataStart = Date.now();
  
  try {
    // Create a small test PDF
    const testPdfContent = 'Test PDF content';
    const testPdfBlob = new Blob([testPdfContent], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('to', 'test@example.com');
    formData.append('subject', 'Test FormData Email');
    formData.append('message', 'This is a test email with file attachment.');
    formData.append('attachment', new File([testPdfBlob], 'test.pdf', { type: 'application/pdf' }));
    
    const formDataResponse = await fetch('http://localhost:3001/api/email/send', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    const formDataTime = Date.now() - formDataStart;
    
    if (formDataResponse.ok) {
      const formDataResult = await formDataResponse.json();
      console.log(`✅ FormData Email: ${formDataTime}ms`);
      console.log(`   📧 Message ID: ${formDataResult.messageId}`);
      console.log(`   📧 Success: ${formDataResult.success}`);
    } else {
      const errorText = await formDataResponse.text();
      console.log(`❌ FormData Email: FAILED (${formDataTime}ms)`);
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    const formDataTime = Date.now() - formDataStart;
    console.log(`❌ FormData Email: ERROR (${formDataTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   📄 Error: Timeout after 30 seconds');
    } else {
      console.log(`   📄 Error: ${error.message}`);
    }
  }
  
  console.log('\n📋 Analysis:');
  console.log('✅ Simple email test will show if SMTP is working');
  console.log('✅ FormData test will show if file upload is the issue');
  console.log('✅ Compare response times to identify bottlenecks');
}

testSimpleEmail().catch(console.error);
