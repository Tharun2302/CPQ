import React, { useState, useEffect } from 'react';
import { 
  Building, 
  User, 
  DollarSign, 
  Calendar, 
  Target, 
  UserCheck,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

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
}

interface DealDetailsProps {
  dealData?: DealData | null;
  onRefresh?: () => void;
}

const DealDetails: React.FC<DealDetailsProps> = ({ dealData, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔍 DealDetails render - dealData:', dealData);

  if (!dealData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Deal Information
          </h2>
        </div>
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No deal information available</p>
          <p className="text-sm text-gray-400 mt-1">
            Deal details will appear here when accessed from HubSpot
          </p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      await onRefresh();
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-lg border border-blue-100 p-8">
      <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-sm text-yellow-800">Debug: DealDetails component is rendering</p>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deal Information</h2>
            <p className="text-gray-600">HubSpot Deal Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href={`https://app.hubspot.com/contacts/_/deal/${dealData.dealId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View in HubSpot
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal ID */}
        <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Deal ID</p>
            <p className="font-semibold text-gray-900 text-lg">{dealData.dealId}</p>
          </div>
        </div>

        {/* Deal Name */}
        <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Deal Name</p>
            <p className="font-semibold text-gray-900 text-lg">{dealData.dealName}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Amount</p>
            <p className="font-semibold text-gray-900 text-lg">{dealData.amount}</p>
          </div>
        </div>

        {/* Stage */}
        {dealData.stage && (
          <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Stage</p>
              <p className="font-semibold text-gray-900 text-lg">{dealData.stage}</p>
            </div>
          </div>
        )}

        {/* Close Date */}
        {dealData.closeDate && (
          <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Close Date</p>
              <p className="font-semibold text-gray-900 text-lg">
                {new Date(dealData.closeDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Owner */}
        {dealData.ownerId && (
          <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Owner ID</p>
              <p className="font-semibold text-gray-900 text-lg">{dealData.ownerId}</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <button className="px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
              Create Quote
            </button>
            <button className="px-6 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              Export Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetails;
