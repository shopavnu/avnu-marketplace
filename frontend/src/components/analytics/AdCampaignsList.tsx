import React from 'react';
import { ChartBarIcon, CheckCircleIcon, PauseCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  merchantName: string;
  status: string;
  startDate: string;
  endDate?: string;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCost: number;
  roi: number;
}

interface AdCampaignsListProps {
  campaigns: Campaign[];
  selectedCampaignId: string;
  onCampaignSelect: (campaignId: string) => void;
}

const AdCampaignsList: React.FC<AdCampaignsListProps> = ({
  campaigns,
  selectedCampaignId,
  onCampaignSelect
}) => {
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'paused':
        return <PauseCircleIcon className="h-5 w-5 text-amber-500" />;
      case 'completed':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Ad Campaigns</h2>
        <p className="text-sm text-gray-500 mt-1">
          {campaigns.length} campaigns found
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No campaigns found</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[600px]">
          <ul className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li 
                key={campaign.id}
                className={`
                  p-4 hover:bg-gray-50 cursor-pointer transition-colors
                  ${selectedCampaignId === campaign.id ? 'bg-gray-50 border-l-4 border-sage' : ''}
                `}
                onClick={() => onCampaignSelect(campaign.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{campaign.name}</h3>
                  <div className="flex items-center">
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1 text-xs text-gray-500 capitalize">{campaign.status}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mb-2">
                  {campaign.merchantName} • {campaign.startDate} to {campaign.endDate || 'Present'}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Revenue:</span>{' '}
                    <span className="font-medium text-gray-900">{formatCurrency(campaign.totalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ROI:</span>{' '}
                    <span className={`font-medium ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {campaign.roi.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clicks:</span>{' '}
                    <span className="font-medium text-gray-900">{campaign.totalClicks.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">CTR:</span>{' '}
                    <span className="font-medium text-gray-900">{campaign.clickThroughRate.toFixed(2)}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdCampaignsList;
