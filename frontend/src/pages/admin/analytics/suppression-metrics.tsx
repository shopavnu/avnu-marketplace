import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNav from '../../../components/admin/AnalyticsNav';

// Define TypeScript interfaces for our data structures
interface SuppressionOverview {
  totalSuppressedProducts: number;
  totalActiveSuppressedProducts: number;
  totalResolvedSuppressions: number;
  avgResolutionTimeHours: number;
  suppressionRate: number;
}

interface MerchantSuppressionMetrics {
  merchantId: string;
  merchantName: string;
  suppressedCount: number;
  resolvedCount: number;
  avgResolutionTimeHours: number;
  suppressionRate: number;
}

interface CategorySuppressionMetrics {
  categoryId: string;
  categoryName: string;
  suppressedCount: number;
  resolvedCount: number;
  avgResolutionTimeHours: number;
  suppressionRate: number;
}

interface TimeframeSuppressionMetrics {
  date: string;
  suppressedCount: number;
  resolvedCount: number;
  avgResolutionTimeHours: number;
  suppressionRate: number;
}

interface ResolutionTimeDistribution {
  timeRange: string;
  count: number;
  percentage: number;
}

interface SuppressionMetricsData {
  overview: SuppressionOverview;
  byMerchant: MerchantSuppressionMetrics[];
  byCategory: CategorySuppressionMetrics[];
  byTimeframe: TimeframeSuppressionMetrics[];
  resolutionTimeDistribution: ResolutionTimeDistribution[];
}

