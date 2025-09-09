const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Testing Gmail Authentication...');
console.log('📧 Email Config:', {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  user: process.env.SMTP_USER || 'not-set',
  pass: process.env.SMTP_PASS ? '***SET***' : 'NOT SET'
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function testEmailAuth() {
  try {
    console.log('🔄 Testing email authentication...');
    
    // Test the connection
    await transporter.verify();
    console.log('✅ Email authentication successful!');
    
    // Try to send a test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself as a test
      subject: 'Test Email - CloudFuze System',
      text: 'This is a test email to verify your Gmail configuration is working correctly.',
      html: '<h2>Test Email</h2><p>This is a test email to verify your Gmail configuration is working correctly.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Email authentication failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid login') || error.message.includes('535-5.7.8')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Enable 2-Factor Authentication if not enabled');
      console.log('3. Go to "App passwords"');
      console.log('4. Generate a new App Password for "Mail"');
      console.log('5. Update your .env file with the new App Password');
      console.log('6. Restart the server');
    } else if (error.message.includes('Username and Password not accepted')) {
      console.log('\n🔧 SOLUTION:');
      console.log('Your App Password has expired or is incorrect.');
      console.log('Generate a new App Password from Google Account settings.');
    }
  }
}

testEmailAuth();
