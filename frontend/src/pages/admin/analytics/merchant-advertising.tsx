import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

// Mock components for missing imports
interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => (
  <div className="admin-layout">
    <h1>{title}</h1>
    <div>{children}</div>
  </div>
);

const AnalyticsNav: React.FC = () => (
  <nav className="analytics-nav">
    <ul>
      <li>Dashboard</li>
      <li>Advanced Analytics</li>
      <li>Merchant Advertising</li>
    </ul>
  </nav>
);

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">Loading...</div>
);

// Import the MetricsTrendChart component
import MetricsTrendChart from '../../../components/analytics/MetricsTrendChart';

// Mock components for the analytics components
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
  dailyMetrics: any[];
}

interface HistoricalMetric {
  date: string;
  totalRevenue: number;
  totalCost: number;
  platformAdRevenue: number;
  productSalesFromAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
}

interface AdCampaignsListProps {
  campaigns: Campaign[];
  selectedCampaignId: string;
  onCampaignSelect: (campaignId: string) => void;
}

const AdCampaignsList: React.FC<AdCampaignsListProps> = ({ campaigns, selectedCampaignId, onCampaignSelect }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Ad Campaigns</h2>
    <ul>
      {campaigns.map(campaign => (
        <li 
          key={campaign.id}
          className={`p-2 cursor-pointer ${selectedCampaignId === campaign.id ? 'bg-gray-100' : ''}`}
          onClick={() => onCampaignSelect(campaign.id)}
        >
          {campaign.name}
        </li>
      ))}
    </ul>
  </div>
);

interface MerchantAdPerformanceProps {
  campaign: Campaign;
}

