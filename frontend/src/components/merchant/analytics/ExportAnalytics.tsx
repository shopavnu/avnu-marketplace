import React, { useState } from "react";
import { format } from "date-fns";
import { DownloadIcon } from "@heroicons/react/24/outline";
import { FilterOptions } from "./AdvancedFilters";

interface ExportAnalyticsProps {
  filters: FilterOptions;
  analyticsData: any;
}

const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({
  filters,
  analyticsData,
}) => {
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Format options
  const formatOptions = [
    { value: "csv", label: "CSV" },
    { value: "json", label: "JSON" },
    { value: "pdf", label: "PDF" },
  ];

  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportFormat(e.target.value);
  };

  // Generate file name based on filters and current date
  const generateFileName = (): string => {
    const today = format(new Date(), "yyyy-MM-dd");
    const timeFrame = filters.timeFrame || "custom";
    return `analytics-${timeFrame}-${today}.${exportFormat}`;
  };

  // Convert analytics data to CSV
  const convertToCSV = (data: any): string => {
    if (!data) return "";

    // Summary data
    const summaryRows = [
      ["Summary Metrics", "Value"],
      ["Total Revenue", data.summary.totalRevenue],
      ["Total Orders", data.summary.totalOrders],
      ["Total Views", data.summary.totalViews],
      ["Total Clicks", data.summary.totalClicks],
      ["Average Order Value", data.summary.averageOrderValue],
      ["Overall Conversion Rate", data.summary.overallConversionRate],
      ["Overall Click-Through Rate", data.summary.overallClickThroughRate],
      [""], // Empty row for separation
    ];

    // Top products data
    const productHeaders = [
      "Product ID",
      "Product Name",
      "Revenue",
      "Orders",
      "Views",
      "Clicks",
      "Conversion Rate",
      "Click-Through Rate",
    ];
    const productRows = data.topProducts.map((product: any) => [
      product.productId,
      product.productName,
      product.revenue,
      product.orders,
      product.views,
      product.clicks,
      product.conversionRate,
      product.clickThroughRate,
    ]);

    // Performance over time data
    const timeSeriesHeaders = ["Date", "Revenue"];
    const timeSeriesRows = data.performanceOverTime.map((point: any) => [
      point.date,
      point.value,
    ]);

    // Conversion funnel data
    const funnelHeaders = ["Stage", "Count"];
    const funnelRows = data.conversionFunnel.stages.map((stage: any) => [
      stage.name,
      stage.count,
    ]);

    // Combine all data
    const allRows = [
      ["Merchant Analytics Report"],
      [`Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`],
      [`Time Frame: ${filters.timeFrame}`],
      [
        `Date Range: ${filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : "N/A"} to ${filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : "N/A"}`,
      ],
      [""],
      ...summaryRows,
      ["Top Products"],
      productHeaders,
      ...productRows,
      [""],
      ["Performance Over Time"],
      timeSeriesHeaders,
      ...timeSeriesRows,
      [""],
      ["Conversion Funnel"],
      funnelHeaders,
      ...funnelRows,
    ];

    // Convert to CSV format
    return allRows.map((row) => row.join(",")).join("\n");
  };

  // Convert analytics data to JSON
  const convertToJSON = (data: any): string => {
    if (!data) return "";

    const exportData = {
      reportInfo: {
        generatedOn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        timeFrame: filters.timeFrame,
        dateRange: {
          startDate: filters.startDate
            ? format(filters.startDate, "yyyy-MM-dd")
            : null,
          endDate: filters.endDate
            ? format(filters.endDate, "yyyy-MM-dd")
            : null,
        },
        filters: {
          productIds: filters.productIds,
          categoryIds: filters.categoryIds,
        },
      },
      data: data,
    };

    return JSON.stringify(exportData, null, 2);
  };

  // Handle export
  const handleExport = async () => {
    if (!analyticsData) return;

    setIsExporting(true);

    try {
      let content = "";
      let mimeType = "";

      if (exportFormat === "csv") {
        content = convertToCSV(analyticsData);
        mimeType = "text/csv";
      } else if (exportFormat === "json") {
        content = convertToJSON(analyticsData);
        mimeType = "application/json";
      } else if (exportFormat === "pdf") {
        // For PDF, we would typically use a library like jsPDF
        // This is a placeholder for future implementation
        alert("PDF export will be implemented in a future update");
        setIsExporting(false);
        return;
      }

      // Create a blob and download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = generateFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("An error occurred while exporting data. Please try again.");
    }

    setIsExporting(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-700 mb-4">
        Export Analytics
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-auto">
          <label
            htmlFor="exportFormat"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Format
          </label>
          <select
            id="exportFormat"
            value={exportFormat}
            onChange={handleFormatChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage"
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:self-end">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !analyticsData}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isExporting || !analyticsData
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sage hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
            }`}
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <span className="flex items-center">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Data
              </span>
            )}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Export your analytics data in various formats for further analysis or
        reporting.
      </p>
    </div>
  );
};

export default ExportAnalytics;
