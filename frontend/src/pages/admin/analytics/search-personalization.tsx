import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import AdminLayout from '../../../components/admin/AdminLayout';
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

// GraphQL query for personalization effectiveness
const PERSONALIZATION_EFFECTIVENESS = gql`
  query PersonalizationEffectiveness($period: Int) {
    personalizationEffectiveness(period: $period) {
      personalizedVsRegular {
        personalized {
          clickThroughRate
          conversionRate
          searches
          clicks
          conversions
        }
        regular {
          clickThroughRate
          conversionRate
          searches
          clicks
          conversions
        }
      }
      improvements {
        clickThroughImprovement
        conversionImprovement
        clickThroughImprovementPercentage
        conversionImprovementPercentage
      }
      sessionPersonalization {
        interactionTypeDistribution
        dwellTimeMetrics {
          personalized {
            avgDwellTime
            count
          }
          regular {
            avgDwellTime
            count
          }
          improvement
          improvementPercentage
        }
        clickThroughRates {
          personalized {
            clicks
            impressions
            clickThroughRate
          }
          regular {
            clicks
            impressions
            clickThroughRate
          }
          improvement
          improvementPercentage
        }
        impressionToClickRates {
          personalized {
            sessions
            impressions
            clicks
            conversionRate
          }
          regular {
            sessions
            impressions
            clicks
            conversionRate
          }
          improvement
          improvementPercentage
        }
      }
      personalizationUsage {
        totalPersonalizedSearches
        percentagePersonalized
        userAdoption
        sessionCoverage
      }
      collaborativeFilteringStats {
        effectiveness
        coverage
        diversity
      }
    }
  }
`;

// GraphQL query for top personalized entities
const TOP_PERSONALIZED_ENTITIES = gql`
  query TopPersonalizedEntities($limit: Int, $period: Int) {
    topPersonalizedEntities(limit: $limit, period: $period) {
      entityId
      count
      entityType
      entityName
    }
  }
`;

// GraphQL query for session time series data
const SESSION_TIME_SERIES = gql`
  query SessionTimeSeriesData($period: Int, $interval: Int) {
    sessionTimeSeriesData(period: $period, interval: $interval) {
      date
      sessionCount
      interactionCount
      personalizedInteractionCount
      personalizationRate
    }
  }
`;

const SearchPersonalizationAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [interval, setInterval] = useState<number>(1);
  
  // Fetch personalization effectiveness data
  const { 
    data: personalizationData, 
    loading: personalizationLoading, 
    error: personalizationError,
    refetch: refetchPersonalization
  } = useQuery(PERSONALIZATION_EFFECTIVENESS, {
    variables: { period },
    fetchPolicy: 'network-only',
  });

  // Fetch top personalized entities
  const { 
    data: entitiesData, 
    loading: entitiesLoading, 
    error: entitiesError,
    refetch: refetchEntities
  } = useQuery(TOP_PERSONALIZED_ENTITIES, {
    variables: { limit: 10, period },
    fetchPolicy: 'network-only',
  });

  // Fetch session time series data
  const { 
    data: timeSeriesData, 
    loading: timeSeriesLoading, 
    error: timeSeriesError,
    refetch: refetchTimeSeries
  } = useQuery(SESSION_TIME_SERIES, {
    variables: { period, interval },
    fetchPolicy: 'network-only',
  });

  // Refetch data when period changes
  useEffect(() => {
    refetchPersonalization({ period });
    refetchEntities({ limit: 10, period });
    refetchTimeSeries({ period, interval });
  }, [period, interval, refetchPersonalization, refetchEntities, refetchTimeSeries]);

  // Handle loading and error states
  if (personalizationLoading || entitiesLoading || timeSeriesLoading) {
    return (
      <AdminLayout title="Search Personalization Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (personalizationError || entitiesError || timeSeriesError) {
    return (
      <AdminLayout title="Search Personalization Analytics">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading analytics data. Please try again later.</p>
          {(personalizationError || entitiesError || timeSeriesError) && (
            <p className="text-sm mt-2">
              {personalizationError?.message || entitiesError?.message || timeSeriesError?.message}
            </p>
          )}
        </div>
      </AdminLayout>
    );
  }

  // Extract data for charts
  const personalization = personalizationData?.personalizationEffectiveness || {};
  const sessionPersonalization = personalization.sessionPersonalization || {};
  const topEntities = entitiesData?.topPersonalizedEntities || [];
  const timeSeries = timeSeriesData?.sessionTimeSeriesData || [];

  // Prepare data for session time series chart
  const timeSeriesChartData = {
    labels: timeSeries.map(item => item.date),
    datasets: [
      {
        label: 'Sessions',
        data: timeSeries.map(item => item.sessionCount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Personalized Interactions',
        data: timeSeries.map(item => item.personalizedInteractionCount),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for personalization rate chart
  const personalizationRateData = {
    labels: timeSeries.map(item => item.date),
    datasets: [
      {
        label: 'Personalization Rate',
        data: timeSeries.map(item => item.personalizationRate * 100),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for top entities chart
  const topEntitiesData = {
    labels: topEntities.map(entity => entity.entityName || `Entity ${entity.entityId}`),
    datasets: [
      {
        label: 'Click Count',
        data: topEntities.map(entity => entity.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for interaction type distribution chart
  const interactionTypes = sessionPersonalization.interactionTypeDistribution 
    ? Object.keys(sessionPersonalization.interactionTypeDistribution).filter(key => !key.includes('Percentage'))
    : [];
  
  const interactionCounts = interactionTypes.map(
    type => sessionPersonalization.interactionTypeDistribution[type] || 0
  );

  const interactionDistributionData = {
    labels: interactionTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
    datasets: [
      {
        label: 'Interaction Count',
        data: interactionCounts,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format numbers for display
  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '0';
    return typeof num === 'number' ? num.toFixed(decimals) : '0';
  };

  // Format percentages for display
  const formatPercentage = (num, decimals = 2) => {
    if (num === undefined || num === null) return '0%';
    return typeof num === 'number' ? `${num.toFixed(decimals)}%` : '0%';
  };

  return (
    <AdminLayout title="Search Personalization Analytics">
      {/* Period and interval selectors */}
      <div className="mb-6 flex justify-end space-x-4">
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        
        <select
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
        >
          <option value={1}>Daily</option>
          <option value={7}>Weekly</option>
          <option value={30}>Monthly</option>
        </select>
      </div>

      {/* Session-Based Personalization Overview */}
      <h2 className="text-xl font-semibold text-charcoal mb-4">Session-Based Personalization Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">CTR Improvement</h3>
          <p className="text-3xl font-bold text-sage">
            {formatPercentage(sessionPersonalization.clickThroughRates?.improvementPercentage)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Personalized: {formatPercentage(sessionPersonalization.clickThroughRates?.personalized?.clickThroughRate * 100)}
          </p>
          <p className="text-sm text-gray-500">
            Regular: {formatPercentage(sessionPersonalization.clickThroughRates?.regular?.clickThroughRate * 100)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dwell Time Improvement</h3>
          <p className="text-3xl font-bold text-sage">
            {formatPercentage(sessionPersonalization.dwellTimeMetrics?.improvementPercentage)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Personalized: {formatNumber(sessionPersonalization.dwellTimeMetrics?.personalized?.avgDwellTime / 1000)}s
          </p>
          <p className="text-sm text-gray-500">
            Regular: {formatNumber(sessionPersonalization.dwellTimeMetrics?.regular?.avgDwellTime / 1000)}s
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conversion Improvement</h3>
          <p className="text-3xl font-bold text-sage">
            {formatPercentage(sessionPersonalization.impressionToClickRates?.improvementPercentage)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Personalized: {formatPercentage(sessionPersonalization.impressionToClickRates?.personalized?.conversionRate * 100)}
          </p>
          <p className="text-sm text-gray-500">
            Regular: {formatPercentage(sessionPersonalization.impressionToClickRates?.regular?.conversionRate * 100)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Personalization Usage</h3>
          <p className="text-3xl font-bold text-sage">
            {formatPercentage(personalization.personalizationUsage?.percentagePersonalized * 100)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total: {personalization.personalizationUsage?.totalPersonalizedSearches?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500">
            Session Coverage: {formatPercentage(personalization.personalizationUsage?.sessionCoverage * 100)}
          </p>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session Activity Over Time</h3>
          <div className="h-64">
            <Line 
              data={timeSeriesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personalization Rate Over Time</h3>
          <div className="h-64">
            <Line 
              data={personalizationRateData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Percentage (%)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Interaction and Entity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interaction Type Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={interactionDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Personalized Entities</h3>
          <div className="h-64">
            <Bar 
              data={topEntitiesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <h2 className="text-xl font-semibold text-charcoal mb-4">Detailed Metrics</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Personalized
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Regular
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Improvement
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Improvement %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Click-Through Rate
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(sessionPersonalization.clickThroughRates?.personalized?.clickThroughRate * 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(sessionPersonalization.clickThroughRates?.regular?.clickThroughRate * 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(sessionPersonalization.clickThroughRates?.improvement * 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {formatPercentage(sessionPersonalization.clickThroughRates?.improvementPercentage)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Dwell Time (seconds)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(sessionPersonalization.dwellTimeMetrics?.personalized?.avgDwellTime / 1000)}s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(sessionPersonalization.dwellTimeMetrics?.regular?.avgDwellTime / 1000)}s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber((sessionPersonalization.dwellTimeMetrics?.improvement || 0) / 1000)}s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {formatPercentage(sessionPersonalization.dwellTimeMetrics?.improvementPercentage)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Impression-to-Click Rate
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(sessionPersonalization.impressionToClickRates?.personalized?.conversionRate * 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(sessionPersonalization.impressionToClickRates?.regular?.conversionRate * 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(sessionPersonalization.impressionToClickRates?.improvement * 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {formatPercentage(sessionPersonalization.impressionToClickRates?.improvementPercentage)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default SearchPersonalizationAnalytics;
