import React from 'react';
import { PricingCalculation, ConfigurationData } from '../types/pricing';
import { formatCurrency } from '../utils/pricing';
import { Crown, Star, Zap, Award, Shield } from 'lucide-react';

interface PricingComparisonProps {
  calculations: PricingCalculation[];
  recommendedTier: PricingCalculation;
  onSelectTier: (calculation: PricingCalculation) => void;
  configuration?: ConfigurationData;
}

const PricingComparison: React.FC<PricingComparisonProps> = ({
  calculations,
  recommendedTier,
  onSelectTier,
  configuration
}) => {
  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl shadow-2xl border border-slate-200/50 p-8 backdrop-blur-sm">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
          Choose Your Perfect Plan
        </h2>
        <p className="text-gray-600 text-lg">Compare our pricing tiers and find the best fit for your project</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {calculations.map((calc, index) => {
          const isRecommended = calc.tier.id === recommendedTier.tier.id;
          const isPremium = calc.tier.name === 'Advanced';
          const isBasic = calc.tier.name === 'Basic';
          
          return (
            <div
              key={calc.tier.id}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 ${
                isRecommended
                  ? 'border-green-400 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 scale-105 shadow-xl'
                  : isPremium
                  ? 'border-purple-300 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 hover:border-purple-400'
                  : 'border-blue-200 bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50 hover:border-blue-300'
              }`}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
              
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    RECOMMENDED
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-4 right-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}

              {isBasic && (
                <div className="absolute -top-4 right-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-3 ${
                  isPremium ? 'text-purple-700' : isRecommended ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {calc.tier.name}
                  {isPremium && <span className="text-sm ml-2 opacity-75">PREMIUM</span>}
                </h3>
                <div className={`text-4xl font-bold mb-2 ${
                  isPremium ? 'text-purple-600' : isRecommended ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {formatCurrency(calc.totalCost)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total project cost</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                  <span className="text-gray-700 font-medium">User costs:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(calc.userCost)}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                  <span className="text-gray-700 font-medium">Data costs:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(calc.dataCost)}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                  <span className="text-gray-700 font-medium">Migration:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(calc.migrationCost)}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white/60 rounded-lg p-3">
                  <span className="text-gray-700 font-medium">Instances:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(calc.instanceCost)}</span>
                </div>
              </div>


              <button
                onClick={() => onSelectTier(calc)}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group ${
                  isRecommended
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    : isPremium
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isPremium && <Crown className="w-5 h-5" />}
                  {isRecommended && <Award className="w-5 h-5" />}
                  {isBasic && <Shield className="w-5 h-5" />}
                  Select {calc.tier.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingComparison;