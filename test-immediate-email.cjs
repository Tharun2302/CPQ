const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testImmediateEmail() {
  console.log('🔍 Testing Immediate Email Sending...\n');
  
  // Test immediate email sending
  console.log('1️⃣ Testing Immediate Email (No PDF)...');
  const emailStart = Date.now();
  
  try {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Immediate Email',
      message: 'This is a test immediate email without PDF attachment.',
      quoteId: 'test-quote-123',
      quoteNumber: 'CPQ-123'
    };
    
    const emailResponse = await fetch('http://localhost:3001/api/email/send-immediate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const emailTime = Date.now() - emailStart;
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log(`✅ Immediate Email: ${emailTime}ms`);
      console.log(`   📧 Message ID: ${emailResult.messageId}`);
      console.log(`   📧 Success: ${emailResult.success}`);
      console.log(`   📧 Send Time: ${emailResult.sendTime}ms`);
      console.log(`   📧 Quote ID: ${emailResult.quoteId}`);
    } else {
      const errorText = await emailResponse.text();
      console.log(`❌ Immediate Email: FAILED (${emailTime}ms)`);
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    const emailTime = Date.now() - emailStart;
    console.log(`❌ Immediate Email: ERROR (${emailTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   📄 Error: Timeout after 10 seconds');
    } else {
      console.log(`   📄 Error: ${error.message}`);
    }
  }
  
  console.log('\n📋 Analysis:');
  console.log('✅ Immediate email should send in 2-5 seconds');
  console.log('✅ No PDF processing delays');
  console.log('✅ User gets instant feedback');
  console.log('✅ PDF will be sent separately in background');
}

testImmediateEmail().catch(console.error);
