import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { format } from "date-fns";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EyeIcon,
  CursorClickIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import AdvancedFilters, { FilterOptions } from "./AdvancedFilters";
import ExportAnalytics from "./ExportAnalytics";

// Import chart components
import {
  RevenueChart,
  TopProductsChart,
  ConversionFunnelChart,
  OrganicVsPaidChart,
  TimeComparisonChart,
} from "./charts";

// GraphQL query for fetching merchant dashboard analytics
const GET_MERCHANT_DASHBOARD_ANALYTICS = gql`
  query GetMerchantDashboardAnalytics(
    $timeFrame: String
    $startDate: DateTime
    $endDate: DateTime
    $productIds: [String!]
    $categoryIds: [String!]
    $sortBy: String
    $sortOrder: String
    $page: Int
    $limit: Int
  ) {
    merchantDashboardAnalytics(
      timeFrame: $timeFrame
      startDate: $startDate
      endDate: $endDate
      productIds: $productIds
      categoryIds: $categoryIds
      sortBy: $sortBy
      sortOrder: $sortOrder
      page: $page
      limit: $limit
    ) {
      summary {
        totalRevenue
        totalOrders
        totalViews
        totalClicks
        averageOrderValue
        overallConversionRate
        overallClickThroughRate
      }
      topProducts {
        productId
        productName
        productImage
        revenue
        orders
        views
        clicks
        conversionRate
        clickThroughRate
      }
      performanceOverTime {
        date
        value
      }
      conversionFunnel {
        stages {
          name
          count
        }
        conversionRates {
          viewToClickRate
          clickToCartRate
          cartToOrderRate
          abandonmentRate
          overallConversionRate
        }
      }
      organicVsPaidPerformance {
        impressions {
          organic
          paid
        }
        clicks {
          organic
          paid
        }
        conversionRates {
          organic
          paid
        }
        revenue {
          organic
          paid
        }
      }
    }
  }
`;

// GraphQL query for period comparison
const GET_PERIOD_COMPARISON = gql`
  query GetPeriodComparison(
    $currentPeriodStart: DateTime!
    $currentPeriodEnd: DateTime!
    $previousPeriodStart: DateTime!
    $previousPeriodEnd: DateTime!
    $productIds: [String!]
    $categoryIds: [String!]
  ) {
    merchantPeriodComparison(
      currentPeriodStart: $currentPeriodStart
      currentPeriodEnd: $currentPeriodEnd
      previousPeriodStart: $previousPeriodStart
      previousPeriodEnd: $previousPeriodEnd
      productIds: $productIds
      categoryIds: $categoryIds
    ) {
      currentPeriod {
        label
        revenue
        orders
        views
        conversionRate
      }
      previousPeriod {
        label
        revenue
        orders
        views
        conversionRate
      }
      currentPeriodTimeSeries {
        date
        value
      }
      previousPeriodTimeSeries {
        date
        value
      }
    }
  }
`;

// Default filter values
const defaultFilters: FilterOptions = {
  timeFrame: "monthly",
  startDate: null,
  endDate: null,
  productIds: [],
  categoryIds: [],
  sortBy: "revenue",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

// Get date ranges for period comparison
const getDateRanges = () => {
  const now = new Date();
  const currentPeriodEnd = new Date();
  const currentPeriodStart = new Date();
  currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);

  const previousPeriodEnd = new Date(currentPeriodStart);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
  const previousPeriodStart = new Date(previousPeriodEnd);
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

  return {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  };
};

const AnalyticsDashboard: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  // State for period comparison
  const [showPeriodComparison, setShowPeriodComparison] =
    useState<boolean>(false);
  const [periodDates, setPeriodDates] = useState(getDateRanges());

  // Fetch analytics data
  const { loading, error, data } = useQuery(GET_MERCHANT_DASHBOARD_ANALYTICS, {
    variables: {
      ...filters,
    },
    fetchPolicy: "network-only", // Don't cache this data
  });

  // Fetch period comparison data
  const {
    loading: periodLoading,
    error: periodError,
    data: periodData,
  } = useQuery(GET_PERIOD_COMPARISON, {
    variables: {
      ...periodDates,
      productIds: filters.productIds,
      categoryIds: filters.categoryIds,
    },
    fetchPolicy: "network-only",
    skip: !showPeriodComparison, // Skip this query if period comparison is not shown
  });

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Toggle period comparison
  const togglePeriodComparison = () => {
    setShowPeriodComparison(!showPeriodComparison);
  };

  // Update period dates
  const updatePeriodDates = (dates: any) => {
    setPeriodDates(dates);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
        <p>Error loading analytics data: {error.message}</p>
      </div>
    );
  }

  const analyticsData = data?.merchantDashboardAnalytics;

  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mt-4">
        <p>No analytics data available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={togglePeriodComparison}
            className={`flex items-center px-4 py-2 rounded-md ${showPeriodComparison ? "bg-sage text-white" : "bg-gray-100 text-gray-700"}`}
          >
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
            {showPeriodComparison
              ? "Hide Period Comparison"
              : "Show Period Comparison"}
          </button>
          <ExportAnalytics analyticsData={analyticsData} filters={filters} />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <AdvancedFilters
          onFilterChange={handleFilterChange}
          filters={filters}
        />
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Total Revenue
            </h3>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(analyticsData.summary.totalRevenue)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Total Orders
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {analyticsData.summary.totalOrders}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Average Order Value
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {formatCurrency(analyticsData.summary.averageOrderValue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Total Views
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {analyticsData.summary.totalViews}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Conversion Rate
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {formatPercentage(analyticsData.summary.overallConversionRate)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Click-Through Rate
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {formatPercentage(analyticsData.summary.overallClickThroughRate)}
          </p>
        </div>
      </div>

      {/* Performance Over Time */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Performance Over Time
        </h2>
        <RevenueChart performanceData={analyticsData.performanceOverTime} />
      </div>

      {/* Top Products */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Top Products
        </h2>
        <div className="mb-6">
          <TopProductsChart
            products={analyticsData.topProducts}
            metric="revenue"
            title="Top Products by Revenue"
          />
        </div>
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Revenue
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topProducts.slice(0, 5).map((product: any) => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.productImage ? (
                        <img
                          className="h-10 w-10 rounded-full mr-3"
                          src={product.productImage}
                          alt={product.productName}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            {product.productName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.productName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(product.revenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.orders}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatPercentage(product.conversionRate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Conversion Funnel
        </h2>
        <ConversionFunnelChart
          stages={analyticsData.conversionFunnel.stages}
          conversionRates={analyticsData.conversionFunnel.conversionRates}
        />
      </div>

      {/* Organic vs Paid Performance */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Organic vs Paid Performance
        </h2>
        <OrganicVsPaidChart data={analyticsData.organicVsPaidPerformance} />
      </div>

      {/* Period Comparison */}
      {showPeriodComparison && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Period Comparison
          </h2>
          {periodLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
            </div>
          ) : periodError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
              <p>Error loading period comparison data: {periodError.message}</p>
            </div>
          ) : periodData?.merchantPeriodComparison ? (
            <TimeComparisonChart
              data={{
                currentPeriod:
                  periodData.merchantPeriodComparison.currentPeriod,
                previousPeriod:
                  periodData.merchantPeriodComparison.previousPeriod,
              }}
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mt-4">
              <p>No period comparison data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
