import { useState } from "react";
import {
  EyeIcon,
  CursorArrowRaysIcon,
  ShoppingCartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Mock data for charts - in a real app, this would come from an API
const mockTimeSeriesData = {
  views: [
    { date: "2025-03-22", value: 42 },
    { date: "2025-03-23", value: 38 },
    { date: "2025-03-24", value: 45 },
    { date: "2025-03-25", value: 52 },
    { date: "2025-03-26", value: 48 },
    { date: "2025-03-27", value: 50 },
    { date: "2025-03-28", value: 55 },
    { date: "2025-03-29", value: 62 },
    { date: "2025-03-30", value: 68 },
    { date: "2025-03-31", value: 72 },
    { date: "2025-04-01", value: 70 },
    { date: "2025-04-02", value: 75 },
    { date: "2025-04-03", value: 78 },
    { date: "2025-04-04", value: 82 },
    { date: "2025-04-05", value: 80 },
    { date: "2025-04-06", value: 85 },
    { date: "2025-04-07", value: 90 },
    { date: "2025-04-08", value: 88 },
    { date: "2025-04-09", value: 92 },
    { date: "2025-04-10", value: 98 },
    { date: "2025-04-11", value: 95 },
    { date: "2025-04-12", value: 100 },
    { date: "2025-04-13", value: 105 },
    { date: "2025-04-14", value: 110 },
    { date: "2025-04-15", value: 115 },
    { date: "2025-04-16", value: 120 },
    { date: "2025-04-17", value: 125 },
    { date: "2025-04-18", value: 130 },
    { date: "2025-04-19", value: 128 },
    { date: "2025-04-20", value: 135 },
    { date: "2025-04-21", value: 140 },
  ],
  clicks: [
    { date: "2025-03-22", value: 12 },
    { date: "2025-03-23", value: 10 },
    { date: "2025-03-24", value: 14 },
    { date: "2025-03-25", value: 16 },
    { date: "2025-03-26", value: 15 },
    { date: "2025-03-27", value: 18 },
    { date: "2025-03-28", value: 20 },
    { date: "2025-03-29", value: 22 },
    { date: "2025-03-30", value: 25 },
    { date: "2025-03-31", value: 24 },
    { date: "2025-04-01", value: 26 },
    { date: "2025-04-02", value: 28 },
    { date: "2025-04-03", value: 27 },
    { date: "2025-04-04", value: 30 },
    { date: "2025-04-05", value: 32 },
    { date: "2025-04-06", value: 34 },
    { date: "2025-04-07", value: 36 },
    { date: "2025-04-08", value: 35 },
    { date: "2025-04-09", value: 38 },
    { date: "2025-04-10", value: 40 },
    { date: "2025-04-11", value: 42 },
    { date: "2025-04-12", value: 44 },
    { date: "2025-04-13", value: 45 },
    { date: "2025-04-14", value: 48 },
    { date: "2025-04-15", value: 50 },
    { date: "2025-04-16", value: 52 },
    { date: "2025-04-17", value: 54 },
    { date: "2025-04-18", value: 56 },
    { date: "2025-04-19", value: 55 },
    { date: "2025-04-20", value: 58 },
    { date: "2025-04-21", value: 60 },
  ],
  conversions: [
    { date: "2025-03-22", value: 1 },
    { date: "2025-03-23", value: 0 },
    { date: "2025-03-24", value: 2 },
    { date: "2025-03-25", value: 1 },
    { date: "2025-03-26", value: 1 },
    { date: "2025-03-27", value: 2 },
    { date: "2025-03-28", value: 1 },
    { date: "2025-03-29", value: 3 },
    { date: "2025-03-30", value: 2 },
    { date: "2025-03-31", value: 1 },
    { date: "2025-04-01", value: 2 },
    { date: "2025-04-02", value: 3 },
    { date: "2025-04-03", value: 2 },
    { date: "2025-04-04", value: 4 },
    { date: "2025-04-05", value: 3 },
    { date: "2025-04-06", value: 2 },
    { date: "2025-04-07", value: 4 },
    { date: "2025-04-08", value: 3 },
    { date: "2025-04-09", value: 5 },
    { date: "2025-04-10", value: 4 },
    { date: "2025-04-11", value: 3 },
    { date: "2025-04-12", value: 5 },
    { date: "2025-04-13", value: 4 },
    { date: "2025-04-14", value: 6 },
    { date: "2025-04-15", value: 5 },
    { date: "2025-04-16", value: 4 },
    { date: "2025-04-17", value: 6 },
    { date: "2025-04-18", value: 5 },
    { date: "2025-04-19", value: 7 },
    { date: "2025-04-20", value: 6 },
    { date: "2025-04-21", value: 8 },
  ],
};

// Traffic source breakdown
const trafficSources = [
  { source: "Direct", percentage: 35, color: "bg-blue-500" },
  { source: "Organic Search", percentage: 25, color: "bg-green-500" },
  { source: "Social Media", percentage: 20, color: "bg-purple-500" },
  { source: "Referral", percentage: 15, color: "bg-yellow-500" },
  { source: "Email", percentage: 5, color: "bg-red-500" },
];

interface ProductPerformanceMetricsProps {
  productId: string;
  productName: string;
}

const ProductPerformanceMetrics = ({
  productId,
  productName,
}: ProductPerformanceMetricsProps) => {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState<
    "views" | "clicks" | "conversions"
  >("views");

  // Calculate totals and changes
  const calculateMetrics = (data: { date: string; value: number }[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstHalfTotal = firstHalf.reduce((sum, item) => sum + item.value, 0);
    const secondHalfTotal = secondHalf.reduce(
      (sum, item) => sum + item.value,
      0,
    );

    const percentChange =
      firstHalfTotal === 0
        ? 100
        : ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;

    return {
      total,
      percentChange,
      changeType:
        percentChange >= 0 ? ("increase" as const) : ("decrease" as const),
    };
  };

  const viewsMetrics = calculateMetrics(mockTimeSeriesData.views);
  const clicksMetrics = calculateMetrics(mockTimeSeriesData.clicks);
  const conversionsMetrics = calculateMetrics(mockTimeSeriesData.conversions);

  // Calculate click-through rate and conversion rate
  const ctr =
    viewsMetrics.total > 0
      ? (clicksMetrics.total / viewsMetrics.total) * 100
      : 0;

  const conversionRate =
    clicksMetrics.total > 0
      ? (conversionsMetrics.total / clicksMetrics.total) * 100
      : 0;

  // Render the mini chart (simplified version)
  const renderMiniChart = (
    data: { date: string; value: number }[],
    color: string,
  ) => {
    const maxValue = Math.max(...data.map((item) => item.value));
    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="h-12 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  // Render the main chart
  const renderChart = (
    data: { date: string; value: number }[],
    color: string,
  ) => {
    const maxValue = Math.max(...data.map((item) => item.value));
    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="h-64 w-full">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <linearGradient
              id={`gradient-${selectedMetric}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className="grid">
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
              />
            ))}
          </g>

          {/* Area under the line */}
          <path
            d={`M0,100 L0,${100 - (data[0].value / maxValue) * 100} ${points} L100,100 Z`}
            fill={`url(#gradient-${selectedMetric})`}
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="white"
                stroke={color}
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Performance Metrics
          </h3>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setDateRange("7d")}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                dateRange === "7d"
                  ? "text-sage z-10 border-sage"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              7 days
            </button>
            <button
              type="button"
              onClick={() => setDateRange("30d")}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                dateRange === "30d"
                  ? "text-sage z-10 border-sage"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              30 days
            </button>
            <button
              type="button"
              onClick={() => setDateRange("90d")}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                dateRange === "90d"
                  ? "text-sage z-10 border-sage"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              90 days
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Views Card */}
          <div
            className={`bg-white overflow-hidden shadow rounded-lg border-2 ${
              selectedMetric === "views"
                ? "border-blue-500"
                : "border-transparent"
            } cursor-pointer hover:border-blue-300`}
            onClick={() => setSelectedMetric("views")}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <EyeIcon
                    className="h-6 w-6 text-blue-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Views
                    </dt>
                    <dd>
                      <div className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {viewsMetrics.total.toLocaleString()}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            viewsMetrics.changeType === "increase"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {viewsMetrics.changeType === "increase" ? (
                            <ArrowUpIcon
                              className="self-center flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowDownIcon
                              className="self-center flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="ml-1">
                            {Math.abs(viewsMetrics.percentChange).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
                <div className="ml-auto">
                  {renderMiniChart(mockTimeSeriesData.views, "#3b82f6")}
                </div>
              </div>
            </div>
          </div>

          {/* Clicks Card */}
          <div
            className={`bg-white overflow-hidden shadow rounded-lg border-2 ${
              selectedMetric === "clicks"
                ? "border-purple-500"
                : "border-transparent"
            } cursor-pointer hover:border-purple-300`}
            onClick={() => setSelectedMetric("clicks")}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <CursorArrowRaysIcon
                    className="h-6 w-6 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Clicks
                    </dt>
                    <dd>
                      <div className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {clicksMetrics.total.toLocaleString()}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            clicksMetrics.changeType === "increase"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {clicksMetrics.changeType === "increase" ? (
                            <ArrowUpIcon
                              className="self-center flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowDownIcon
                              className="self-center flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="ml-1">
                            {Math.abs(clicksMetrics.percentChange).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
                <div className="ml-auto">
                  {renderMiniChart(mockTimeSeriesData.clicks, "#8b5cf6")}
                </div>
              </div>
            </div>
          </div>

          {/* Conversions Card */}
          <div
            className={`bg-white overflow-hidden shadow rounded-lg border-2 ${
              selectedMetric === "conversions"
                ? "border-green-500"
                : "border-transparent"
            } cursor-pointer hover:border-green-300`}
            onClick={() => setSelectedMetric("conversions")}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <ShoppingCartIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Conversions
                    </dt>
                    <dd>
                      <div className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {conversionsMetrics.total.toLocaleString()}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            conversionsMetrics.changeType === "increase"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {conversionsMetrics.changeType === "increase" ? (
                            <ArrowUpIcon
                              className="self-center flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowDownIcon
                              className="self-center flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="ml-1">
                            {Math.abs(conversionsMetrics.percentChange).toFixed(
                              1,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
                <div className="ml-auto">
                  {renderMiniChart(mockTimeSeriesData.conversions, "#10b981")}
                </div>
              </div>
            </div>
          </div>

          {/* Rates Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <ChartBarIcon
                    className="h-6 w-6 text-yellow-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Conversion Rate
                    </dt>
                    <dd>
                      <div className="flex flex-col">
                        <div className="text-2xl font-semibold text-gray-900">
                          {conversionRate.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          CTR: {ctr.toFixed(2)}%
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-4">
              {selectedMetric === "views" && "Product Views Over Time"}
              {selectedMetric === "clicks" && "Product Clicks Over Time"}
              {selectedMetric === "conversions" &&
                "Product Conversions Over Time"}
            </h4>
            {selectedMetric === "views" &&
              renderChart(mockTimeSeriesData.views, "#3b82f6")}
            {selectedMetric === "clicks" &&
              renderChart(mockTimeSeriesData.clicks, "#8b5cf6")}
            {selectedMetric === "conversions" &&
              renderChart(mockTimeSeriesData.conversions, "#10b981")}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Traffic Sources
            </h4>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {source.source}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {source.percentage}%
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${source.color} h-2 rounded-full`}
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceMetrics;
