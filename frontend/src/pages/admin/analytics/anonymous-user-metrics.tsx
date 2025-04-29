import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNav from '../../../components/admin/AnalyticsNav';
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
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { UserIcon, ClockIcon, MagnifyingGlassIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

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

// Define TypeScript interfaces for our data structures
interface AnonymousUserOverview {
  totalAnonymousUsers: number;
  activeAnonymousUsers: number;
  conversionRate: number;
  avgSessionDuration: number;
  returningUserRate: number;
}

interface InteractionTypeMetrics {
  type: string;
  count: number;
  percentage: number;
}

interface CategoryPreference {
  categoryId: string;
  categoryName: string;
  weight: number;
  interactionCount: number;
}

interface BrandPreference {
  brandId: string;
  brandName: string;
  weight: number;
  interactionCount: number;
}

interface SearchTerm {
  query: string;
  count: number;
  conversionRate: number;
}

interface TimeframeMetrics {
  date: string;
  anonymousUsers: number;
  newUsers: number;
  returningUsers: number;
  avgSessionDuration: number;
}

interface AnonymousUserMetricsData {
  overview: AnonymousUserOverview;
  interactionsByType: InteractionTypeMetrics[];
  topCategoryPreferences: CategoryPreference[];
  topBrandPreferences: BrandPreference[];
  topSearchTerms: SearchTerm[];
  byTimeframe: TimeframeMetrics[];
}

// GraphQL query for anonymous user metrics
const ANONYMOUS_USER_METRICS = gql`
  query AnonymousUserMetrics($period: Int) {
    anonymousUserMetrics(period: $period) {
      overview {
        totalAnonymousUsers
        activeAnonymousUsers
        conversionRate
        avgSessionDuration
        returningUserRate
      }
      interactionsByType {
        type
        count
        percentage
      }
      topCategoryPreferences {
        categoryId
        categoryName
        weight
        interactionCount
      }
      topBrandPreferences {
        brandId
        brandName
        weight
        interactionCount
      }
      topSearchTerms {
        query
        count
        conversionRate
      }
      byTimeframe {
        date
        anonymousUsers
        newUsers
        returningUsers
        avgSessionDuration
      }
    }
  }
`;

const AnonymousUserMetrics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  
  // Fetch anonymous user metrics data
  const { 
    data, 
    loading, 
    error,
    refetch
  } = useQuery(ANONYMOUS_USER_METRICS, {
    variables: { period },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    refetch({ period });
  }, [period, refetch]);

  // Handle loading and error states
  if (loading) {
    return (
      <AdminLayout title="Anonymous User Analytics">
        <AnalyticsNav />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Anonymous User Analytics">
        <AnalyticsNav />
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading anonymous user metrics: {error.message}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const metricsData: AnonymousUserMetricsData = data?.anonymousUserMetrics || {
    overview: {
      totalAnonymousUsers: 0,
      activeAnonymousUsers: 0,
      conversionRate: 0,
      avgSessionDuration: 0,
      returningUserRate: 0
    },
    interactionsByType: [],
    topCategoryPreferences: [],
    topBrandPreferences: [],
    topSearchTerms: [],
    byTimeframe: []
  };

  const { 
    overview, 
    interactionsByType, 
    topCategoryPreferences, 
    topBrandPreferences, 
    topSearchTerms, 
    byTimeframe 
  } = metricsData;

  // Prepare chart data for interactions by type
  const interactionTypeData = {
    labels: interactionsByType.map(item => item.type),
    datasets: [
      {
        label: 'Interactions',
        data: interactionsByType.map(item => item.count),
        backgroundColor: [
          'rgba(99, 143, 107, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(99, 143, 107, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for category preferences
  const categoryPreferencesData = {
    labels: topCategoryPreferences.map(item => item.categoryName),
    datasets: [
      {
        label: 'Weight',
        data: topCategoryPreferences.map(item => item.weight),
        backgroundColor: 'rgba(99, 143, 107, 0.7)',
        borderColor: 'rgba(99, 143, 107, 1)',
        borderWidth: 1,
      },
      {
        label: 'Interactions',
        data: topCategoryPreferences.map(item => item.interactionCount),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for brand preferences
  const brandPreferencesData = {
    labels: topBrandPreferences.map(item => item.brandName),
    datasets: [
      {
        label: 'Weight',
        data: topBrandPreferences.map(item => item.weight),
        backgroundColor: 'rgba(99, 143, 107, 0.7)',
        borderColor: 'rgba(99, 143, 107, 1)',
        borderWidth: 1,
      },
      {
        label: 'Interactions',
        data: topBrandPreferences.map(item => item.interactionCount),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for user trends over time
  const userTrendsData = {
    labels: byTimeframe.map(item => item.date),
    datasets: [
      {
        label: 'Anonymous Users',
        data: byTimeframe.map(item => item.anonymousUsers),
        borderColor: 'rgba(99, 143, 107, 1)',
        backgroundColor: 'rgba(99, 143, 107, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'New Users',
        data: byTimeframe.map(item => item.newUsers),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Returning Users',
        data: byTimeframe.map(item => item.returningUsers),
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare chart data for session duration over time
  const sessionDurationData = {
    labels: byTimeframe.map(item => item.date),
    datasets: [
      {
        label: 'Avg. Session Duration (minutes)',
        data: byTimeframe.map(item => item.avgSessionDuration / 60),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <AdminLayout title="Anonymous User Analytics">
      <AnalyticsNav />
      
      {/* Period selector */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 text-sm font-medium ${
                period === days
                  ? 'bg-sage text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                days === 7
                  ? 'rounded-l-md'
                  : days === 90
                  ? 'rounded-r-md'
                  : ''
              } border border-gray-300`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-sage bg-opacity-10">
              <UserIcon className="h-6 w-6 text-sage" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Anonymous Users</p>
              <p className="text-2xl font-semibold text-gray-900">{overview.totalAnonymousUsers.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Active: {overview.activeAnonymousUsers.toLocaleString()} ({((overview.activeAnonymousUsers / overview.totalAnonymousUsers) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Session Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{(overview.avgSessionDuration / 60).toFixed(1)} min</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Returning Rate: {(overview.returningUserRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <MagnifyingGlassIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Search</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">
                {topSearchTerms.length > 0 ? topSearchTerms[0].query : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {topSearchTerms.length > 0 ? `${topSearchTerms[0].count} searches` : 'No data'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ShoppingCartIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{(overview.conversionRate * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Anonymous to registered user conversion
            </p>
          </div>
        </div>
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Interaction Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interaction Types</h3>
          <div className="h-64">
            <Doughnut 
              data={interactionTypeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* User Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Trends</h3>
          <div className="h-64">
            <Line 
              data={userTrendsData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Category Preferences</h3>
          <div className="h-64">
            <Bar 
              data={categoryPreferencesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Brand Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Brand Preferences</h3>
          <div className="h-64">
            <Bar 
              data={brandPreferencesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Session Duration Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Duration Trends</h3>
        <div className="h-64">
          <Line 
            data={sessionDurationData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Minutes',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Top Search Terms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Search Terms</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Search Query
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSearchTerms.map((term, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {term.query}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {term.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(term.conversionRate * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
              {topSearchTerms.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No search data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnonymousUserMetrics;
