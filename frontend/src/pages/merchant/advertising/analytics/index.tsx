import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { format, subDays, parseISO } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon, CurrencyDollarIcon, EyeIcon, CursorClickIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';

// Import types and GraphQL
import { GET_CAMPAIGN_ANALYTICS } from '@/graphql/adCampaigns';
import { CampaignAnalytics, DailyPerformanceData, CampaignPerformance } from '@/types/adCampaigns';

// Component imports - using absolute paths to fix import issues
import AnalyticsChart from '../../../../components/merchant/AnalyticsChart';
import PerformanceMetricCard from '../../../../components/merchant/PerformanceMetricCard';

// Date range options for filtering
const dateRanges = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

const AnalyticsPage = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<CampaignAnalytics | null>(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Calculate date range based on selection
  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (selectedDateRange === 'custom') {
      setShowCustomDateRange(true);
      return;
    } else {
      setShowCustomDateRange(false);
    }

    switch (selectedDateRange) {
      case 'last7days':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        start = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'last90days':
        start = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 30));
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [selectedDateRange]);

  // Query for analytics data
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_ANALYTICS, {
    variables: { 
      merchantId: 'current-merchant-id',
      startDate,
      endDate
    },
    skip: !startDate || !endDate,
    onCompleted: (data) => {
      if (data?.campaignAnalytics) {
        setAnalyticsData(data.campaignAnalytics);
      }
    }
  });

  // Handle custom date range change
  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      refetch({
        merchantId: 'current-merchant-id',
        startDate,
        endDate
      });
    }
  };

  // Calculate performance changes
  const getPerformanceChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  return (
    <>
      <Head>
        <title>Campaign Analytics | Avnu Marketplace</title>
      </Head>
      <div>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Campaign Analytics</h1>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Date Range Selector */}
            <div className="mt-4 bg-white shadow rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">Date Range</label>
                  <select
                    id="dateRange"
                    name="dateRange"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    {dateRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {showCustomDateRange && (
                  <>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleCustomDateChange}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Apply
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="mt-6 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Loading analytics data...</p>
              </div>
            ) : error ? (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p>Error loading analytics data. Please try again.</p>
              </div>
            ) : analyticsData ? (
              <>
                {/* Performance Overview Cards */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <PerformanceMetricCard
                    title="Total Spent"
                    value={`$${analyticsData.totalSpent.toFixed(2)}`}
                    change={getPerformanceChange(analyticsData.totalSpent, analyticsData.previousPeriod.totalSpent)}
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
                    iconBgColor="bg-blue-500"
                  />
                  <PerformanceMetricCard
                    title="Impressions"
                    value={analyticsData.totalImpressions.toLocaleString()}
                    change={getPerformanceChange(analyticsData.totalImpressions, analyticsData.previousPeriod.totalImpressions)}
                    icon={<EyeIcon className="h-6 w-6 text-white" />}
                    iconBgColor="bg-indigo-500"
                  />
                  <PerformanceMetricCard
                    title="Clicks"
                    value={analyticsData.totalClicks.toLocaleString()}
                    change={getPerformanceChange(analyticsData.totalClicks, analyticsData.previousPeriod.totalClicks)}
                    icon={<CursorClickIcon className="h-6 w-6 text-white" />}
                    iconBgColor="bg-green-500"
                  />
                  <PerformanceMetricCard
                    title="Conversions"
                    value={analyticsData.totalConversions.toLocaleString()}
                    change={getPerformanceChange(analyticsData.totalConversions, analyticsData.previousPeriod.totalConversions)}
                    icon={<ShoppingCartIcon className="h-6 w-6 text-white" />}
                    iconBgColor="bg-purple-500"
                  />
                </div>

                {/* Performance Metrics */}
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Click-Through Rate (CTR)</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {analyticsData.ctr.toFixed(2)}%
                        </p>
                        <p className={`ml-2 text-sm ${analyticsData.ctr > analyticsData.previousPeriod.ctr ? 'text-green-600' : 'text-red-600'}`}>
                          {analyticsData.ctr > analyticsData.previousPeriod.ctr ? (
                            <ArrowUpIcon className="inline h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownIcon className="inline h-4 w-4 mr-1" />
                          )}
                          {Math.abs(getPerformanceChange(analyticsData.ctr, analyticsData.previousPeriod.ctr)).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {analyticsData.conversionRate.toFixed(2)}%
                        </p>
                        <p className={`ml-2 text-sm ${analyticsData.conversionRate > analyticsData.previousPeriod.conversionRate ? 'text-green-600' : 'text-red-600'}`}>
                          {analyticsData.conversionRate > analyticsData.previousPeriod.conversionRate ? (
                            <ArrowUpIcon className="inline h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownIcon className="inline h-4 w-4 mr-1" />
                          )}
                          {Math.abs(getPerformanceChange(analyticsData.conversionRate, analyticsData.previousPeriod.conversionRate)).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Return on Investment (ROI)</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {analyticsData.roi.toFixed(2)}x
                        </p>
                        <p className={`ml-2 text-sm ${analyticsData.roi > analyticsData.previousPeriod.roi ? 'text-green-600' : 'text-red-600'}`}>
                          {analyticsData.roi > analyticsData.previousPeriod.roi ? (
                            <ArrowUpIcon className="inline h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownIcon className="inline h-4 w-4 mr-1" />
                          )}
                          {Math.abs(getPerformanceChange(analyticsData.roi, analyticsData.previousPeriod.roi)).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Charts */}
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h2>
                  <div className="h-80">
                    <AnalyticsChart data={analyticsData.dailyData} />
                  </div>
                </div>

                {/* Top Performing Campaigns */}
                <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Top Performing Campaigns</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Impressions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clicks
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CTR
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conversions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Spent
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ROI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analyticsData.topCampaigns.map((campaign) => (
                          <tr key={campaign.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.impressions.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.clicks.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.ctr.toFixed(2)}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.conversions.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${campaign.spent.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.roi.toFixed(2)}x</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                <p>Select a date range to view analytics data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
