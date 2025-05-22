import React from "react";

interface HistoricalMetric {
  date: string;
  totalRevenue: number;
  totalCost: number;
  platformAdRevenue: number;
  productSalesFromAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
}

interface MetricsTrendChartProps {
  historicalMetrics: HistoricalMetric[];
  metricType: "revenue" | "conversions" | "platform";
  title: string;
}

const MetricsTrendChart: React.FC<MetricsTrendChartProps> = ({
  historicalMetrics,
  metricType,
  title,
}) => {
  // Calculate summary metrics
  const totalRevenue = historicalMetrics.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  );
  const totalCost = historicalMetrics.reduce(
    (sum, item) => sum + item.totalCost,
    0,
  );
  const totalConversions = historicalMetrics.reduce(
    (sum, item) => sum + item.totalConversions,
    0,
  );
  const totalClicks = historicalMetrics.reduce(
    (sum, item) => sum + item.totalClicks,
    0,
  );
  const platformRevenue = historicalMetrics.reduce(
    (sum, item) => sum + item.platformAdRevenue,
    0,
  );
  const productSales = historicalMetrics.reduce(
    (sum, item) => sum + item.productSalesFromAds,
    0,
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p>Chart visualization for {title}</p>
        <p className="text-sm text-gray-500">
          Showing data from {historicalMetrics.length} data points
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {metricType === "revenue" && (
            <>
              <div className="p-2 bg-white rounded">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="font-medium">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-white rounded">
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="font-medium">${totalCost.toFixed(2)}</p>
              </div>
            </>
          )}
          {metricType === "conversions" && (
            <>
              <div className="p-2 bg-white rounded">
                <p className="text-sm text-gray-500">Total Conversions</p>
                <p className="font-medium">{totalConversions}</p>
              </div>
              <div className="p-2 bg-white rounded">
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="font-medium">
                  {totalClicks > 0
                    ? ((totalConversions / totalClicks) * 100).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </div>
            </>
          )}
          {metricType === "platform" && (
            <>
              <div className="p-2 bg-white rounded">
                <p className="text-sm text-gray-500">Platform Revenue</p>
                <p className="font-medium">${platformRevenue.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-white rounded">
                <p className="text-sm text-gray-500">Product Sales</p>
                <p className="font-medium">${productSales.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsTrendChart;