interface Merchant {
  id: string;
  name: string;
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// GraphQL query for suppression metrics
const SUPPRESSION_METRICS = gql`
  query SuppressionMetrics($period: Int, $merchantId: String) {
    suppressionMetrics(period: $period, merchantId: $merchantId) {
      overview {
        totalSuppressedProducts
        totalActiveSuppressedProducts
        totalResolvedSuppressions
        avgResolutionTimeHours
        suppressionRate
      }
      byMerchant {
        merchantId
        merchantName
        suppressedCount
        resolvedCount
        avgResolutionTimeHours
        suppressionRate
      }
      byCategory {
        categoryId
        categoryName
        suppressedCount
        resolvedCount
        avgResolutionTimeHours
        suppressionRate
      }
      byTimeframe {
        date
        suppressedCount
        resolvedCount
        avgResolutionTimeHours
        suppressionRate
      }
      resolutionTimeDistribution {
        timeRange
        count
        percentage
      }
    }
  }
`;

// GraphQL query for merchant list
const MERCHANT_LIST = gql`
  query MerchantList {
    merchants {
      id
      name
    }
  }
`;

const SuppressionMetrics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  
  // Fetch suppression metrics data
  const { 
    data: metricsData, 
    loading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery(SUPPRESSION_METRICS, {
    variables: { period, merchantId: selectedMerchant || null },
    fetchPolicy: 'network-only',
  });

  // Fetch merchant list
  const { 
    data: merchantData, 
    loading: merchantLoading, 
    error: merchantError 
  } = useQuery(MERCHANT_LIST);

  useEffect(() => {
    refetchMetrics({
      period,
      merchantId: selectedMerchant || null
    });
  }, [period, selectedMerchant, refetchMetrics]);

  // Handle loading and error states
  if (metricsLoading || merchantLoading) {
    return (
      <AdminLayout title="Product Suppression Analytics">
        <AnalyticsNav />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (metricsError || merchantError) {
    return (
      <AdminLayout title="Product Suppression Analytics">
        <AnalyticsNav />
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{metricsError?.message || merchantError?.message}</p>
        </div>
      </AdminLayout>
    );
  }

  // Extract data for easier access
  const { overview, byMerchant, byCategory, byTimeframe, resolutionTimeDistribution } = 
    metricsData?.suppressionMetrics || {
      overview: {
        totalSuppressedProducts: 0,
        totalActiveSuppressedProducts: 0,
        totalResolvedSuppressions: 0,
        avgResolutionTimeHours: 0,
        suppressionRate: 0
      },
      byMerchant: [] as MerchantSuppressionMetrics[],
      byCategory: [] as CategorySuppressionMetrics[],
      byTimeframe: [] as TimeframeSuppressionMetrics[],
      resolutionTimeDistribution: [] as ResolutionTimeDistribution[]
    } as SuppressionMetricsData;

  // Prepare chart data for suppression over time
  const timeframeLabels = byTimeframe.map((item: TimeframeSuppressionMetrics) => item.date);
  const suppressionTimeData = {
    labels: timeframeLabels,
    datasets: [
      {
        label: 'Suppressed Products',
        data: byTimeframe.map((item: TimeframeSuppressionMetrics) => item.suppressedCount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Resolved Suppressions',
        data: byTimeframe.map((item: TimeframeSuppressionMetrics) => item.resolvedCount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Prepare chart data for resolution time distribution
  const resolutionDistributionData = {
    labels: resolutionTimeDistribution.map((item: ResolutionTimeDistribution) => item.timeRange),
    datasets: [
      {
        label: 'Resolution Time Distribution',
        data: resolutionTimeDistribution.map((item: ResolutionTimeDistribution) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for merchant comparison
  const merchantComparisonData = {
    labels: byMerchant.slice(0, 10).map((item: MerchantSuppressionMetrics) => item.merchantName),
    datasets: [
      {
        label: 'Suppression Rate (%)',
        data: byMerchant.slice(0, 10).map((item: MerchantSuppressionMetrics) => item.suppressionRate * 100),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Avg. Resolution Time (hours)',
        data: byMerchant.slice(0, 10).map((item: MerchantSuppressionMetrics) => item.avgResolutionTimeHours),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Prepare chart data for category comparison
  const categoryComparisonData = {
    labels: byCategory.slice(0, 10).map((item: CategorySuppressionMetrics) => item.categoryName),
    datasets: [
      {
        label: 'Suppression Rate (%)',
        data: byCategory.slice(0, 10).map((item: CategorySuppressionMetrics) => item.suppressionRate * 100),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <AdminLayout title="Product Suppression Analytics">
      <AnalyticsNav />
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
            Time Period
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
        </div>
        <div>
          <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
            Merchant
          </label>
          <select
            id="merchant"
            value={selectedMerchant}
            onChange={(e) => setSelectedMerchant(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
          >
            <option value="">All Merchants</option>
            {merchantData?.merchants.map((merchant: Merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Suppressed</h3>
          <p className="text-2xl font-bold text-charcoal mt-1">{overview.totalSuppressedProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Suppressions</h3>
          <p className="text-2xl font-bold text-charcoal mt-1">{overview.totalActiveSuppressedProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
          <p className="text-2xl font-bold text-charcoal mt-1">{overview.totalResolvedSuppressions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Resolution Time</h3>
          <p className="text-2xl font-bold text-charcoal mt-1">{overview.avgResolutionTimeHours.toFixed(1)} hrs</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Suppression Rate</h3>
          <p className="text-2xl font-bold text-charcoal mt-1">{(overview.suppressionRate * 100).toFixed(2)}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Suppression Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Suppression Trends Over Time</h3>
          <Line 
            data={suppressionTimeData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                  text: 'Suppression Trends',
                },
              },
            }}
          />
        </div>

        {/* Resolution Time Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resolution Time Distribution</h3>
          <Pie 
            data={resolutionDistributionData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                  text: 'Resolution Time Distribution',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Merchant and Category Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Merchants by Suppression Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Merchants by Suppression Metrics</h3>
          <Bar 
            data={merchantComparisonData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                  text: 'Merchant Comparison',
                },
              },
              scales: {
                x: {
                  stacked: false,
                },
                y: {
                  stacked: false,
                },
              },
            }}
          />
        </div>

        {/* Top Categories by Suppression Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories by Suppression Rate</h3>
          <Bar 
            data={categoryComparisonData} 
            options={{
              responsive: true,
              indexAxis: 'y' as const,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                  text: 'Category Comparison',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 gap-6">
        {/* Merchant Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Merchant Suppression Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suppressed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Resolution Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suppression Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byMerchant.map((merchant: MerchantSuppressionMetrics) => (
                  <tr key={merchant.merchantId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {merchant.merchantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.suppressedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.resolvedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.avgResolutionTimeHours.toFixed(1)} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(merchant.suppressionRate * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SuppressionMetrics;
