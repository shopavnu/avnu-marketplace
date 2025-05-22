import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import AdminLayout from "../../../components/admin/AdminLayout";
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
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

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
  Legend,
);

// GraphQL query for A/B testing analytics
const AB_TESTING_ANALYTICS = gql`
  query ABTestingAnalytics {
    abTestingAnalytics {
      activeTests {
        id
        name
        description
        startDate
        endDate
        status
        variants {
          id
          name
          trafficPercentage
        }
        metrics {
          variant {
            id
            name
          }
          impressions
          clicks
          conversions
          clickThroughRate
          conversionRate
          averageDwellTime
          averageSessionDuration
        }
      }
    }
  }
`;

// GraphQL query for creating a new A/B test
const CREATE_AB_TEST = gql`
  mutation CreateABTest($input: CreateABTestInput!) {
    createABTest(input: $input) {
      id
      name
      status
    }
  }
`;

// GraphQL query for updating an A/B test
const UPDATE_AB_TEST = gql`
  mutation UpdateABTest($id: ID!, $input: UpdateABTestInput!) {
    updateABTest(id: $id, input: $input) {
      id
      name
      status
    }
  }
`;

const ABTestingDashboard: React.FC = () => {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Fetch A/B testing analytics data
  const { data, loading, error, refetch } = useQuery(AB_TESTING_ANALYTICS, {
    fetchPolicy: "network-only",
  });

  // Select the first test by default when data loads
  useEffect(() => {
    if (data?.abTestingAnalytics?.activeTests?.length > 0 && !selectedTestId) {
      setSelectedTestId(data.abTestingAnalytics.activeTests[0].id);
    }
  }, [data, selectedTestId]);

  // Define interface for test object based on the GraphQL query
  interface ABTest {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    variants: {
      id: string;
      name: string;
      trafficPercentage: number;
    }[];
    metrics: {
      variant: {
        id: string;
        name: string;
      };
      impressions: number;
      clicks: number;
      conversions: number;
      clickThroughRate: number;
      conversionRate: number;
      averageDwellTime: number;
      averageSessionDuration: number;
    }[];
  }

  // Get the selected test
  const selectedTest = data?.abTestingAnalytics?.activeTests?.find(
    (test: ABTest) => test.id === selectedTestId,
  );

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format percentages for display
  const formatPercentage = (value: number, decimals = 2) => {
    return `${(value * 100).toFixed(decimals)}%`;
  };

  // Format duration in milliseconds to seconds
  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Prepare chart data for CTR and conversion rate comparison
  const prepareRateComparisonData = (test: ABTest | undefined) => {
    if (!test || !test.metrics) return null;

    return {
      labels: test.metrics.map(
        (metric: ABTest["metrics"][0]) => metric.variant.name,
      ),
      datasets: [
        {
          label: "Click-Through Rate",
          data: test.metrics.map(
            (metric: ABTest["metrics"][0]) => metric.clickThroughRate * 100,
          ),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Conversion Rate",
          data: test.metrics.map(
            (metric: ABTest["metrics"][0]) => metric.conversionRate * 100,
          ),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for dwell time and session duration
  const prepareTimeMetricsData = (test: ABTest | undefined) => {
    if (!test || !test.metrics) return null;

    return {
      labels: test.metrics.map(
        (metric: ABTest["metrics"][0]) => metric.variant.name,
      ),
      datasets: [
        {
          label: "Average Dwell Time (s)",
          data: test.metrics.map(
            (metric: ABTest["metrics"][0]) => metric.averageDwellTime / 1000,
          ),
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
        {
          label: "Average Session Duration (min)",
          data: test.metrics.map(
            (metric: ABTest["metrics"][0]) =>
              metric.averageSessionDuration / 60000,
          ),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for traffic distribution
  const prepareTrafficDistributionData = (test: ABTest | undefined) => {
    if (!test || !test.variants) return null;

    return {
      labels: test.variants.map(
        (variant: ABTest["variants"][0]) => variant.name,
      ),
      datasets: [
        {
          label: "Traffic Percentage",
          data: test.variants.map(
            (variant: ABTest["variants"][0]) => variant.trafficPercentage * 100,
          ),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(54, 162, 235, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Define interface for winner result
  interface TestWinner {
    variant: {
      id: string;
      name: string;
    };
    ctrImprovement: number;
    conversionImprovement: number;
  }

  // Determine if a test has a clear winner
  const determineWinner = (test: ABTest | undefined): TestWinner | null => {
    if (!test || !test.metrics || test.metrics.length < 2) return null;

    // Sort metrics by CTR and conversion rate
    const sortedByCTR = [...test.metrics].sort(
      (a, b) => b.clickThroughRate - a.clickThroughRate,
    );
    const sortedByConversion = [...test.metrics].sort(
      (a, b) => b.conversionRate - a.conversionRate,
    );

    // Check if the same variant is winning in both metrics
    if (sortedByCTR[0].variant.id === sortedByConversion[0].variant.id) {
      const winner = sortedByCTR[0];
      const runnerUp = sortedByCTR[1];

      // Check if the difference is significant (>10%)
      const ctrImprovement =
        (winner.clickThroughRate - runnerUp.clickThroughRate) /
        runnerUp.clickThroughRate;
      const conversionImprovement =
        (winner.conversionRate - runnerUp.conversionRate) /
        runnerUp.conversionRate;

      if (ctrImprovement > 0.1 && conversionImprovement > 0.1) {
        return {
          variant: winner.variant,
          ctrImprovement: ctrImprovement * 100,
          conversionImprovement: conversionImprovement * 100,
        };
      }
    }

    return null;
  };

  // Handle loading and error states
  if (loading) {
    return (
      <AdminLayout title="A/B Testing Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="A/B Testing Dashboard">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading A/B testing data. Please try again later.</p>
          {error && <p className="text-sm mt-2">{error.message}</p>}
        </div>
      </AdminLayout>
    );
  }

  const activeTests = data?.abTestingAnalytics?.activeTests || [];

  return (
    <AdminLayout title="A/B Testing Dashboard">
      {/* Actions */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-4">
          <select
            value={selectedTestId || ""}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="" disabled>
              Select A/B Test
            </option>
            {activeTests.map((test: ABTest) => (
              <option key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-sage text-white px-4 py-2 rounded-md hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
        >
          Create New Test
        </button>
      </div>

      {/* Selected test details */}
      {selectedTest ? (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-charcoal">
                  {selectedTest.name}
                </h2>
                <p className="text-gray-600">{selectedTest.description}</p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTest.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : selectedTest.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedTest.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Start Date</span>
                <p className="font-medium">
                  {formatDate(selectedTest.startDate)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">End Date</span>
                <p className="font-medium">
                  {selectedTest.endDate
                    ? formatDate(selectedTest.endDate)
                    : "Ongoing"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Variants</span>
                <p className="font-medium">{selectedTest.variants.length}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Impressions</span>
                <p className="font-medium">
                  {selectedTest.metrics
                    ?.reduce(
                      (sum: number, metric: ABTest["metrics"][0]) =>
                        sum + metric.impressions,
                      0,
                    )
                    .toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Winner alert if applicable */}
            {(() => {
              const winner = determineWinner(selectedTest);
              if (winner) {
                return (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Clear Winner: {winner.variant.name}
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            CTR improvement: +{winner.ctrImprovement.toFixed(2)}
                            %<br />
                            Conversion improvement: +
                            {winner.conversionImprovement.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Metrics charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Rate comparison chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Conversion Metrics
              </h3>
              <div className="h-64">
                <Bar
                  data={
                    prepareRateComparisonData(selectedTest) || {
                      labels: [],
                      datasets: [],
                    }
                  }
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Percentage (%)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Time metrics chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Engagement Metrics
              </h3>
              <div className="h-64">
                <Bar
                  data={
                    prepareTimeMetricsData(selectedTest) || {
                      labels: [],
                      datasets: [],
                    }
                  }
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
          </div>

          {/* Traffic distribution and detailed metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Traffic distribution chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Traffic Distribution
              </h3>
              <div className="h-64">
                <Pie
                  data={
                    prepareTrafficDistributionData(selectedTest) || {
                      labels: [],
                      datasets: [],
                    }
                  }
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>

            {/* Detailed metrics table */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Detailed Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Variant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Impressions
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Clicks
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        CTR
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Conversions
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Conv. Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedTest.metrics?.map(
                      (metric: ABTest["metrics"][0]) => (
                        <tr key={metric.variant.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {metric.variant.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPercentage(metric.clickThroughRate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.conversions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPercentage(metric.conversionRate)}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Test controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Test Controls
            </h3>
            <div className="flex space-x-4">
              {selectedTest.status === "ACTIVE" && (
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Stop Test
                </button>
              )}
              {selectedTest.status === "COMPLETED" &&
                determineWinner(selectedTest) && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Apply Winner
                  </button>
                )}
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Edit Test
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
          <p className="text-gray-500">
            {activeTests.length > 0
              ? "Select a test from the dropdown to view details"
              : "No active A/B tests found. Create a new test to get started."}
          </p>
        </div>
      )}

      {/* Create test modal */}
      {isCreateModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Create New A/B Test
                    </h3>
                    <div className="mt-4">
                      <form className="space-y-4">
                        <div>
                          <label
                            htmlFor="test-name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Test Name
                          </label>
                          <input
                            type="text"
                            id="test-name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                            placeholder="e.g., Personalization Weight Test"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="test-description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Description
                          </label>
                          <textarea
                            id="test-description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                            placeholder="Describe the purpose of this test"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Variants
                          </label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                                placeholder="Control"
                                defaultValue="Control"
                              />
                              <input
                                type="number"
                                className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                                placeholder="50%"
                                defaultValue="50"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                                placeholder="Variant A"
                                defaultValue="Variant A"
                              />
                              <input
                                type="number"
                                className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                                placeholder="50%"
                                defaultValue="50"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-sage bg-sage-50 hover:bg-sage-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                            >
                              + Add Variant
                            </button>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="test-duration"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Duration (days)
                          </label>
                          <input
                            type="number"
                            id="test-duration"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                            defaultValue="14"
                            min="1"
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sage text-base font-medium text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Test
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ABTestingDashboard;
