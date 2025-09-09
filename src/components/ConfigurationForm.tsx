import React, { useState, useEffect } from 'react';
import { ConfigurationData } from '../types/pricing';
import { Calculator, Users, Server, Clock, Database, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

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
  onContactInfoChange?: (contactInfo: { clientName: string; clientEmail: string; company: string }) => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onConfigurationChange, onSubmit, dealData, onContactInfoChange }) => {
  const [config, setConfig] = useState<ConfigurationData>({
    numberOfUsers: 1,
    instanceType: 'Small',
    numberOfInstances: 1,
    duration: 1,
    migrationType: '' as any, // Start with empty to hide other fields
    dataSizeGB: 100
  });

  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    clientName: '',
    clientEmail: '',
    company: ''
  });

  // Initialize contact info from deal data
  useEffect(() => {
    if (dealData) {
      const initialContactInfo = {
        clientName: dealData.contactName || '',
        clientEmail: dealData.contactEmail || '',
        company: dealData.company || ''
      };
      console.log('🔍 ConfigurationForm: Initializing contact info from deal data:', initialContactInfo);
      setContactInfo(initialContactInfo);
      
      // Notify parent component of initial contact info
      if (onContactInfoChange) {
        console.log('✅ ConfigurationForm: Notifying parent of initial contact info:', initialContactInfo);
        onContactInfoChange(initialContactInfo);
      } else {
        console.log('⚠️ ConfigurationForm: No onContactInfoChange callback available for initial contact info');
      }
    } else {
      console.log('⚠️ ConfigurationForm: No deal data available for contact info initialization');
    }
  }, [dealData]); // Removed onContactInfoChange from dependencies



  const handleChange = (field: keyof ConfigurationData, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigurationChange(newConfig);
    
    // Auto-scroll down when migration type is selected
    if (field === 'migrationType' && value) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure DOM is updated
    }
  };

  const handleContactChange = (field: keyof typeof contactInfo, value: string) => {
    const newContactInfo = {
      ...contactInfo,
      [field]: value
    };
    console.log('🔍 ConfigurationForm: Contact info changed:', { field, value, newContactInfo });
    setContactInfo(newContactInfo);
    
    // Notify parent component of contact info changes
    if (onContactInfoChange) {
      console.log('✅ ConfigurationForm: Notifying parent of contact info change:', newContactInfo);
      onContactInfoChange(newContactInfo);
    } else {
      console.log('⚠️ ConfigurationForm: No onContactInfoChange callback available');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
    
    // Auto-scroll down after calculating pricing to show results
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 200); // Slightly longer delay to ensure pricing results are rendered
  };

  return (
    <div className="space-y-8">

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
                  <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
                  <p className="text-sm text-gray-600">Auto-filled from HubSpot deal data</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  value={contactInfo.clientName}
                  onChange={(e) => handleContactChange('clientName', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-800 font-medium focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors"
                  placeholder="Enter client name"
                />
              </div>
              
              {/* Client Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Email</label>
                <input
                  type="email"
                  value={contactInfo.clientEmail}
                  onChange={(e) => handleContactChange('clientEmail', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-800 font-medium focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors"
                  placeholder="Enter client email"
                />
              </div>
              
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={contactInfo.company}
                  onChange={(e) => handleContactChange('company', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-800 font-medium focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors"
                  placeholder="Enter company name"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>💡 Tip:</strong> This information is automatically synchronized from HubSpot. 
                You can edit these fields as needed. Any changes made in HubSpot will be reflected here when you refresh the deal data.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Migration Type - Primary Component */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-lg border border-teal-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Migration Type</h3>
              <p className="text-gray-600">Choose your migration type to configure the project requirements</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <label className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                Migration Type
              </label>
              <select
                value={config.migrationType}
                onChange={(e) => handleChange('migrationType', e.target.value as 'Content' | 'Email' | 'Messaging')}
                className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/90 backdrop-blur-sm hover:border-teal-300 text-lg font-medium"
              >
                <option value="">Select Migration Type</option>
                <option value="Content">Content</option>
                <option value="Email">Email</option>
                <option value="Messaging">Messaging</option>
              </select>
            </div>
          </div>

          {/* Other Configuration Fields - Conditional Rendering */}
          {config.migrationType && (
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-2xl shadow-2xl border border-blue-100/50 p-8 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Configuration</h3>
                <p className="text-gray-600">Configure your {config.migrationType.toLowerCase()} migration requirements</p>
              </div>
              
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

                {/* Data Size - Hide for Messaging migration type */}
                {config.migrationType !== 'Messaging' && (
                  <div className="group md:col-span-2">
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
                )}
              </div>
            </div>
          )}

          {/* Calculate Pricing Button - Only show when migration type is selected */}
          {config.migrationType && (
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
          )}
        </form>
      </div>
    </div>
  );
};

export default ConfigurationForm;