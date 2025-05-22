import React from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface PersonalizationMetrics {
  conversionRate: {
    personalized: number;
    nonPersonalized: number;
    improvement: number;
    trend: number;
  };
  clickThroughRate: {
    personalized: number;
    nonPersonalized: number;
    improvement: number;
    trend: number;
  };
  averageOrderValue: {
    personalized: number;
    nonPersonalized: number;
    improvement: number;
    trend: number;
  };
  timeOnSite: {
    personalized: number;
    nonPersonalized: number;
    improvement: number;
    trend: number;
  };
  recommendationAccuracy: number;
  userSatisfaction: number;
  historicalData: {
    dates: string[];
    personalized: number[];
    nonPersonalized: number[];
  };
  topRecommendationCategories: {
    name: string;
    percentage: number;
  }[];
}

interface PersonalizationEffectivenessProps {
  metrics: PersonalizationMetrics;
}

const PersonalizationEffectiveness: React.FC<
  PersonalizationEffectivenessProps
> = ({ metrics }) => {
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Historical data chart
  const historicalData = {
    labels: metrics.historicalData.dates,
    datasets: [
      {
        label: "Personalized",
        data: metrics.historicalData.personalized,
        borderColor: "#638C6B",
        backgroundColor: "rgba(99, 140, 107, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Non-Personalized",
        data: metrics.historicalData.nonPersonalized,
        borderColor: "#9ABD82",
        backgroundColor: "rgba(154, 189, 130, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Conversion Rate (%)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  // Category distribution chart
  const categoryData = {
    labels: metrics.topRecommendationCategories.map((cat) => cat.name),
    datasets: [
      {
        data: metrics.topRecommendationCategories.map((cat) => cat.percentage),
        backgroundColor: [
          "#638C6B",
          "#7EA476",
          "#9ABD82",
          "#B7D68E",
          "#D4EE9A",
          "#E6F5A3",
        ],
        borderColor: [
          "#4A6B4F",
          "#5F7D59",
          "#7A9D62",
          "#9AB56E",
          "#B6CE7A",
          "#C8D686",
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw as number;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  // Metric card component
  const MetricCard = ({
    title,
    personalized,
    nonPersonalized,
    improvement,
    trend,
    formatter,
  }: {
    title: string;
    personalized: number;
    nonPersonalized: number;
    improvement: number;
    trend: number;
    formatter: (value: number) => string;
  }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-900">
            {formatter(personalized)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            vs. {formatter(nonPersonalized)} non-personalized
          </p>
        </div>
        <div
          className={`flex items-center ${improvement >= 0 ? "text-green-500" : "text-red-500"}`}
        >
          {improvement >= 0 ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(improvement).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Trend (30 days)</span>
          <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="rounded-full h-1.5"
            style={{
              width: `${Math.max(0, 50 + trend)}%`,
              backgroundColor: trend >= 0 ? "#638C6B" : "#EF4444",
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Conversion Rate"
          personalized={metrics.conversionRate.personalized}
          nonPersonalized={metrics.conversionRate.nonPersonalized}
          improvement={metrics.conversionRate.improvement}
          trend={metrics.conversionRate.trend}
          formatter={formatPercentage}
        />
        <MetricCard
          title="Click-Through Rate"
          personalized={metrics.clickThroughRate.personalized}
          nonPersonalized={metrics.clickThroughRate.nonPersonalized}
          improvement={metrics.clickThroughRate.improvement}
          trend={metrics.clickThroughRate.trend}
          formatter={formatPercentage}
        />
        <MetricCard
          title="Average Order Value"
          personalized={metrics.averageOrderValue.personalized}
          nonPersonalized={metrics.averageOrderValue.nonPersonalized}
          improvement={metrics.averageOrderValue.improvement}
          trend={metrics.averageOrderValue.trend}
          formatter={formatCurrency}
        />
        <MetricCard
          title="Time on Site"
          personalized={metrics.timeOnSite.personalized}
          nonPersonalized={metrics.timeOnSite.nonPersonalized}
          improvement={metrics.timeOnSite.improvement}
          trend={metrics.timeOnSite.trend}
          formatter={formatTime}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Performance */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Personalization Performance Trend
          </h3>
          <div className="h-64">
            <Line data={historicalData} options={lineOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Recommendation Accuracy
              </h4>
              <div className="flex items-end">
                <p className="text-xl font-semibold text-gray-900">
                  {metrics.recommendationAccuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 ml-2 mb-1">
                  of recommendations clicked
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                User Satisfaction
              </h4>
              <div className="flex items-end">
                <p className="text-xl font-semibold text-gray-900">
                  {metrics.userSatisfaction.toFixed(1)}/10
                </p>
                <p className="text-xs text-gray-500 ml-2 mb-1">
                  average rating
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Recommendation Categories
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 text-center">
              Based on user interactions with personalized recommendations
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Personalization Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Key Findings
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-sage font-bold mr-2">•</span>
                <span>
                  Personalized experiences show a{" "}
                  <span className="font-medium">
                    {metrics.conversionRate.improvement.toFixed(1)}% higher
                    conversion rate
                  </span>{" "}
                  compared to non-personalized experiences.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-sage font-bold mr-2">•</span>
                <span>
                  Users spend{" "}
                  <span className="font-medium">
                    {(
                      ((metrics.timeOnSite.personalized -
                        metrics.timeOnSite.nonPersonalized) /
                        metrics.timeOnSite.nonPersonalized) *
                      100
                    ).toFixed(1)}
                    % more time
                  </span>{" "}
                  on the site when shown personalized content.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-sage font-bold mr-2">•</span>
                <span>
                  The{" "}
                  <span className="font-medium">
                    {metrics.topRecommendationCategories[0].name}
                  </span>{" "}
                  category has the highest engagement rate among personalized
                  recommendations.
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Recommendations
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-sage font-bold mr-2">•</span>
                <span>
                  Increase personalization visibility on product listing pages
                  to improve discovery.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-sage font-bold mr-2">•</span>
                <span>
                  Implement A/B testing for personalization algorithms to
                  optimize recommendation accuracy.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-sage font-bold mr-2">•</span>
                <span>
                  Expand personalization to include recently viewed products for
                  anonymous users.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationEffectiveness;
