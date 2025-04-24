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

// GraphQL query for analytics dashboard data
const DASHBOARD_OVERVIEW = gql`
  query DashboardOverview($period: Int) {
    dashboardOverview(period: $period) {
      searchMetrics {
        conversionRate
        clickThroughRate
        personalizedVsRegular {
          personalized {
            clickThroughRate
            conversionRate
          }
          regular {
            clickThroughRate
            conversionRate
          }
        }
        topQueries {
          query
          count
        }
      }
      personalizationImpact {
        clickThroughImprovement
        conversionImprovement
      }
      sessionAnalytics {
        totalSessions
        avgInteractionsPerSession
        avgSessionDuration
        interactionTypeDistribution
      }
    }
  }
`;

// GraphQL query for personalization effectiveness
const PERSONALIZATION_EFFECTIVENESS = gql`
  query PersonalizationEffectiveness($period: Int) {
    personalizationEffectiveness(period: $period) {
      personalizedVsRegular {
        personalized {
          clickThroughRate
          conversionRate
        }
        regular {
          clickThroughRate
          conversionRate
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
    }
  }
`;

const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  
  // Fetch dashboard overview data
  const { 
    data: overviewData, 
    loading: overviewLoading, 
    error: overviewError 
  } = useQuery(DASHBOARD_OVERVIEW, {
    variables: { period },
    fetchPolicy: 'network-only',
  });

  // Fetch personalization effectiveness data
  const { 
    data: personalizationData, 
    loading: personalizationLoading, 
    error: personalizationError 
  } = useQuery(PERSONALIZATION_EFFECTIVENESS, {
    variables: { period },
    fetchPolicy: 'network-only',
  });

  // Handle loading and error states
  if (overviewLoading || personalizationLoading) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (overviewError || personalizationError) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading analytics data. Please try again later.</p>
          {(overviewError || personalizationError) && (
            <p className="text-sm mt-2">
              {overviewError?.message || personalizationError?.message}
            </p>
          )}
        </div>
      </AdminLayout>
    );
  }

  // Extract data for charts
  const overview = overviewData?.dashboardOverview || {};
  const personalization = personalizationData?.personalizationEffectiveness || {};
  const sessionAnalytics = overview.sessionAnalytics || {};
  const sessionPersonalization = personalization.sessionPersonalization || {};

  // Prepare data for interaction type distribution chart
  const interactionTypes = sessionAnalytics.interactionTypeDistribution 
    ? Object.keys(sessionAnalytics.interactionTypeDistribution).filter(key => !key.includes('Percentage'))
    : [];
  
  const interactionCounts = interactionTypes.map(
    type => sessionAnalytics.interactionTypeDistribution[type] || 0
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

  // Prepare data for personalization comparison chart
  const personalizationComparisonData = {
    labels: ['Click-Through Rate', 'Conversion Rate', 'Dwell Time (sec)'],
    datasets: [
      {
        label: 'Personalized',
        data: [
          personalization.personalizedVsRegular?.personalized?.clickThroughRate * 100 || 0,
          personalization.personalizedVsRegular?.personalized?.conversionRate * 100 || 0,
          sessionPersonalization.dwellTimeMetrics?.personalized?.avgDwellTime / 1000 || 0,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Regular',
        data: [
          personalization.personalizedVsRegular?.regular?.clickThroughRate * 100 || 0,
          personalization.personalizedVsRegular?.regular?.conversionRate * 100 || 0,
          sessionPersonalization.dwellTimeMetrics?.regular?.avgDwellTime / 1000 || 0,
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for improvement metrics chart
  const improvementData = {
    labels: ['Click-Through Rate', 'Conversion Rate', 'Dwell Time', 'Impression-to-Click'],
    datasets: [
      {
        label: 'Improvement (%)',
        data: [
          personalization.improvements?.clickThroughImprovementPercentage || 0,
          personalization.improvements?.conversionImprovementPercentage || 0,
          sessionPersonalization.dwellTimeMetrics?.improvementPercentage || 0,
          sessionPersonalization.impressionToClickRates?.improvementPercentage || 0,
        ],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout title="Analytics Dashboard">
      {/* Period selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-sage">
            {sessionAnalytics.totalSessions?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Interactions</h3>
          <p className="text-3xl font-bold text-sage">
            {sessionAnalytics.avgInteractionsPerSession?.toFixed(2) || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Session Duration</h3>
          <p className="text-3xl font-bold text-sage">
            {sessionAnalytics.avgSessionDuration?.toFixed(2) || 0} min
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">CTR Improvement</h3>
          <p className="text-3xl font-bold text-sage">
            {personalization.improvements?.clickThroughImprovementPercentage?.toFixed(2) || 0}%
          </p>
        </div>
      </div>

      {/* Session-based personalization metrics */}
      <h2 className="text-xl font-semibold text-charcoal mb-4">Session-Based Personalization</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Interaction type distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interaction Type Distribution</h3>
          <div className="h-64">
            <Pie data={interactionDistributionData} />
          </div>
        </div>

        {/* Personalization comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personalization Comparison</h3>
          <div className="h-64">
            <Bar 
              data={personalizationComparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Value (%)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Improvement metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personalization Improvements</h3>
        <div className="h-64">
          <Bar 
            data={improvementData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Improvement (%)',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Detailed metrics */}
      <h2 className="text-xl font-semibold text-charcoal mb-4">Detailed Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Click-through rates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Click-Through Rates</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Personalized</span>
                <span className="text-sm font-medium text-gray-700">
                  {(sessionPersonalization.clickThroughRates?.personalized?.clickThroughRate * 100)?.toFixed(2) || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-sage rounded-full h-2" 
                  style={{ width: `${(sessionPersonalization.clickThroughRates?.personalized?.clickThroughRate * 100) || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Regular</span>
                <span className="text-sm font-medium text-gray-700">
                  {(sessionPersonalization.clickThroughRates?.regular?.clickThroughRate * 100)?.toFixed(2) || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 rounded-full h-2" 
                  style={{ width: `${(sessionPersonalization.clickThroughRates?.regular?.clickThroughRate * 100) || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Improvement</span>
                <span className="text-sm font-medium text-green-600">
                  +{sessionPersonalization.clickThroughRates?.improvementPercentage?.toFixed(2) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dwell time metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dwell Time (seconds)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Personalized</span>
                <span className="text-sm font-medium text-gray-700">
                  {(sessionPersonalization.dwellTimeMetrics?.personalized?.avgDwellTime / 1000)?.toFixed(2) || 0}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-sage rounded-full h-2" 
                  style={{ width: `${Math.min(100, ((sessionPersonalization.dwellTimeMetrics?.personalized?.avgDwellTime / 1000) / 60) * 100) || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Regular</span>
                <span className="text-sm font-medium text-gray-700">
                  {(sessionPersonalization.dwellTimeMetrics?.regular?.avgDwellTime / 1000)?.toFixed(2) || 0}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 rounded-full h-2" 
                  style={{ width: `${Math.min(100, ((sessionPersonalization.dwellTimeMetrics?.regular?.avgDwellTime / 1000) / 60) * 100) || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Improvement</span>
                <span className="text-sm font-medium text-green-600">
                  +{sessionPersonalization.dwellTimeMetrics?.improvementPercentage?.toFixed(2) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
