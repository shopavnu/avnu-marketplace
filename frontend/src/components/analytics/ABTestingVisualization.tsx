import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import {
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export interface ABTestResult {
  id: string;
  name: string;
  description: string;
  status: "running" | "completed" | "stopped";
  startDate: string;
  endDate?: string;
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  winner?: string;
  confidenceLevel?: number;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  isControl: boolean;
}

export interface ABTestMetric {
  name: string;
  control: number;
  variants: {
    id: string;
    value: number;
    improvement: number;
  }[];
}

interface ABTestingVisualizationProps {
  testResults: ABTestResult[];
  onViewDetails?: (testId: string) => void;
}

const ABTestingVisualization: React.FC<ABTestingVisualizationProps> = ({
  testResults,
  onViewDetails,
}) => {
  // Get active tests
  const activeTests = testResults.filter((test) => test.status === "running");
  const completedTests = testResults.filter(
    (test) => test.status === "completed",
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate chart data for a test
  const generateChartData = (test: ABTestResult, metricIndex: number = 0) => {
    const metric = test.metrics[metricIndex];

    return {
      labels: test.variants.map((variant) => variant.name),
      datasets: [
        {
          label: metric.name,
          data: [metric.control, ...metric.variants.map((v) => v.value)],
          backgroundColor: test.variants.map((variant, index) =>
            variant.isControl
              ? "#638C6B"
              : index % 2 === 0
                ? "#9ABD82"
                : "#B7D68E",
          ),
          borderColor: test.variants.map((variant) =>
            variant.isControl ? "#4A6B4F" : "#7A9D62",
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
          afterLabel: function (context) {
            const testIndex =
              context.dataIndex === 0
                ? activeTests.length > 0
                  ? 0
                  : 0
                : context.dataIndex - 1;

            const test =
              activeTests.length > 0 ? activeTests[0] : completedTests[0];
            const metric = test.metrics[0];

            if (context.dataIndex === 0) {
              return "Control variant";
            } else {
              const variant = metric.variants[context.dataIndex - 1];
              const improvement = variant.improvement;
              return `${improvement >= 0 ? "+" : ""}${improvement.toFixed(2)}% vs control`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Active Tests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Active A/B Tests
          </h3>
        </div>

        <div className="p-6">
          {activeTests.length > 0 ? (
            <div className="space-y-6">
              {activeTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 flex items-center">
                        <BeakerIcon className="h-5 w-5 mr-2 text-sage" />
                        {test.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {test.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Running
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        Started {formatDate(test.startDate)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="h-64">
                        <Bar
                          data={generateChartData(test)}
                          options={chartOptions}
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Variants
                      </h5>
                      <div className="space-y-2">
                        {test.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              {variant.isControl && (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 mr-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    C
                                  </span>
                                </span>
                              )}
                              <span className="text-sm text-gray-700">
                                {variant.name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {variant.trafficPercentage}%
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() =>
                            onViewDetails && onViewDetails(test.id)
                          }
                          className="inline-flex items-center px-3 py-2 border border-sage rounded-md shadow-sm text-sm font-medium text-sage bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No active A/B tests</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Tests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Completed A/B Tests
          </h3>
        </div>

        <div className="p-6">
          {completedTests.length > 0 ? (
            <div className="space-y-6">
              {completedTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 flex items-center">
                        {test.winner ? (
                          <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
                        )}
                        {test.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {test.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(test.startDate)} -{" "}
                        {formatDate(test.endDate || "")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="h-64">
                        <Bar
                          data={generateChartData(test)}
                          options={chartOptions}
                        />
                      </div>
                    </div>

                    <div>
                      {test.winner && (
                        <div className="mb-4 p-3 bg-green-50 rounded-md">
                          <h5 className="text-sm font-medium text-green-800 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Winner:{" "}
                            {
                              test.variants.find((v) => v.id === test.winner)
                                ?.name
                            }
                          </h5>
                          <p className="text-xs text-green-700 mt-1">
                            {test.confidenceLevel}% confidence level
                          </p>
                        </div>
                      )}

                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Results
                      </h5>
                      <div className="space-y-2">
                        {test.metrics.map((metric) => (
                          <div key={metric.name} className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {metric.name}
                              </span>
                            </div>
                            {metric.variants.map((variant) => {
                              const variantData = test.variants.find(
                                (v) => v.id === variant.id,
                              );
                              return (
                                <div key={variant.id} className="mb-2">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs text-gray-500">
                                      {variantData?.name}
                                    </span>
                                    <span className="text-xs text-gray-700">
                                      {variant.improvement >= 0 ? "+" : ""}
                                      {variant.improvement.toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="rounded-full h-1.5"
                                      style={{
                                        width: `${Math.max(0, 50 + variant.improvement / 2)}%`,
                                        backgroundColor:
                                          variant.improvement >= 0
                                            ? "#638C6B"
                                            : "#EF4444",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() =>
                            onViewDetails && onViewDetails(test.id)
                          }
                          className="inline-flex items-center px-3 py-2 border border-sage rounded-md shadow-sm text-sm font-medium text-sage bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No completed A/B tests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABTestingVisualization;
