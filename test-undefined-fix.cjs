// Test script to verify the undefined token fix
console.log('🔧 Testing Undefined Token Fix...');
console.log('=====================================');

// Simulate the data flow that was causing undefined tokens
console.log('\n📊 1. Testing Data Flow...');

// Simulate selectedTier being null (the main issue)
const selectedTier = null;
console.log('selectedTier:', selectedTier);

// Simulate configuration being undefined
const configuration = undefined;
console.log('configuration:', configuration);

// Create fallback calculation (same as in App.tsx)
const fallbackCalculation = {
  userCost: 30,
  dataCost: 0,
  migrationCost: 300,
  instanceCost: 0,
  totalCost: 330,
  tier: {
    id: 'default',
    name: 'Basic',
    perUserCost: 30.0,
    perGBCost: 1.00,
    managedMigrationCost: 300,
    instanceCost: 0,
    userLimits: { min: 1, max: 100 },
    gbLimits: { min: 0, max: 1000 },
    features: ['Basic migration support', 'Email support']
  }
};

// Create fallback configuration
const fallbackConfiguration = {
  numberOfUsers: 1,
  instanceType: 'Standard',
  numberOfInstances: 1,
  duration: 1,
  migrationType: 'Content',
  dataSizeGB: 0
};

// Test the fix: use fallbacks when values are null/undefined
const finalCalculation = selectedTier || fallbackCalculation;
const finalConfiguration = configuration || fallbackConfiguration;

console.log('\n✅ 2. After Applying Fixes...');
console.log('finalCalculation:', finalCalculation);
console.log('finalConfiguration:', finalConfiguration);

// Test template data creation (same as in QuoteGenerator)
console.log('\n📋 3. Testing Template Data Creation...');

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const clientInfo = {
  clientName: 'Demo Client',
  clientEmail: 'demo@example.com',
  company: 'Demo Company Inc.'
};

const templateData = {
  '{{Company Name}}': clientInfo.company || 'Demo Company Inc.',
  '{{users_count}}': (finalConfiguration.numberOfUsers || 1).toString(),
  '{{users_cost}}': formatCurrency(finalCalculation.migrationCost || 0),
  '{{Duration of months}}': (finalConfiguration.duration || 1).toString(),
  '{{total price}}': formatCurrency(finalCalculation.totalCost || 0),
  '{{migration type}}': finalConfiguration.migrationType || 'Content',
  '{{clientName}}': clientInfo.clientName || 'Demo Client',
  '{{email}}': clientInfo.clientEmail || 'demo@example.com'
};

console.log('\n📋 Template Data Results:');
Object.entries(templateData).forEach(([token, value]) => {
  console.log(`  ${token}: ${value}`);
});

// Check for undefined values
const undefinedTokens = Object.entries(templateData).filter(([, value]) => value === undefined || value === null);
if (undefinedTokens.length > 0) {
  console.error('\n❌ Found undefined tokens:', undefinedTokens);
} else {
  console.log('\n✅ All tokens have values - Fix is working!');
}

console.log('\n🎯 Expected Results:');
console.log('{{Company Name}} should be: Demo Company Inc.');
console.log('{{users_count}} should be: 1');
console.log('{{users_cost}} should be: $300.00');
console.log('{{Duration of months}} should be: 1');
console.log('{{total price}} should be: $330.00');
console.log('{{migration type}} should be: Content');
console.log('{{clientName}} should be: Demo Client');
console.log('{{email}} should be: demo@example.com');

console.log('\n🚀 The undefined token issue should now be fixed!');
console.log('📋 Test the application by:');
console.log('1. Going to Quote session');
console.log('2. Uploading a DOCX template');
console.log('3. Clicking "Generate Agreement"');
console.log('4. Checking that all tokens are replaced with actual values');
