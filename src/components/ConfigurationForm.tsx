import React, { useState } from 'react';
import { ConfigurationData } from '../types/pricing';
import { Calculator, Users, Server, Clock, Database, ArrowRight, Sparkles } from 'lucide-react';

interface ConfigurationFormProps {
  onConfigurationChange: (config: ConfigurationData) => void;
  onSubmit: () => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onConfigurationChange, onSubmit }) => {
  const [config, setConfig] = useState<ConfigurationData>({
    numberOfUsers: 1,
    instanceType: 'Small',
    numberOfInstances: 1,
    duration: 1,
    migrationType: 'Email',
    dataSizeGB: 100
  });

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
            FILL DETAILS HERE
          </h2>
          <p className="text-gray-600 mt-1">Configure your project requirements to get accurate pricing</p>
        </div>
      </div>

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
  );
};

export default ConfigurationForm;