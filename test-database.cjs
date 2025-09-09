const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'cpq_database1',
  port: 3306
};

async function testDatabase() {
  try {
    console.log('🔍 Testing MySQL database connection...');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`👤 User: ${dbConfig.user}`);
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
    
    // Test connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Basic query test passed!');
    
    // Check if database exists
    const [databases] = await connection.execute(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    if (databases.length > 0) {
      console.log('✅ Database exists!');
    } else {
      console.log('❌ Database does not exist. Please run setup-database.sql');
    }
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Test pricing tiers
    const [tiers] = await connection.execute('SELECT COUNT(*) as count FROM pricing_tiers');
    console.log(`💰 Pricing tiers: ${tiers[0].count} found`);
    
    connection.end();
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check if database exists: mysql -u root -p');
    console.log('3. Run setup script: mysql -u root -p < setup-database.sql');
    console.log('4. Verify credentials in .env file');
  }
}

testDatabase();
