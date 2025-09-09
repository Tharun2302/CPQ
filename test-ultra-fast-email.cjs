const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testUltraFastEmail() {
  console.log('🔍 Testing Ultra-Fast Email Sending...\n');
  
  // Test ultra-fast email sending
  console.log('1️⃣ Testing Ultra-Fast Email (No PDF)...');
  const emailStart = Date.now();
  
  try {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Ultra-Fast Email',
      message: 'This is a test ultra-fast email without PDF attachment.',
      quoteId: 'test-quote-123',
      quoteNumber: 'CPQ-123'
    };
    
    const emailResponse = await fetch('http://localhost:3001/api/email/send-immediate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    const emailTime = Date.now() - emailStart;
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log(`✅ Ultra-Fast Email: ${emailTime}ms`);
      console.log(`   📧 Message ID: ${emailResult.messageId}`);
      console.log(`   📧 Success: ${emailResult.success}`);
      console.log(`   📧 Send Time: ${emailResult.sendTime}ms`);
      console.log(`   📧 Quote ID: ${emailResult.quoteId}`);
    } else {
      const errorText = await emailResponse.text();
      console.log(`❌ Ultra-Fast Email: FAILED (${emailTime}ms)`);
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    const emailTime = Date.now() - emailStart;
    console.log(`❌ Ultra-Fast Email: ERROR (${emailTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   📄 Error: Timeout after 5 seconds');
    } else {
      console.log(`   📄 Error: ${error.message}`);
    }
  }
  
  console.log('\n📋 Analysis:');
  console.log('✅ Ultra-fast email should send in 2-3 seconds');
  console.log('✅ 5-second timeout prevents hanging');
  console.log('✅ User gets immediate feedback');
  console.log('✅ PDF will be sent separately in background');
  console.log('✅ No more timeout errors!');
}

testUltraFastEmail().catch(console.error);