const MerchantAdPerformance: React.FC<MerchantAdPerformanceProps> = ({ campaign }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h2 className="text-lg font-medium text-gray-900 mb-4">{campaign.name}</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-500">Revenue</p>
        <p className="text-lg font-semibold">${campaign.totalRevenue.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">ROI</p>
        <p className="text-lg font-semibold">{campaign.roi.toFixed(2)}%</p>
      </div>
    </div>
  </div>
);

interface AdRevenueChartProps {
  dailyMetrics: any[];
}

const AdRevenueChart: React.FC<AdRevenueChartProps> = ({ dailyMetrics }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Over Time</h2>
    <div className="h-64 flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Chart visualization would appear here</p>
    </div>
  </div>
);

// GraphQL query for merchant ad metrics
const MERCHANT_AD_METRICS = gql`
  query MerchantAdMetrics($period: Int, $merchantId: String) {
    merchantAdMetrics(period: $period, merchantId: $merchantId) {
      campaigns {
        id
        name
        merchantName
        status
        startDate
        endDate
        totalImpressions
        totalClicks
        clickThroughRate
        totalConversions
        conversionRate
        totalRevenue
        totalCost
        roi
        dailyMetrics {
          date
          impressions
          clicks
          clickThroughRate
          conversions
          conversionRate
          revenue
          cost
          roi
        }
      }
      totalRevenue
      totalCost
      totalRoi
      totalImpressions
      totalClicks
      averageClickThroughRate
      totalConversions
      averageConversionRate
      platformAdRevenue
      productSalesFromAds
      returnOnAdSpend
      averageConversionValue
      costPerAcquisition
      historicalMetrics {
        date
        totalRevenue
        totalCost
        platformAdRevenue
        productSalesFromAds
        totalImpressions
        totalClicks
        totalConversions
      }
    }
  }
`;

// Mock merchants for the filter dropdown
const merchants = [
  { id: 'merchant-1', name: 'Eco Furnishings' },
  { id: 'merchant-2', name: 'Modern Home Décor' },
  { id: 'merchant-3', name: 'Artisan Crafts' },
  { id: 'merchant-4', name: 'Tech Gadgets Plus' },
  { id: 'merchant-5', name: 'Outdoor Living' }
];

const MerchantAdvertisingPage: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  // Fetch merchant ad metrics data
  const { data, loading, error } = useQuery(MERCHANT_AD_METRICS, {
    variables: { 
      period,
      merchantId: selectedMerchant || undefined
    },
    fetchPolicy: 'network-only',
  });

  // Handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(parseInt(e.target.value, 10));
  };

  // Handle merchant change
  const handleMerchantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMerchant(e.target.value);
    setSelectedCampaign(''); // Reset selected campaign when merchant changes
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId === selectedCampaign ? '' : campaignId);
  };

  // Filter campaigns based on selected merchant
  const filteredCampaigns = data?.merchantAdMetrics?.campaigns || [];
  
  // Get selected campaign data
  const selectedCampaignData = selectedCampaign 
    ? filteredCampaigns.find((campaign: any) => campaign.id === selectedCampaign)
    : null;

  // Render loading state
  if (loading) {
    return (
      <AdminLayout title="Merchant Advertising Analytics">
        <AnalyticsNav />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <AdminLayout title="Merchant Advertising Analytics">
        <AnalyticsNav />
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <h2 className="text-lg font-medium mb-2">Error loading advertising data</h2>
          <p>{error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Merchant Advertising Analytics">
      <AnalyticsNav />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Merchant Advertising Analytics</h1>
        <p className="text-gray-600">
          Monitor advertising performance, revenue, and conversion rates across merchant campaigns.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              id="period"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sage focus:ring-sage sm:text-sm"
              value={period}
              onChange={handlePeriodChange}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
              Merchant
            </label>
            <select
              id="merchant"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sage focus:ring-sage sm:text-sm"
              value={selectedMerchant}
              onChange={handleMerchantChange}
            >
              <option value="">All Merchants</option>
              {merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Aggregate Metrics Dashboard */}
      {data?.merchantAdMetrics && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Aggregate Performance Metrics</h2>
          
          {/* Platform Revenue vs Product Sales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Platform Ad Revenue</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-purple-900">${data.merchantAdMetrics.platformAdRevenue.toFixed(2)}</span>
                <span className="ml-2 text-sm text-purple-700">(15% of ad spend)</span>
              </div>
              <p className="text-xs text-purple-700 mt-1">Revenue Avnu makes from ads</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Product Sales from Ads</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-900">${data.merchantAdMetrics.productSalesFromAds.toFixed(2)}</span>
                <span className="ml-2 text-sm text-green-700">(ROAS: {data.merchantAdMetrics.returnOnAdSpend.toFixed(2)}x)</span>
              </div>
              <p className="text-xs text-green-700 mt-1">Revenue generated from products sold via ads</p>
            </div>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Total Ad Spend</h3>
              <p className="text-xl font-semibold text-gray-900">${data.merchantAdMetrics.totalCost.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Total Conversions</h3>
              <p className="text-xl font-semibold text-gray-900">{data.merchantAdMetrics.totalConversions.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Cost Per Acquisition</h3>
              <p className="text-xl font-semibold text-gray-900">${data.merchantAdMetrics.costPerAcquisition.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Avg. Conversion Value</h3>
              <p className="text-xl font-semibold text-gray-900">${data.merchantAdMetrics.averageConversionValue.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Total Impressions</h3>
              <p className="text-xl font-semibold text-gray-900">{data.merchantAdMetrics.totalImpressions.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Total Clicks</h3>
              <p className="text-xl font-semibold text-gray-900">{data.merchantAdMetrics.totalClicks.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Avg. Click-Through Rate</h3>
              <p className="text-xl font-semibold text-gray-900">{data.merchantAdMetrics.averageClickThroughRate.toFixed(2)}%</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Avg. Conversion Rate</h3>
              <p className="text-xl font-semibold text-gray-900">{data.merchantAdMetrics.averageConversionRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Historical Trends */}
      {data?.merchantAdMetrics?.historicalMetrics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsTrendChart 
              historicalMetrics={data.merchantAdMetrics.historicalMetrics}
              metricType="platform"
              title="Platform Revenue vs Product Sales"
            />
            <MetricsTrendChart 
              historicalMetrics={data.merchantAdMetrics.historicalMetrics}
              metricType="revenue"
              title="Ad Revenue vs Cost"
            />
            <MetricsTrendChart 
              historicalMetrics={data.merchantAdMetrics.historicalMetrics}
              metricType="conversions"
              title="Clicks vs Conversions"
            />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad Campaigns List */}
        <div className="lg:col-span-1">
          <AdCampaignsList 
            campaigns={filteredCampaigns}
            selectedCampaignId={selectedCampaign}
            onCampaignSelect={handleCampaignSelect}
          />
        </div>
        
        {/* Campaign Performance & Charts */}
        <div className="lg:col-span-2">
          {selectedCampaignData ? (
            <div className="space-y-6">
              <MerchantAdPerformance campaign={selectedCampaignData} />
              <AdRevenueChart dailyMetrics={selectedCampaignData.dailyMetrics} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Details</h3>
                <p className="text-gray-500">Select a campaign from the list to view detailed performance metrics</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MerchantAdvertisingPage;
