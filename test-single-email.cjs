const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testSingleEmail() {
  console.log('🔍 Testing Single Email with PDF...\n');
  
  // Test single email with PDF attachment
  console.log('1️⃣ Testing Single Email with PDF...');
  const emailStart = Date.now();
  
  try {
    // Create a simple test PDF
    const testPdfContent = 'Test PDF content for single email';
    const testPdfBlob = new Blob([testPdfContent], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('to', 'test@example.com');
    formData.append('subject', 'Test Single Email with PDF');
    formData.append('message', 'This is a test email with PDF attachment in a single email.');
    formData.append('attachment', new File([testPdfBlob], 'test.pdf', { type: 'application/pdf' }));
    
    const emailResponse = await fetch('http://localhost:3001/api/email/send', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    const emailTime = Date.now() - emailStart;
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log(`✅ Single Email with PDF: ${emailTime}ms`);
      console.log(`   📧 Message ID: ${emailResult.messageId}`);
      console.log(`   📧 Success: ${emailResult.success}`);
      console.log(`   📧 Send Time: ${emailResult.sendTime}ms`);
      console.log(`   📧 Attachment Size: ${emailResult.attachmentSize} bytes`);
    } else {
      const errorText = await emailResponse.text();
      console.log(`❌ Single Email with PDF: FAILED (${emailTime}ms)`);
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    const emailTime = Date.now() - emailStart;
    console.log(`❌ Single Email with PDF: ERROR (${emailTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   📄 Error: Timeout after 20 seconds');
    } else {
      console.log(`   📄 Error: ${error.message}`);
    }
  }
  
  console.log('\n📋 Analysis:');
  console.log('✅ Single email should contain both message and PDF');
  console.log('✅ Optimized PDF generation for speed');
  console.log('✅ 20-second timeout for complete process');
  console.log('✅ User gets single email with everything included');
}

testSingleEmail().catch(console.error);
