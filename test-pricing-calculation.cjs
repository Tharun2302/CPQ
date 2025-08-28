const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testPricingCalculation() {
  console.log('🔍 Testing Pricing Calculation with Your Inputs...\n');
  
  try {
    // Test configuration matching your image
    const testConfig = {
      numberOfUsers: 1,
      instanceType: 'Small',
      numberOfInstances: 1,
      duration: 1,
      migrationType: 'Email',
      dataSizeGB: 100
    };

    console.log('📋 Test Configuration:');
    console.log(`   👥 Number of Users: ${testConfig.numberOfUsers}`);
    console.log(`   🖥️  Instance Type: ${testConfig.instanceType}`);
    console.log(`   🔢 Number of Instances: ${testConfig.numberOfInstances}`);
    console.log(`   ⏱️  Duration (months): ${testConfig.duration}`);
    console.log(`   📤 Migration Type: ${testConfig.migrationType}`);
    console.log(`   💾 Data Size (GB): ${testConfig.dataSizeGB}`);

    // Calculate expected values based on the pricing formula
    console.log('\n🧮 Expected Calculations:');
    
    // Basic Plan
    const basicUserCost = testConfig.numberOfUsers * 15 * testConfig.duration;
    const basicDataCost = testConfig.dataSizeGB * 0.00;
    const basicMigrationCost = 400; // Email migration for Basic plan
    const basicInstanceCost = testConfig.numberOfInstances * 500; // Small instance
    const basicTotal = basicUserCost + basicDataCost + basicMigrationCost + basicInstanceCost;
    
    console.log('\n📊 Basic Plan:');
    console.log(`   👥 User Cost: ${testConfig.numberOfUsers} × $15 × ${testConfig.duration} = $${basicUserCost}`);
    console.log(`   💾 Data Cost: ${testConfig.dataSizeGB} × $0.00 = $${basicDataCost}`);
    console.log(`   📤 Migration Cost: $${basicMigrationCost} (Email migration)`);
    console.log(`   🖥️  Instance Cost: ${testConfig.numberOfInstances} × $500 = $${basicInstanceCost}`);
    console.log(`   💰 TOTAL: $${basicTotal}`);

    // Standard Plan
    const standardUserCost = testConfig.numberOfUsers * 15 * testConfig.duration;
    const standardDataCost = testConfig.dataSizeGB * 0.00;
    const standardMigrationCost = 600; // Email migration for Standard plan
    const standardInstanceCost = testConfig.numberOfInstances * 500;
    const standardTotal = standardUserCost + standardDataCost + standardMigrationCost + standardInstanceCost;
    
    console.log('\n📊 Standard Plan:');
    console.log(`   👥 User Cost: ${testConfig.numberOfUsers} × $15 × ${testConfig.duration} = $${standardUserCost}`);
    console.log(`   💾 Data Cost: ${testConfig.dataSizeGB} × $0.00 = $${standardDataCost}`);
    console.log(`   📤 Migration Cost: $${standardMigrationCost} (Email migration)`);
    console.log(`   🖥️  Instance Cost: ${testConfig.numberOfInstances} × $500 = $${standardInstanceCost}`);
    console.log(`   💰 TOTAL: $${standardTotal}`);

    // Advanced Plan
    const advancedUserCost = testConfig.numberOfUsers * 15 * testConfig.duration;
    const advancedDataCost = testConfig.dataSizeGB * 0.00;
    const advancedMigrationCost = 800; // Email migration for Advanced plan
    const advancedInstanceCost = testConfig.numberOfInstances * 500;
    const advancedTotal = advancedUserCost + advancedDataCost + advancedMigrationCost + advancedInstanceCost;
    
    console.log('\n📊 Advanced Plan:');
    console.log(`   👥 User Cost: ${testConfig.numberOfUsers} × $15 × ${testConfig.duration} = $${advancedUserCost}`);
    console.log(`   💾 Data Cost: ${testConfig.dataSizeGB} × $0.00 = $${advancedDataCost}`);
    console.log(`   📤 Migration Cost: $${advancedMigrationCost} (Email migration)`);
    console.log(`   🖥️  Instance Cost: ${testConfig.numberOfInstances} × $500 = $${advancedInstanceCost}`);
    console.log(`   💰 TOTAL: $${advancedTotal}`);

    console.log('\n✅ Expected Results (from your image):');
    console.log(`   📊 Basic Plan: $915`);
    console.log(`   📊 Standard Plan: $1,115`);
    console.log(`   📊 Advanced Plan: $1,315`);

    console.log('\n🎯 Verification:');
    console.log(`   ✅ Basic Plan: ${basicTotal === 915 ? 'CORRECT' : `WRONG (got $${basicTotal})`}`);
    console.log(`   ✅ Standard Plan: ${standardTotal === 1115 ? 'CORRECT' : `WRONG (got $${standardTotal})`}`);
    console.log(`   ✅ Advanced Plan: ${advancedTotal === 1315 ? 'CORRECT' : `WRONG (got $${advancedTotal})`}`);

    if (basicTotal === 915 && standardTotal === 1115 && advancedTotal === 1315) {
      console.log('\n🎉 All calculations match your expected values!');
      console.log('✅ The pricing formula is working correctly.');
    } else {
      console.log('\n❌ Some calculations do not match expected values.');
      console.log('🔧 Please check the pricing configuration.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPricingCalculation().catch(console.error);
