const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testEmailSpeed() {
  console.log('🔍 Testing Email Sending Speed...\n');
  
  // Test 1: Check server health
  console.log('1️⃣ Testing Server Health...');
  const startTime = Date.now();
  
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthTime = Date.now() - startTime;
    
    if (healthResponse.ok) {
      console.log(`✅ Server Health: ${healthTime}ms`);
    } else {
      console.log('❌ Server Health: FAILED');
      return;
    }
  } catch (error) {
    console.log('❌ Server Health: ERROR');
    console.log(`   📄 Error: ${error.message}`);
    return;
  }
  
  // Test 2: Check email configuration
  console.log('\n2️⃣ Testing Email Configuration...');
  const emailConfigStart = Date.now();
  
  try {
    const emailConfigResponse = await fetch('http://localhost:3001/api/email/test');
    const emailConfigTime = Date.now() - emailConfigStart;
    
    if (emailConfigResponse.ok) {
      const emailConfig = await emailConfigResponse.json();
      console.log(`✅ Email Config: ${emailConfigTime}ms`);
      console.log(`   📧 SMTP Host: ${emailConfig.config.host}`);
      console.log(`   📧 SMTP Port: ${emailConfig.config.port}`);
      console.log(`   📧 User: ${emailConfig.config.user}`);
    } else {
      console.log('❌ Email Config: FAILED');
      return;
    }
  } catch (error) {
    console.log('❌ Email Config: ERROR');
    console.log(`   📄 Error: ${error.message}`);
    return;
  }
  
  // Test 3: Test email sending with small data
  console.log('\n3️⃣ Testing Email Sending (Small Data)...');
  const emailStart = Date.now();
  
  try {
    // Create a small test PDF
    const testPdfContent = 'Test PDF content';
    const testPdfBlob = new Blob([testPdfContent], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('to', 'test@example.com');
    formData.append('subject', 'Test Email Speed');
    formData.append('message', 'This is a test email to check sending speed.');
    formData.append('attachment', new File([testPdfBlob], 'test.pdf', { type: 'application/pdf' }));
    
    const emailResponse = await fetch('http://localhost:3001/api/email/send', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    const emailTime = Date.now() - emailStart;
    
    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log(`✅ Email Sending: ${emailTime}ms`);
      console.log(`   📧 Message ID: ${emailResult.messageId}`);
      console.log(`   📧 Success: ${emailResult.success}`);
    } else {
      const errorText = await emailResponse.text();
      console.log(`❌ Email Sending: FAILED (${emailTime}ms)`);
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    const emailTime = Date.now() - emailStart;
    console.log(`❌ Email Sending: ERROR (${emailTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   📄 Error: Timeout after 30 seconds');
    } else {
      console.log(`   📄 Error: ${error.message}`);
    }
  }
  
  // Test 4: Check for common bottlenecks
  console.log('\n4️⃣ Checking for Common Bottlenecks...');
  console.log('   🔍 PDF Generation: May take 5-15 seconds');
  console.log('   🔍 SMTP Connection: May take 2-5 seconds');
  console.log('   🔍 File Upload: Depends on PDF size');
  console.log('   🔍 Network Latency: Variable');
  
  console.log('\n📋 Recommendations:');
  console.log('✅ Add timeouts to prevent hanging');
  console.log('✅ Optimize PDF generation');
  console.log('✅ Use smaller PDF files');
  console.log('✅ Consider async email sending');
  console.log('✅ Add progress indicators');
}

testEmailSpeed().catch(console.error);
