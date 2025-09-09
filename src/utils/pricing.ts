import { PricingTier, ConfigurationData, PricingCalculation } from '../types/pricing';

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    perUserCost: 30.0,
    perGBCost: 1.00,
    managedMigrationCost: 300,
    instanceCost: 500,
    userLimits: { from: 1, to: 1000 },
    gbLimits: { from: 1, to: 10000 },
    features: [
      'Basic support',
      'Standard migration',
      'Email support',
      'Basic reporting'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    perUserCost: 35.0,
    perGBCost: 1.50,
    managedMigrationCost: 300,
    instanceCost: 500,
    userLimits: { from: 1, to: 1000 },
    gbLimits: { from: 1, to: 10000 },
    features: [
      'Priority support',
      'Advanced migration',
      'Phone & email support',
      'Advanced reporting',
      'Custom integrations'
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    perUserCost: 40.0,
    perGBCost: 1.80,
    managedMigrationCost: 300,
    instanceCost: 500,
    userLimits: { from: 1, to: 1000 },
    gbLimits: { from: 1, to: 10000 },
    features: [
      'Dedicated support',
      'Premium migration',
      '24/7 phone support',
      'Enterprise reporting',
      'Full customization',
      'SLA guarantee'
    ]
  }
];

export function calculatePricing(config: ConfigurationData, tier: PricingTier): PricingCalculation {
  // Check if the configuration falls within the tier's limits
  const isUserInRange = config.numberOfUsers >= tier.userLimits.from && config.numberOfUsers <= tier.userLimits.to;
  const isGBInRange = config.dataSizeGB >= tier.gbLimits.from && config.dataSizeGB <= tier.gbLimits.to;
  
  // If configuration is outside the tier's limits, return null or apply penalties
  if (!isUserInRange || !isGBInRange) {
    // For now, we'll still calculate but this could be enhanced with penalties or warnings
    console.warn(`Configuration outside ${tier.name} tier limits: Users ${config.numberOfUsers} (${tier.userLimits.from}-${tier.userLimits.to}), GB ${config.dataSizeGB} (${tier.gbLimits.from}-${tier.gbLimits.to})`);
  }
  
  // Calculate instance cost based on instance type and duration (as per requirements)
  const getInstanceCost = (instanceType: string, duration: number): number => {
    const baseCost = (() => {
      switch (instanceType) {
        case 'Small':
          return 500; // Base cost for Small instance
        case 'Standard':
          return 1000; // Base cost for Standard instance
        case 'Large':
          return 2000; // Base cost for Large instance
        case 'Extra Large':
          return 3500; // Base cost for Extra Large instance
        default:
          return 500; // Default to Small instance cost
      }
    })();
    
    // Calculate total instance cost based on duration
    return baseCost * duration;
  };

  // Calculate migration cost based on migration type and tier
  const getMigrationCost = (migrationType: string, tier: PricingTier): number => {
    switch (migrationType) {
      case 'Content':
        return 300; // Fixed cost for Content migration across all tiers
      case 'Email':
        // Email migration costs vary by plan
        switch (tier.name) {
          case 'Basic':
            return 400;
          case 'Standard':
            return 600;
          case 'Advanced':
            return 800;
          default:
            return 400;
        }
      case 'Messaging':
        // Messaging migration costs vary by plan
        switch (tier.name) {
          case 'Basic':
            return 500;
          case 'Standard':
            return 700;
          case 'Advanced':
            return 900;
          default:
            return 500;
        }
      default:
        return 300; // Default to Content migration cost
    }
  };
  
  // Helper function to get pricing based on migration type
  const getPricingForMigrationType = (migrationType: string, tierName: string) => {
    switch (migrationType) {
      case 'Content':
        return {
          perUserCost: tierName === 'Basic' ? 30.0 : tierName === 'Standard' ? 35.0 : 40.0,
          perGBCost: tierName === 'Basic' ? 1.00 : tierName === 'Standard' ? 1.50 : 1.80,
          migrationCost: 300
        };
      case 'Email':
        return {
          perUserCost: 15.0, // Same for all tiers
          perGBCost: 0.00, // Same for all tiers
          migrationCost: tierName === 'Basic' ? 400 : tierName === 'Standard' ? 600 : 800
        };
      case 'Messaging':
        return {
          perUserCost: tierName === 'Basic' ? 18.0 : tierName === 'Standard' ? 22.0 : 34.0,
          perGBCost: 0.00, // Same for all tiers
          migrationCost: tierName === 'Basic' ? 400 : tierName === 'Standard' ? 600 : 800
        };
      default:
        return {
          perUserCost: 30.0,
          perGBCost: 1.00,
          migrationCost: 300
        };
    }
  };
  
  // Get pricing based on migration type
  const pricing = getPricingForMigrationType(config.migrationType, tier.name);
  
  // Calculate costs using the exact formulas from the image:
  // Total User Cost = Number of Users × Per User Cost (fixed, not multiplied by duration)
  const userCost = config.numberOfUsers * pricing.perUserCost;
  
  // Data Cost = Data Size GB × Per GB Cost
  const dataCost = config.dataSizeGB * pricing.perGBCost;
  
  // Managed Migration Cost = Fixed cost based on migration type and tier
  const migrationCost = pricing.migrationCost;
  
  // Debug: Log the migration cost calculation
  console.log(`🔍 Migration cost calculation: ${config.migrationType} migration for ${tier.name} plan = $${migrationCost}`);
  
  // Instance Cost = Base cost based on instance type × Duration × Number of Instances
  const instanceCost = getInstanceCost(config.instanceType, config.duration) * config.numberOfInstances;
  
  // TOTAL COST = User Cost + Data Cost + Migration Cost + Instance Cost
  const totalCost = userCost + dataCost + migrationCost + instanceCost;

  console.log(`📊 Pricing calculation for ${tier.name} plan (${config.migrationType} migration):`);
  console.log(`   Users: ${config.numberOfUsers} × $${pricing.perUserCost} = $${userCost}`);
  console.log(`   Data: ${config.dataSizeGB} GB × $${pricing.perGBCost} = $${dataCost}`);
  console.log(`   Migration: $${migrationCost} (${config.migrationType}) - Tier: ${tier.name}`);
  console.log(`   Instance: ${config.numberOfInstances} × $${getInstanceCost(config.instanceType, config.duration)} (${config.instanceType} × ${config.duration} months) = $${instanceCost}`);
  console.log(`   Total: $${totalCost}`);

  return {
    userCost,
    dataCost,
    migrationCost,
    instanceCost,
    totalCost,
    tier
  };
}

export function calculateAllTiers(config: ConfigurationData, tiers: PricingTier[] = PRICING_TIERS): PricingCalculation[] {
  return tiers.map(tier => calculatePricing(config, tier));
}

export function getRecommendedTier(calculations: PricingCalculation[]): PricingCalculation {
  // Logic: Recommend Standard if total cost is reasonable, Basic for small projects, Advanced for large
  const standardCalc = calculations.find(calc => calc.tier.name === 'Standard');
  return standardCalc || calculations[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}