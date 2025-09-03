import React, { useState, useEffect } from 'react';
import { ConfigurationData } from '../types/pricing';
import { Calculator, Users, Server, Clock, Database, ArrowRight, Sparkles, Building, DollarSign, Calendar, Target, UserCheck } from 'lucide-react';

interface DealData {
  dealId: string;
  dealName: string;
  amount: string;
  closeDate?: string;
  stage?: string;
  ownerId?: string;
  company?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactJobTitle?: string;
  companyDomain?: string;
  companyPhone?: string;
  companyAddress?: string;
}

interface ConfigurationFormProps {
  onConfigurationChange: (config: ConfigurationData) => void;
  onSubmit: () => void;
  dealData?: DealData | null;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onConfigurationChange, onSubmit, dealData }) => {
  const [config, setConfig] = useState<ConfigurationData>({
    numberOfUsers: 1,
    instanceType: 'Small',
    numberOfInstances: 1,
    duration: 1,
    migrationType: 'Email',
    dataSizeGB: 100
  });

  // Store suggested configuration based on deal data
  const [suggestedConfig, setSuggestedConfig] = useState<ConfigurationData | null>(null);

  // Calculate suggested configuration based on deal data
  useEffect(() => {
    if (dealData) {
      // Extract numeric values from deal amount for configuration
      const amountValue = parseFloat(dealData.amount.replace(/[$,]/g, ''));
      
      // Set reasonable defaults based on deal amount
      let estimatedUsers = 10;
      let estimatedDataSize = 100;
      let estimatedDuration = 12;
      
      if (amountValue > 50000) {
        estimatedUsers = 100;
        estimatedDataSize = 1000;
        estimatedDuration = 24;
      } else if (amountValue > 25000) {
        estimatedUsers = 50;
        estimatedDataSize = 500;
        estimatedDuration = 18;
      } else if (amountValue > 10000) {
        estimatedUsers = 25;
        estimatedDataSize = 250;
        estimatedDuration = 12;
      }
      
      const suggested = {
        numberOfUsers: estimatedUsers,
        dataSizeGB: estimatedDataSize,
        duration: estimatedDuration,
        instanceType: config.instanceType,
        numberOfInstances: config.numberOfInstances,
        migrationType: config.migrationType
      };
      
      setSuggestedConfig(suggested);
    }
  }, [dealData]);

  // Apply suggested configuration
  const applySuggestedConfig = () => {
    if (suggestedConfig) {
      const newConfig = { ...config, ...suggestedConfig };
      setConfig(newConfig);
      onConfigurationChange(newConfig);
    }
  };

  const handleChange = (field: keyof ConfigurationData, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigurationChange(newConfig);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="space-y-8">
      {/* Deal Information Section */}
      {dealData && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Deal Information</h3>
                <p className="text-gray-600">Configuration based on deal: {dealData.dealName}</p>
              </div>
            </div>
            {suggestedConfig && (
              <button
                onClick={applySuggestedConfig}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Apply Suggested Config
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center p-3 bg-white/60 rounded-lg border border-purple-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Deal ID</p>
                <p className="font-semibold text-gray-900">{dealData.dealId}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-white/60 rounded-lg border border-purple-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <Building className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Deal Name</p>
                <p className="font-semibold text-gray-900 text-sm">{dealData.dealName}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-white/60 rounded-lg border border-purple-200">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Deal Amount</p>
                <p className="font-semibold text-gray-900">{dealData.amount}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-white/60 rounded-lg border border-purple-200">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Stage</p>
                <p className="font-semibold text-gray-900">{dealData.stage || 'Not Set'}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {dealData.ownerId && (
              <div className="flex items-center p-3 bg-white/60 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Owner ID</p>
                  <p className="font-semibold text-gray-900">{dealData.ownerId}</p>
                </div>
              </div>
            )}
            
            {dealData.closeDate && (
              <div className="flex items-center p-3 bg-white/60 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Close Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(dealData.closeDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          

        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-2xl shadow-2xl border border-blue-100/50 p-8 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              {dealData ? 'CONFIGURE PROJECT' : 'FILL DETAILS HERE'}
            </h2>
            <p className="text-gray-600 mt-1">
              {dealData 
                ? `Configure project requirements for deal: ${dealData.dealName}`
                : 'Configure your project requirements to get accurate pricing'
              }
            </p>
          </div>
        </div>

        {/* Client Information Section - Auto-filled from HubSpot */}
        {dealData && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Client Information</h3>
                  <p className="text-sm text-gray-600">Auto-filled from HubSpot deal data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  HubSpot Sync
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
                <div className="px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-800 font-medium">
                  {dealData.contactName || 'Not Available'}
                </div>
              </div>
              
              {/* Client Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Email</label>
                <div className="px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-800 font-medium">
                  {dealData.contactEmail || 'Not Available'}
                </div>
              </div>
              
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <div className="px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-800 font-medium">
                  {dealData.company || 'Not Available'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>💡 Tip:</strong> This information is automatically synchronized from HubSpot. 
                Any changes made in HubSpot will be reflected here when you refresh the deal data.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Number of Users */}
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Number of Users
              </label>
              <input
                type="number"
                min="1"
                value={config.numberOfUsers}
                onChange={(e) => handleChange('numberOfUsers', parseInt(e.target.value) || 1)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder="Enter number of users"
              />
            </div>

            {/* Instance Type */}
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Server className="w-4 h-4 text-white" />
                </div>
                Instance Type
              </label>
              <select
                value={config.instanceType}
                onChange={(e) => handleChange('instanceType', e.target.value as 'Small' | 'Standard' | 'Large' | 'Extra Large')}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
              >
                <option value="Small">Small</option>
                <option value="Standard">Standard</option>
                <option value="Large">Large</option>
                <option value="Extra Large">Extra Large</option>
              </select>
            </div>

            {/* Number of Instances */}
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Server className="w-4 h-4 text-white" />
                </div>
                Number of Instances
              </label>
              <input
                type="number"
                min="1"
                value={config.numberOfInstances}
                onChange={(e) => handleChange('numberOfInstances', parseInt(e.target.value) || 1)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder="Enter number of instances"
              />
            </div>

            {/* Duration */}
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Duration of Project in Months
              </label>
              <input
                type="number"
                min="1"
                value={config.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 1)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder="Enter project duration"
              />
            </div>

            {/* Migration Type */}
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                Migration Type
              </label>
              <select
                value={config.migrationType}
                onChange={(e) => handleChange('migrationType', e.target.value as 'Content' | 'Email' | 'Messaging')}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
              >
                <option value="Content">Content</option>
                <option value="Email">Email</option>
                <option value="Messaging">Messaging</option>
              </select>
            </div>

            {/* Data Size */}
            <div className="group">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Database className="w-4 h-4 text-white" />
                </div>
                Data Size GB ({config.migrationType})
              </label>
              <input
                type="number"
                min="1"
                value={config.dataSizeGB}
                onChange={(e) => handleChange('dataSizeGB', parseInt(e.target.value) || 1)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-lg font-medium"
                placeholder={`Enter data size in GB for ${config.migrationType} migration`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center gap-3">
              <Calculator className="w-5 h-5" />
              Calculate Pricing
              <Sparkles className="w-5 h-5" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationForm;