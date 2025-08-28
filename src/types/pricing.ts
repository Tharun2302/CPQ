export interface UserLimits {
  from: number;
  to: number;
}

export interface GBLimits {
  from: number;
  to: number;
}

export interface PricingTier {
  id: string;
  name: 'Basic' | 'Standard' | 'Advanced';
  perUserCost: number;
  perGBCost: number;
  managedMigrationCost: number;
  instanceCost: number;
  userLimits: UserLimits;
  gbLimits: GBLimits;
  features: string[];
}

export interface PricingTierConfiguration {
  id: string;
  name: string;
  description?: string;
  tiers: PricingTier[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface ConfigurationData {
  numberOfUsers: number;
  instanceType: 'Small' | 'Standard' | 'Large' | 'Extra Large';
  numberOfInstances: number;
  duration: number;
  migrationType: 'Content' | 'Email' | 'Messaging';
  dataSizeGB: number;
}

export interface PricingCalculation {
  userCost: number;
  dataCost: number;
  migrationCost: number;
  instanceCost: number;
  totalCost: number;
  tier: PricingTier;
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  company: string;
  configuration: ConfigurationData;
  selectedTier: PricingTier;
  calculation: PricingCalculation;
  createdAt: Date;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  signatureUrl?: string;
  templateUsed?: {
    id: string;
    name: string;
    isDefault: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}