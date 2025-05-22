import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

// Create mock components for the missing imports
interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => (
  <div className="admin-layout">
    <h1>{title}</h1>
    <div>{children}</div>
  </div>
);

interface AdminHeaderProps {
  title: string;
  description?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description }) => (
  <div className="admin-header">
    <h1>{title}</h1>
    {description && <p>{description}</p>}
  </div>
);

const AnalyticsNav: React.FC = () => (
  <nav className="analytics-nav">
    <ul>
      <li>Dashboard</li>
      <li>Advanced Analytics</li>
      <li>Personalization Testing</li>
    </ul>
  </nav>
);

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">Loading...</div>
);

import FunnelVisualization from "../../../components/analytics/FunnelVisualization";
import HeatmapVisualization from "../../../components/analytics/HeatmapVisualization";
import UserSegmentation, {
  exampleSegments,
} from "../../../components/analytics/UserSegmentation";

// GraphQL query for user segmentation data
const USER_SEGMENTATION_DATA = gql`
  query UserSegmentationData($period: Int!) {
    userSegmentationData(period: $period) {
      segments {
        id
        name
        description
        count
        percentage
        color
        characteristics
        topCategories
        topBrands
        avgSessionDuration
        conversionRate
      }
      pageHeatmapData {
        x
        y
        value
      }
      funnelData {
        name
        value
        percentage
        conversionRate
      }
    }
  }
`;

// Time period options
const timePeriods = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

