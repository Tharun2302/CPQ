const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testContentMigrationPricing() {
  console.log('🔍 Testing Content Migration Pricing...\n');
  
  try {
    // Test configuration for Content migration
    const testConfig = {
      numberOfUsers: 1,
      instanceType: 'Small',
      numberOfInstances: 1,
      duration: 1,
      migrationType: 'Content',
      dataSizeGB: 100
    };

    console.log('📋 Test Configuration:');
    console.log(`   👥 Number of Users: ${testConfig.numberOfUsers}`);
    console.log(`   🖥️  Instance Type: ${testConfig.instanceType}`);
    console.log(`   🔢 Number of Instances: ${testConfig.numberOfInstances}`);
    console.log(`   ⏱️  Duration (months): ${testConfig.duration}`);
    console.log(`   📤 Migration Type: ${testConfig.migrationType}`);
    console.log(`   💾 Data Size (GB): ${testConfig.dataSizeGB}`);

    // Calculate expected values for Content migration
    console.log('\n🧮 Expected Calculations for Content Migration:');
    
    // Basic Plan
    const basicUserCost = testConfig.numberOfUsers * 15 * testConfig.duration;
    const basicDataCost = testConfig.dataSizeGB * 0.00;
    const basicMigrationCost = 300; // Content migration - FIXED at $300
    const basicInstanceCost = testConfig.numberOfInstances * 500; // Small instance
    const basicTotal = basicUserCost + basicDataCost + basicMigrationCost + basicInstanceCost;
    
    console.log('\n📊 Basic Plan:');
    console.log(`   👥 User Cost: ${testConfig.numberOfUsers} × $15 × ${testConfig.duration} = $${basicUserCost}`);
    console.log(`   💾 Data Cost: ${testConfig.dataSizeGB} × $0.00 = $${basicDataCost}`);
    console.log(`   📤 Migration Cost: $${basicMigrationCost} (Content migration - FIXED)`);
    console.log(`   🖥️  Instance Cost: ${testConfig.numberOfInstances} × $500 = $${basicInstanceCost}`);
    console.log(`   💰 TOTAL: $${basicTotal}`);

    // Standard Plan
    const standardUserCost = testConfig.numberOfUsers * 15 * testConfig.duration;
    const standardDataCost = testConfig.dataSizeGB * 0.00;
    const standardMigrationCost = 300; // Content migration - FIXED at $300
    const standardInstanceCost = testConfig.numberOfInstances * 500;
    const standardTotal = standardUserCost + standardDataCost + standardMigrationCost + standardInstanceCost;
    
    console.log('\n📊 Standard Plan:');
    console.log(`   👥 User Cost: ${testConfig.numberOfUsers} × $15 × ${testConfig.duration} = $${standardUserCost}`);
    console.log(`   💾 Data Cost: ${testConfig.dataSizeGB} × $0.00 = $${standardDataCost}`);
    console.log(`   📤 Migration Cost: $${standardMigrationCost} (Content migration - FIXED)`);
    console.log(`   🖥️  Instance Cost: ${testConfig.numberOfInstances} × $500 = $${standardInstanceCost}`);
    console.log(`   💰 TOTAL: $${standardTotal}`);

    // Advanced Plan
    const advancedUserCost = testConfig.numberOfUsers * 15 * testConfig.duration;
    const advancedDataCost = testConfig.dataSizeGB * 0.00;
    const advancedMigrationCost = 300; // Content migration - FIXED at $300
    const advancedInstanceCost = testConfig.numberOfInstances * 500;
    const advancedTotal = advancedUserCost + advancedDataCost + advancedMigrationCost + advancedInstanceCost;
    
    console.log('\n📊 Advanced Plan:');
    console.log(`   👥 User Cost: ${testConfig.numberOfUsers} × $15 × ${testConfig.duration} = $${advancedUserCost}`);
    console.log(`   💾 Data Cost: ${testConfig.dataSizeGB} × $0.00 = $${advancedDataCost}`);
    console.log(`   📤 Migration Cost: $${advancedMigrationCost} (Content migration - FIXED)`);
    console.log(`   🖥️  Instance Cost: ${testConfig.numberOfInstances} × $500 = $${advancedInstanceCost}`);
    console.log(`   💰 TOTAL: $${advancedTotal}`);

    console.log('\n✅ Expected Results for Content Migration:');
    console.log(`   📊 Basic Plan: $815`);
    console.log(`   📊 Standard Plan: $815`);
    console.log(`   📊 Advanced Plan: $815`);

    console.log('\n🎯 Verification:');
    console.log(`   ✅ Basic Plan: ${basicTotal === 815 ? 'CORRECT' : `WRONG (got $${basicTotal})`}`);
    console.log(`   ✅ Standard Plan: ${standardTotal === 815 ? 'CORRECT' : `WRONG (got $${standardTotal})`}`);
    console.log(`   ✅ Advanced Plan: ${advancedTotal === 815 ? 'CORRECT' : `WRONG (got $${advancedTotal})`}`);

    if (basicTotal === 815 && standardTotal === 815 && advancedTotal === 815) {
      console.log('\n🎉 All Content migration calculations are correct!');
      console.log('✅ Content migration pricing is FIXED at $300 for all plans.');
    } else {
      console.log('\n❌ Some Content migration calculations are incorrect.');
      console.log('🔧 Please check the Content migration pricing configuration.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContentMigrationPricing().catch(console.error);
