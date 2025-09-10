import React from 'react';
import { PricingCalculation, ConfigurationData } from '../types/pricing';
import { formatCurrency } from '../utils/pricing';

interface PricingComparisonProps {
  calculations: PricingCalculation[];
  recommendedTier: PricingCalculation;
  onSelectTier: (calculation: PricingCalculation) => void;
  configuration?: ConfigurationData;
}

const PricingComparison: React.FC<PricingComparisonProps> = ({
  calculations,
  onSelectTier
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
        {calculations.map((calc) => {
          
          return (
            <div
              key={calc.tier.id}
              className="relative rounded-2xl border-2 border-gray-200 bg-white p-8 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 hover:border-blue-300"
            >

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {calc.tier.name}
                </h3>
                <div className="text-4xl font-bold mb-2 text-gray-900">
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
                className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
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