const AdvancedAnalytics: React.FC = () => {
  const [period, setPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState("segmentation");

  // Fetch data from GraphQL API
  const { data, loading, error } = useQuery(USER_SEGMENTATION_DATA, {
    variables: { period },
    fetchPolicy: "network-only",
  });

  // Handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(parseInt(e.target.value, 10));
  };

  // Render error state
  if (error) {
    return (
      <AdminLayout title="Advanced Analytics">
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <h2 className="text-lg font-medium mb-2">
            Error loading analytics data
          </h2>
          <p>{error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <AdminLayout title="Advanced Analytics">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  // Use example data if API data is not available
  const segmentationData = data?.userSegmentationData || {
    segments: exampleSegments,
    pageHeatmapData: Array.from({ length: 100 }, (_, i) => ({
      x: Math.floor(i / 10),
      y: i % 10,
      value: Math.floor(Math.random() * 50),
    })),
    funnelData: [
      {
        name: "Site Visitors",
        value: 25000,
        percentage: 100,
        conversionRate: 100,
      },
      {
        name: "Product Viewers",
        value: 18750,
        percentage: 75,
        conversionRate: 75,
      },
      { name: "Searchers", value: 12500, percentage: 66.7, conversionRate: 50 },
      {
        name: "Added to Cart",
        value: 6250,
        percentage: 50,
        conversionRate: 25,
      },
      {
        name: "Reached Checkout",
        value: 3125,
        percentage: 50,
        conversionRate: 12.5,
      },
      {
        name: "Completed Purchase",
        value: 1250,
        percentage: 40,
        conversionRate: 5,
      },
    ],
  };

  return (
    <AdminLayout title="Advanced Analytics">
      <AnalyticsNav />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-1">
          <AnalyticsNav />
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-900">
                Anonymous User Advanced Analytics
              </h2>

              <select
                value={period}
                onChange={handlePeriodChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-sage focus:ring focus:ring-sage focus:ring-opacity-50"
              >
                {timePeriods.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-6 py-4">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("segmentation")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "segmentation"
                        ? "border-sage text-sage"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      User Segmentation
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("funnel")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "funnel"
                        ? "border-sage text-sage"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                      Conversion Funnel
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("heatmap")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "heatmap"
                        ? "border-sage text-sage"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <ArrowsPointingOutIcon className="h-5 w-5 mr-2" />
                      Interaction Heatmap
                    </div>
                  </button>
                </nav>
              </div>

              <div className="mt-6">
                {activeTab === "segmentation" && (
                  <UserSegmentation segments={segmentationData.segments} />
                )}

                {activeTab === "funnel" && (
                  <div className="py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      User Journey Conversion Funnel
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      This funnel shows how anonymous users progress through the
                      site, from initial visit to purchase. Each step shows the
                      number of users, percentage of previous step, and overall
                      conversion rate.
                    </p>
                    <div className="h-96">
                      <FunnelVisualization
                        data={segmentationData.funnelData}
                        width={800}
                        height={400}
                        title="Anonymous User Conversion Funnel"
                      />
                    </div>

                    <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Insights
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                          <span className="text-sage font-bold mr-2">•</span>
                          <span>
                            <strong>Highest Drop-off:</strong>{" "}
                            {
                              segmentationData.funnelData.reduce(
                                (
                                  prev: any,
                                  curr: any,
                                  i: number,
                                  arr: any[],
                                ) => {
                                  if (i === 0) return prev;
                                  const dropoff = 100 - (curr.percentage || 0);
                                  return dropoff > prev.dropoff
                                    ? {
                                        step: curr.name,
                                        prevStep: arr[i - 1].name,
                                        dropoff,
                                      }
                                    : prev;
                                },
                                { step: "", prevStep: "", dropoff: 0 },
                              ).prevStep
                            }{" "}
                            →{" "}
                            {
                              segmentationData.funnelData.reduce(
                                (
                                  prev: any,
                                  curr: any,
                                  i: number,
                                  arr: any[],
                                ) => {
                                  if (i === 0) return prev;
                                  const dropoff = 100 - (curr.percentage || 0);
                                  return dropoff > prev.dropoff
                                    ? {
                                        step: curr.name,
                                        prevStep: arr[i - 1].name,
                                        dropoff,
                                      }
                                    : prev;
                                },
                                { step: "", prevStep: "", dropoff: 0 },
                              ).step
                            }{" "}
                            ({" "}
                            {segmentationData.funnelData
                              .reduce((prev: any, curr: any, i: number) => {
                                if (i === 0) return prev;
                                const dropoff = 100 - (curr.percentage || 0);
                                return dropoff > prev ? dropoff : prev;
                              }, 0)
                              .toFixed(1)}
                            % drop-off)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sage font-bold mr-2">•</span>
                          <span>
                            <strong>Overall Conversion:</strong>{" "}
                            {(
                              (segmentationData.funnelData[
                                segmentationData.funnelData.length - 1
                              ].value /
                                segmentationData.funnelData[0].value) *
                              100
                            ).toFixed(1)}
                            % of visitors complete a purchase
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sage font-bold mr-2">•</span>
                          <span>
                            <strong>Opportunity:</strong> Improving the{" "}
                            {
                              segmentationData.funnelData.reduce(
                                (
                                  prev: any,
                                  curr: any,
                                  i: number,
                                  arr: any[],
                                ) => {
                                  if (i === 0) return prev;
                                  const dropoff = 100 - (curr.percentage || 0);
                                  return dropoff > prev.dropoff
                                    ? {
                                        step: curr.name,
                                        prevStep: arr[i - 1].name,
                                        dropoff,
                                      }
                                    : prev;
                                },
                                { step: "", prevStep: "", dropoff: 0 },
                              ).prevStep
                            }{" "}
                            →{" "}
                            {
                              segmentationData.funnelData.reduce(
                                (
                                  prev: any,
                                  curr: any,
                                  i: number,
                                  arr: any[],
                                ) => {
                                  if (i === 0) return prev;
                                  const dropoff = 100 - (curr.percentage || 0);
                                  return dropoff > prev.dropoff
                                    ? {
                                        step: curr.name,
                                        prevStep: arr[i - 1].name,
                                        dropoff,
                                      }
                                    : prev;
                                },
                                { step: "", prevStep: "", dropoff: 0 },
                              ).step
                            }{" "}
                            conversion by just 10% would result in approximately{" "}
                            {Math.round(
                              segmentationData.funnelData[
                                segmentationData.funnelData.length - 1
                              ].value *
                                (0.1 /
                                  ((segmentationData.funnelData[
                                    segmentationData.funnelData.length - 1
                                  ].conversionRate || 1) /
                                    100)),
                            )}{" "}
                            additional purchases.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "heatmap" && (
                  <div className="py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Page Interaction Heatmap
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      This heatmap shows where users are clicking and
                      interacting with the site. Brighter areas indicate higher
                      interaction density.
                    </p>
                    <div className="h-96">
                      <HeatmapVisualization
                        data={segmentationData.pageHeatmapData}
                        width={800}
                        height={400}
                        title="User Interaction Heatmap"
                        xLabel="Horizontal Position (X)"
                        yLabel="Vertical Position (Y)"
                      />
                    </div>

                    <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Heatmap Insights
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                          <span className="text-sage font-bold mr-2">•</span>
                          <span>
                            <strong>Hotspots:</strong> The most clicked areas
                            are in the top-right quadrant, suggesting users are
                            engaging with navigation and search features.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sage font-bold mr-2">•</span>
                          <span>
                            <strong>Cold Spots:</strong> Lower sections of pages
                            receive less interaction, indicating users may not
                            be scrolling to see all content.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sage font-bold mr-2">•</span>
                          <span>
                            <strong>Recommendation:</strong> Consider moving
                            important conversion elements higher on the page or
                            implementing sticky navigation to improve
                            engagement.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdvancedAnalytics;
