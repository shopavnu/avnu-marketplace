import React from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roi: number;
}

interface Campaign {
  id: string;
  name: string;
  merchantName: string;
  status: string;
  startDate: string;
  endDate?: string;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCost: number;
  roi: number;
  dailyMetrics: DailyMetric[];
}

interface MerchantAdPerformanceProps {
  campaign: Campaign;
}

const MerchantAdPerformance: React.FC<MerchantAdPerformanceProps> = ({
  campaign,
}) => {
  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Calculate additional metrics
  const costPerClick =
    campaign.totalClicks > 0 ? campaign.totalCost / campaign.totalClicks : 0;

  const costPerConversion =
    campaign.totalConversions > 0
      ? campaign.totalCost / campaign.totalConversions
      : 0;

  const revenuePerConversion =
    campaign.totalConversions > 0
      ? campaign.totalRevenue / campaign.totalConversions
      : 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{campaign.name}</h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}
          >
            {campaign.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {campaign.merchantName} • {campaign.startDate} to{" "}
          {campaign.endDate || "Present"}
        </p>
      </div>

      <div className="p-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <EyeIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Impressions</p>
                <p className="text-sm font-medium">
                  {campaign.totalImpressions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <CursorArrowRaysIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Clicks</p>
                <p className="text-sm font-medium">
                  {campaign.totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">CTR</p>
                <p className="text-sm font-medium">
                  {campaign.clickThroughRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <ShoppingCartIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Conversions</p>
                <p className="text-sm font-medium">
                  {campaign.totalConversions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Conversion Rate</p>
                <p className="text-sm font-medium">
                  {campaign.conversionRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-sm font-medium">
                  {formatCurrency(campaign.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial metrics */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Financial Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Cost</p>
              <p className="text-sm font-medium">
                {formatCurrency(campaign.totalCost)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">ROI</p>
              <p
                className={`text-sm font-medium ${campaign.roi >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {campaign.roi.toFixed(2)}%
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Cost per Click</p>
              <p className="text-sm font-medium">
                {formatCurrency(costPerClick)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Cost per Conversion</p>
              <p className="text-sm font-medium">
                {formatCurrency(costPerConversion)}
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Campaign Insights
          </h3>
          <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
            <li>
              {campaign.clickThroughRate > 5
                ? "Strong click-through rate above industry average (5%)"
                : "Click-through rate below industry average (5%), consider optimizing ad creative"}
            </li>
            <li>
              {campaign.conversionRate > 3
                ? "Excellent conversion rate above industry average (3%)"
                : "Conversion rate below industry average (3%), consider optimizing landing pages"}
            </li>
            <li>
              {campaign.roi > 200
                ? "Outstanding ROI performance, consider increasing ad spend"
                : campaign.roi > 100
                  ? "Good ROI performance, maintain current strategy"
                  : "ROI below target, review campaign targeting and messaging"}
            </li>
            <li>
              Average revenue per conversion:{" "}
              {formatCurrency(revenuePerConversion)}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MerchantAdPerformance;
