import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// GraphQL query for dashboard overview
const DASHBOARD_OVERVIEW = gql`
  query DashboardOverview($period: Int) {
    dashboardOverview(period: $period) {
      searchMetrics {
        conversionRate
        clickThroughRate
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
      }
    }
  }
`;

const AdminDashboard: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  
  // Fetch dashboard overview data
  const { 
    data, 
    loading, 
    error 
  } = useQuery(DASHBOARD_OVERVIEW, {
    variables: { period },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading dashboard data. Please try again later.</p>
          {error && (
            <p className="text-sm mt-2">{error.message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  const overview = data?.dashboardOverview || {};
  const searchMetrics = overview.searchMetrics || {};
  const personalizationImpact = overview.personalizationImpact || {};
  const sessionAnalytics = overview.sessionAnalytics || {};

  // Format numbers for display
  const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
    if (num === undefined || num === null) return '0';
    return typeof num === 'number' ? num.toFixed(decimals) : '0';
  };

  // Format percentages for display
  const formatPercentage = (num: number | null | undefined, decimals: number = 2): string => {
    if (num === undefined || num === null) return '0%';
    return typeof num === 'number' ? `${num.toFixed(decimals)}%` : '0%';
  };

  return (
    <AdminLayout title="Admin Dashboard">
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

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-sage bg-opacity-10 rounded-full p-3">
              <ChartBarIcon className="h-6 w-6 text-sage" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Click-Through Rate</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {formatPercentage(searchMetrics.clickThroughRate * 100)}
              </p>
              <p className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {formatPercentage(personalizationImpact.clickThroughImprovement * 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {formatPercentage(searchMetrics.conversionRate * 100)}
              </p>
              <p className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {formatPercentage(personalizationImpact.conversionImprovement * 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-50 rounded-full p-3">
              <UserGroupIcon className="h-6 w-6 text-purple-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {sessionAnalytics.totalSessions?.toLocaleString() || 0}
              </p>
              <p className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatNumber(sessionAnalytics.avgSessionDuration)} min avg
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-50 rounded-full p-3">
              <ShoppingBagIcon className="h-6 w-6 text-amber-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Interactions</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {formatNumber(sessionAnalytics.avgInteractionsPerSession)}
              </p>
              <p className="flex items-center text-sm text-gray-500">
                Per session
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <h2 className="text-xl font-semibold text-charcoal mb-4">Analytics Dashboards</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/analytics" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-sage" aria-hidden="true" />
              <h3 className="ml-3 text-lg font-medium text-charcoal">General Analytics</h3>
            </div>
            <p className="text-gray-600">
              View comprehensive analytics across all aspects of the platform including user engagement, sales, and more.
            </p>
          </div>
        </Link>

        <Link href="/admin/analytics/search-personalization" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
              <h3 className="ml-3 text-lg font-medium text-charcoal">Search Personalization</h3>
            </div>
            <p className="text-gray-600">
              Detailed metrics on search personalization effectiveness, session tracking, and user behavior patterns.
            </p>
          </div>
        </Link>

        <Link href="/admin/analytics" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-purple-500" aria-hidden="true" />
              <h3 className="ml-3 text-lg font-medium text-charcoal">User Analytics</h3>
            </div>
            <p className="text-gray-600">
              Insights into user behavior, demographics, preferences, and engagement metrics across the platform.
            </p>
          </div>
        </Link>
      </div>

      {/* Top search queries */}
      <h2 className="text-xl font-semibold text-charcoal mb-4">Top Search Queries</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Query
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {searchMetrics.topQueries?.map((query: any, index: number) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {query.query}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {query.count.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a href={`/search?q=${encodeURIComponent(query.query)}`} target="_blank" rel="noopener noreferrer" className="text-sage hover:text-sage-dark">
                    View Results
                  </a>
                </td>
              </tr>
            ))}
            {(!searchMetrics.topQueries || searchMetrics.topQueries.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No search queries found for the selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
