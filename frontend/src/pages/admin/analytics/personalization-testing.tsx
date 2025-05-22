import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
import {
  BeakerIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

// Import visualization components
// Define props interfaces for our components
interface PersonalizationEffectivenessProps {
  metrics: PersonalizationMetrics;
}

interface ABTestingVisualizationProps {
  testResults: ABTestResult[];
  onViewDetails?: (testId: string) => void;
}

// Import visualization components
const PersonalizationEffectiveness: React.FC<
  PersonalizationEffectivenessProps
> = ({ metrics }) => {
  if (!metrics)
    return (
      <div className="text-center py-6 text-gray-500">
        No personalization data available
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Conversion Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Conversion Rate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Personalized
              </span>
              <span className="text-sm font-medium text-gray-700">
                {metrics.conversionRate.personalized.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sage rounded-full h-2"
                style={{
                  width: `${Math.min(100, metrics.conversionRate.personalized * 5)}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Non-Personalized
              </span>
              <span className="text-sm font-medium text-gray-700">
                {metrics.conversionRate.nonPersonalized.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{
                  width: `${Math.min(100, metrics.conversionRate.nonPersonalized * 5)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Improvement</span>
          <span className="text-sm font-medium text-green-600">
            +{metrics.conversionRate.improvement.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Click-Through Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Click-Through Rate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Personalized
              </span>
              <span className="text-sm font-medium text-gray-700">
                {metrics.clickThroughRate.personalized.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sage rounded-full h-2"
                style={{
                  width: `${Math.min(100, metrics.clickThroughRate.personalized)}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Non-Personalized
              </span>
              <span className="text-sm font-medium text-gray-700">
                {metrics.clickThroughRate.nonPersonalized.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{
                  width: `${Math.min(100, metrics.clickThroughRate.nonPersonalized)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Improvement</span>
          <span className="text-sm font-medium text-green-600">
            +{metrics.clickThroughRate.improvement.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const ABTestingVisualization: React.FC<ABTestingVisualizationProps> = ({
  testResults,
  onViewDetails,
}) => {
  if (!testResults || testResults.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No A/B test data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {testResults.map((test) => (
        <div key={test.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">{test.name}</h3>
              <p className="text-sm text-gray-500">{test.description}</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {test.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {test.metrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">{metric.name}</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Control
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {metric.name.includes("%")
                          ? `${metric.control}%`
                          : metric.control}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${Math.min(100, metric.control)}%` }}
                      ></div>
                    </div>
                  </div>

                  {metric.variants.map((variant) => (
                    <div key={variant.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {test.variants.find((v) => v.id === variant.id)
                            ?.name || "Variant"}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {metric.name.includes("%")
                            ? `${variant.value}%`
                            : variant.value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-sage rounded-full h-2"
                          style={{ width: `${Math.min(100, variant.value)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs font-medium text-green-600">
                          +{variant.improvement.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {test.winner && (
            <div className="mt-4 bg-green-50 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-800">
                  Winner:{" "}
                  {test.variants.find((v) => v.id === test.winner)?.name}
                </span>
                <span className="ml-4 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {test.confidenceLevel?.toFixed(1)}% confidence
                </span>
              </div>
            </div>
          )}

          {onViewDetails && (
            <div className="mt-4 text-right">
              <button
                onClick={() => onViewDetails(test.id)}
                className="text-sm text-sage hover:text-sage-dark"
              >
                View details
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Define interfaces for our data structures
interface MetricComparison {
  personalized: number;
  nonPersonalized: number;
  improvement: number;
  trend: number;
}

interface HistoricalData {
  dates: string[];
  personalized: number[];
  nonPersonalized: number[];
}

interface CategoryPercentage {
  name: string;
  percentage: number;
}

interface PersonalizationMetrics {
  conversionRate: MetricComparison;
  clickThroughRate: MetricComparison;
  averageOrderValue: MetricComparison;
  timeOnSite: MetricComparison;
  recommendationAccuracy: number;
  userSatisfaction: number;
  historicalData: HistoricalData;
  topRecommendationCategories: CategoryPercentage[];
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  isControl: boolean;
}

interface ABTestVariantMetric {
  id: string;
  value: number;
  improvement: number;
}

interface ABTestMetric {
  name: string;
  control: number;
  variants: ABTestVariantMetric[];
}

interface ABTestResult {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  winner?: string;
  confidenceLevel?: number;
}

// GraphQL query for personalization metrics
const PERSONALIZATION_METRICS = gql`
  query PersonalizationMetrics($period: Int) {
    personalizationMetrics(period: $period) {
      conversionRate {
        personalized
        nonPersonalized
        improvement
        trend
      }
      clickThroughRate {
        personalized
        nonPersonalized
        improvement
        trend
      }
      averageOrderValue {
        personalized
        nonPersonalized
        improvement
        trend
      }
      timeOnSite {
        personalized
        nonPersonalized
        improvement
        trend
      }
      recommendationAccuracy
      userSatisfaction
      historicalData {
        dates
        personalized
        nonPersonalized
      }
      topRecommendationCategories {
        name
        percentage
      }
    }
  }
`;

// GraphQL query for personalization effectiveness (from existing analytics)
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
      }
    }
  }
`;

// GraphQL query for collaborative filtering statistics
const COLLABORATIVE_FILTERING_STATS = gql`
  query CollaborativeFilteringStats($period: Int) {
    collaborativeFilteringStats(period: $period) {
      usersWithCollaborative
      averageSimilarity
      similarityDistribution {
        range
        count
      }
    }
  }
`;

// GraphQL query for user preference metrics
const USER_PREFERENCE_METRICS = gql`
  query UserPreferenceMetrics {
    userPreferenceMetrics {
      totalUsers
      surveyUsers
      collaborativeUsers
      topCategories {
        name
        count
        percentage
      }
    }
  }
`;

// GraphQL query for A/B test results
const AB_TEST_RESULTS = gql`
  query ABTestResults {
    abTestResults {
      id
      name
      description
      status
      startDate
      endDate
      variants {
        id
        name
        description
        trafficPercentage
        isControl
      }
      metrics {
        name
        control
        variants {
          id
          value
          improvement
        }
      }
      winner
      confidenceLevel
    }
  }
`;

// Time period options
const timePeriods = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

// Example data for development/preview
const examplePersonalizationMetrics = {
  conversionRate: {
    personalized: 4.8,
    nonPersonalized: 3.2,
    improvement: 50.0,
    trend: 12.5,
  },
  clickThroughRate: {
    personalized: 18.5,
    nonPersonalized: 12.7,
    improvement: 45.7,
    trend: 8.3,
  },
  averageOrderValue: {
    personalized: 87.45,
    nonPersonalized: 72.3,
    improvement: 21.0,
    trend: 5.2,
  },
  timeOnSite: {
    personalized: 320, // in minutes
    nonPersonalized: 210,
    improvement: 52.4,
    trend: 10.1,
  },
  recommendationAccuracy: 78.5,
  userSatisfaction: 8.7,
  historicalData: {
    dates: [
      "2025-03-29",
      "2025-04-05",
      "2025-04-12",
      "2025-04-19",
      "2025-04-26",
    ],
    personalized: [3.2, 3.8, 4.1, 4.5, 4.8],
    nonPersonalized: [3.1, 3.2, 3.1, 3.3, 3.2],
  },
  topRecommendationCategories: [
    { name: "Electronics", percentage: 32.5 },
    { name: "Clothing", percentage: 24.8 },
    { name: "Home & Garden", percentage: 18.3 },
    { name: "Beauty", percentage: 12.7 },
    { name: "Sports", percentage: 7.2 },
    { name: "Other", percentage: 4.5 },
  ],
};

const exampleABTestResults = [
  {
    id: "test-1",
    name: "Product Card Layout",
    description:
      "Testing vertical consistency in product cards vs. original layout",
    status: "running",
    startDate: "2025-04-10",
    variants: [
      {
        id: "control",
        name: "Original Layout",
        description: "Current product card implementation",
        trafficPercentage: 50,
        isControl: true,
      },
      {
        id: "variant-1",
        name: "Vertical Consistent Layout",
        description:
          "Fixed height product cards with consistent vertical alignment",
        trafficPercentage: 50,
        isControl: false,
      },
    ],
    metrics: [
      {
        name: "Conversion Rate (%)",
        control: 3.2,
        variants: [
          {
            id: "variant-1",
            value: 4.1,
            improvement: 28.1,
          },
        ],
      },
      {
        name: "Click-Through Rate (%)",
        control: 12.5,
        variants: [
          {
            id: "variant-1",
            value: 15.8,
            improvement: 26.4,
          },
        ],
      },
    ],
  },
  {
    id: "test-2",
    name: "Personalized Search Results",
    description:
      "Testing personalized search results vs. standard relevance-based results",
    status: "completed",
    startDate: "2025-03-01",
    endDate: "2025-03-28",
    variants: [
      {
        id: "control",
        name: "Standard Search",
        description: "Relevance-based search results",
        trafficPercentage: 50,
        isControl: true,
      },
      {
        id: "variant-1",
        name: "Personalized Search",
        description:
          "Search results influenced by user behavior and preferences",
        trafficPercentage: 50,
        isControl: false,
      },
    ],
    metrics: [
      {
        name: "Conversion Rate (%)",
        control: 2.8,
        variants: [
          {
            id: "variant-1",
            value: 4.3,
            improvement: 53.6,
          },
        ],
      },
      {
        name: "Click-Through Rate (%)",
        control: 10.2,
        variants: [
          {
            id: "variant-1",
            value: 18.7,
            improvement: 83.3,
          },
        ],
      },
    ],
    winner: "variant-1",
    confidenceLevel: 98.5,
  },
];

const PersonalizationTestingDashboard: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<string>("personalization");

  // Fetch personalization metrics
  const {
    data: metricsData,
    loading: metricsLoading,
    error: metricsError,
  } = useQuery(PERSONALIZATION_METRICS, {
    variables: { period },
    fetchPolicy: "network-only",
  });

  // Fetch A/B test results
  const {
    data: abTestData,
    loading: abTestLoading,
    error: abTestError,
  } = useQuery(AB_TEST_RESULTS, {
    fetchPolicy: "network-only",
  });

  // Fetch existing personalization effectiveness data
  const {
    data: existingPersonalizationData,
    loading: existingPersonalizationLoading,
    error: existingPersonalizationError,
  } = useQuery(PERSONALIZATION_EFFECTIVENESS, {
    variables: { period },
    fetchPolicy: "network-only",
  });

  // Fetch collaborative filtering statistics
  const {
    data: collaborativeFilteringData,
    loading: collaborativeFilteringLoading,
    error: collaborativeFilteringError,
  } = useQuery(COLLABORATIVE_FILTERING_STATS, {
    variables: { period },
    fetchPolicy: "network-only",
  });

  // Fetch user preference metrics
  const {
    data: userPreferenceData,
    loading: userPreferenceLoading,
    error: userPreferenceError,
  } = useQuery(USER_PREFERENCE_METRICS, {
    fetchPolicy: "network-only",
  });

  // Combine data from both personalization sources for a more comprehensive view
  const combinedPersonalizationData = {
    ...metricsData?.personalizationMetrics,
    existingMetrics: existingPersonalizationData?.personalizationEffectiveness,
    collaborativeFiltering:
      collaborativeFilteringData?.collaborativeFilteringStats,
    userPreferences: userPreferenceData?.userPreferenceMetrics,
  };

  // Find product card A/B test data
  const productCardTest = abTestData?.abTestResults?.find(
    (test: ABTestResult) =>
      test.name.includes("Product Card") ||
      test.description.includes("product card") ||
      test.description.includes("vertical consistency"),
  );

  // Handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(parseInt(e.target.value, 10));
  };

  // Handle view details
  const handleViewTestDetails = (testId: string) => {
    // In a real implementation, this would navigate to a detailed view
    console.log(`View details for test: ${testId}`);
  };

  // Handle loading and error states
  if (
    metricsLoading ||
    abTestLoading ||
    existingPersonalizationLoading ||
    collaborativeFilteringLoading ||
    userPreferenceLoading
  ) {
    return (
      <AdminLayout title="Personalization & A/B Testing">
        <AnalyticsNav />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (
    metricsError ||
    abTestError ||
    existingPersonalizationError ||
    collaborativeFilteringError ||
    userPreferenceError
  ) {
    return (
      <AdminLayout title="Personalization & A/B Testing">
        <AnalyticsNav />
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading dashboard data. Please try again later.</p>
          {metricsError && (
            <p className="text-sm mt-2">{metricsError.message}</p>
          )}
          {abTestError && <p className="text-sm mt-2">{abTestError.message}</p>}
          {existingPersonalizationError && (
            <p className="text-sm mt-2">
              {existingPersonalizationError.message}
            </p>
          )}
          {collaborativeFilteringError && (
            <p className="text-sm mt-2">
              {collaborativeFilteringError.message}
            </p>
          )}
          {userPreferenceError && (
            <p className="text-sm mt-2">{userPreferenceError.message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  // Use example data if API data is not available
  const metrics =
    metricsData?.personalizationMetrics || examplePersonalizationMetrics;
  const testResults = abTestData?.abTestResults || exampleABTestResults;

  return (
    <AdminLayout title="Personalization & A/B Testing">
      <AnalyticsNav />

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Personalization & A/B Testing</h1>
        <p className="text-gray-500">
          Analyze the effectiveness of personalization and A/B testing
        </p>
      </div>

      {/* Period selector */}
      <div className="mb-6">
        <label
          htmlFor="period"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Time Period
        </label>
        <select
          id="period"
          value={period}
          onChange={handlePeriodChange}
          className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 6 months</option>
        </select>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("personalization")}
            className={`${activeTab === "personalization" ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Personalization Effectiveness
          </button>
          <button
            onClick={() => setActiveTab("abtesting")}
            className={`${activeTab === "abtesting" ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <BeakerIcon className="w-5 h-5 mr-2" />
            A/B Testing Results
          </button>
          <button
            onClick={() => setActiveTab("productCards")}
            className={`${activeTab === "productCards" ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Product Card Consistency
          </button>
          <button
            onClick={() => setActiveTab("userPreferences")}
            className={`${activeTab === "userPreferences" ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            User Preferences
          </button>
          <button
            onClick={() => setActiveTab("collaborativeFiltering")}
            className={`${activeTab === "collaborativeFiltering" ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Collaborative Filtering
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === "personalization" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Personalization Effectiveness
            </h2>
            {combinedPersonalizationData && (
              <PersonalizationEffectiveness
                metrics={combinedPersonalizationData}
              />
            )}
          </div>
        )}

        {activeTab === "abtesting" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              A/B Testing Results
            </h2>
            <ABTestingVisualization
              testResults={abTestData?.abTestResults || []}
            />
          </div>
        )}

        {activeTab === "userPreferences" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              User Preference Analytics
            </h2>
            {combinedPersonalizationData?.userPreferences ? (
              <div className="space-y-8">
                {/* User Preference Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-2">
                      Total Users with Preferences
                    </h3>
                    <div className="text-3xl font-bold text-sage">
                      {combinedPersonalizationData.userPreferences.totalUsers.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-2">
                      Users with Survey Data
                    </h3>
                    <div className="text-3xl font-bold text-sage">
                      {combinedPersonalizationData.userPreferences.surveyUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {(
                        (combinedPersonalizationData.userPreferences
                          .surveyUsers /
                          combinedPersonalizationData.userPreferences
                            .totalUsers) *
                        100
                      ).toFixed(1)}
                      % of total users
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-2">
                      Users with Collaborative Filtering
                    </h3>
                    <div className="text-3xl font-bold text-sage">
                      {combinedPersonalizationData.userPreferences.collaborativeUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {(
                        (combinedPersonalizationData.userPreferences
                          .collaborativeUsers /
                          combinedPersonalizationData.userPreferences
                            .totalUsers) *
                        100
                      ).toFixed(1)}
                      % of total users
                    </div>
                  </div>
                </div>

                {/* Top Categories */}
                <div>
                  <h3 className="text-md font-medium mb-3">
                    Top Categories by User Preference
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {combinedPersonalizationData.userPreferences.topCategories.map(
                      (category: any, index: number) => (
                        <div key={index} className="mb-3 last:mb-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {category.name}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-sage rounded-full h-2"
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No user preference data available
              </div>
            )}
          </div>
        )}

        {activeTab === "collaborativeFiltering" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Collaborative Filtering Analytics
            </h2>
            {combinedPersonalizationData?.collaborativeFiltering ? (
              <div className="space-y-8">
                {/* Collaborative Filtering Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-2">
                      Users with Collaborative Filtering
                    </h3>
                    <div className="text-3xl font-bold text-sage">
                      {combinedPersonalizationData.collaborativeFiltering.usersWithCollaborative.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-2">
                      Average Similarity Score
                    </h3>
                    <div className="text-3xl font-bold text-sage">
                      {combinedPersonalizationData.collaborativeFiltering.averageSimilarity.toFixed(
                        2,
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Scale: 0.0 - 1.0 (higher is better)
                    </div>
                  </div>
                </div>

                {/* Similarity Distribution */}
                <div>
                  <h3 className="text-md font-medium mb-3">
                    Similarity Score Distribution
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {combinedPersonalizationData.collaborativeFiltering.similarityDistribution.map(
                      (item: any, index: number) => (
                        <div key={index} className="mb-3 last:mb-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {item.range}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {item.count} users
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-sage rounded-full h-2"
                              style={{
                                width: `${(item.count / combinedPersonalizationData.collaborativeFiltering.usersWithCollaborative) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Insights & Recommendations
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                    <li>
                      Higher similarity scores indicate better collaborative
                      filtering accuracy
                    </li>
                    <li>
                      Consider increasing the minimum similarity threshold for
                      more relevant recommendations
                    </li>
                    <li>
                      Users with very low similarity scores may need more
                      interaction data
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No collaborative filtering data available
              </div>
            )}
          </div>
        )}

        {activeTab === "productCards" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Product Card Consistency Test
            </h2>

            {productCardTest ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium">
                      {productCardTest.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {productCardTest.description}
                    </p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {productCardTest.status}
                  </div>
                </div>

                {/* Test metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {productCardTest.metrics.map(
                    (metric: ABTestMetric, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">{metric.name}</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Control
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                {metric.name.includes("%")
                                  ? `${metric.control}%`
                                  : metric.control}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 rounded-full h-2"
                                style={{
                                  width: `${Math.min(100, metric.control)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {metric.variants.map(
                            (variant: ABTestVariantMetric) => (
                              <div key={variant.id}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700">
                                    {productCardTest.variants.find(
                                      (v: ABTestVariant) => v.id === variant.id,
                                    )?.name || "Variant"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {metric.name.includes("%")
                                      ? `${variant.value}%`
                                      : variant.value}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-sage rounded-full h-2"
                                    style={{
                                      width: `${Math.min(100, variant.value)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-end mt-1">
                                  <span className="text-xs font-medium text-green-600">
                                    +{variant.improvement.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* User experience improvements */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    User Experience Improvements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl font-bold text-sage">28.1%</div>
                      <div className="text-sm text-gray-500">
                        Higher Conversion Rate
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl font-bold text-sage">26.4%</div>
                      <div className="text-sm text-gray-500">
                        Improved Click-Through Rate
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl font-bold text-sage">19.2%</div>
                      <div className="text-sm text-gray-500">
                        Longer Time on Page
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Recommendations
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                    <li>
                      Continue with the vertically consistent product card
                      layout based on positive metrics
                    </li>
                    <li>
                      Apply the same vertical consistency principles to other UI
                      components
                    </li>
                    <li>
                      Consider further optimizing image loading and rendering
                      for the consistent cards
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No product card consistency test data available
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PersonalizationTestingDashboard;
