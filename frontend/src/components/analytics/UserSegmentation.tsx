import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  UserIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowPathIcon,
  DeviceTabletIcon,
} from "@heroicons/react/24/outline";

interface UserSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  characteristics: string[];
  topCategories: string[];
  topBrands: string[];
  avgSessionDuration: number;
  conversionRate: number;
}

interface UserSegmentationProps {
  segments: UserSegment[];
  onSegmentClick?: (segment: UserSegment) => void;
}

const UserSegmentation: React.FC<UserSegmentationProps> = ({
  segments,
  onSegmentClick,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | null>(
    null,
  );

  const handleSegmentClick = (segment: UserSegment) => {
    setSelectedSegment(segment);
    if (onSegmentClick) {
      onSegmentClick(segment);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: segments.map((segment) => segment.name),
    datasets: [
      {
        data: segments.map((segment) => segment.count),
        backgroundColor: segments.map((segment) => segment.color),
        borderColor: segments.map((segment) => segment.color),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const segment = segments[context.dataIndex];
            return `${label}: ${value.toLocaleString()} (${segment.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Anonymous User Segments
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Behavioral segments based on interaction patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Chart */}
        <div className="h-64">
          <Pie data={chartData} options={chartOptions} />
        </div>

        {/* Segments List */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedSegment?.id === segment.id
                    ? "border-sage bg-sage bg-opacity-10"
                    : "border-gray-200 hover:border-sage hover:bg-gray-50"
                }`}
                onClick={() => handleSegmentClick(segment)}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full bg-opacity-20`}
                    style={{ backgroundColor: segment.color }}
                  >
                    <segment.icon
                      className="h-5 w-5"
                      style={{ color: segment.color }}
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {segment.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {segment.count.toLocaleString()} users (
                      {segment.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Segment Details */}
      {selectedSegment && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {selectedSegment.name}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {selectedSegment.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Characteristics */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Characteristics
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedSegment.characteristics.map(
                  (characteristic, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {characteristic}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Top Categories & Brands */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Top Categories
              </h5>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                {selectedSegment.topCategories.map((category, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {category}
                  </li>
                ))}
              </ul>

              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Top Brands
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedSegment.topBrands.map((brand, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {brand}
                  </li>
                ))}
              </ul>
            </div>

            {/* Metrics */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Metrics
              </h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      Avg. Session Duration
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {(selectedSegment.avgSessionDuration / 60).toFixed(1)} min
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-sage rounded-full h-1.5"
                      style={{
                        width: `${Math.min(100, (selectedSegment.avgSessionDuration / 60 / 10) * 100)}%`,
                        backgroundColor: selectedSegment.color,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      Conversion Rate
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {(selectedSegment.conversionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-sage rounded-full h-1.5"
                      style={{
                        width: `${Math.min(100, selectedSegment.conversionRate * 100)}%`,
                        backgroundColor: selectedSegment.color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Example segments for demonstration
export const exampleSegments: UserSegment[] = [
  {
    id: "browsers",
    name: "Browsers",
    description: "Users who browse products but rarely add to cart or purchase",
    count: 12500,
    percentage: 45.5,
    color: "#638C6B",
    icon: UserIcon,
    characteristics: [
      "Multiple page views",
      "Low cart additions",
      "Short session duration",
      "Often first-time visitors",
    ],
    topCategories: ["Electronics", "Clothing", "Home Decor"],
    topBrands: ["Apple", "Samsung", "Nike"],
    avgSessionDuration: 180, // 3 minutes
    conversionRate: 0.02, // 2%
  },
  {
    id: "researchers",
    name: "Researchers",
    description:
      "Users who spend significant time researching products before making decisions",
    count: 8200,
    percentage: 29.8,
    color: "#7EA476",
    icon: MagnifyingGlassIcon,
    characteristics: [
      "Multiple search queries",
      "Filter usage",
      "Long session duration",
      "Product comparisons",
    ],
    topCategories: ["Electronics", "Appliances", "Furniture"],
    topBrands: ["Sony", "LG", "Bose"],
    avgSessionDuration: 480, // 8 minutes
    conversionRate: 0.15, // 15%
  },
  {
    id: "shoppers",
    name: "Shoppers",
    description:
      "Users who actively add items to cart and have high purchase intent",
    count: 4300,
    percentage: 15.6,
    color: "#9ABD82",
    icon: ShoppingCartIcon,
    characteristics: [
      "Add to cart actions",
      "Checkout page views",
      "Price comparison",
      "Coupon searches",
    ],
    topCategories: ["Clothing", "Beauty", "Accessories"],
    topBrands: ["Zara", "H&M", "Sephora"],
    avgSessionDuration: 360, // 6 minutes
    conversionRate: 0.35, // 35%
  },
  {
    id: "returners",
    name: "Returners",
    description: "Users who visit the site multiple times before converting",
    count: 2500,
    percentage: 9.1,
    color: "#B7D68E",
    icon: ArrowPathIcon,
    characteristics: [
      "Multiple sessions",
      "Returning visits",
      "Saved items",
      "Consistent browsing patterns",
    ],
    topCategories: ["Furniture", "Jewelry", "Home Appliances"],
    topBrands: ["Ikea", "Tiffany", "Dyson"],
    avgSessionDuration: 300, // 5 minutes per session
    conversionRate: 0.28, // 28%
  },
];

export default UserSegmentation;
