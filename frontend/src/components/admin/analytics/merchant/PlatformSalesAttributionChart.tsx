import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { Box, Typography } from "@mui/material";

export interface PlatformSalesData {
  platform: "web" | "ios" | "android";
  sales: number;
  conversion: number;
  transactions: number;
}

export interface MerchantPlatformData {
  merchantId: string;
  merchantName: string;
  platforms: PlatformSalesData[];
  totalSales: number;
}

interface PlatformSalesAttributionChartProps {
  data: MerchantPlatformData[];
  metricToShow?: "sales" | "conversion" | "transactions";
  title?: string;
  showLegend?: boolean;
  displayType?: "stacked" | "grouped";
}

// Platform colors (consistent across charts)
const PLATFORM_COLORS = {
  web: "rgba(59, 130, 246, 0.8)", // Blue
  ios: "rgba(249, 115, 22, 0.8)", // Orange
  android: "rgba(16, 185, 129, 0.8)", // Teal
};

/**
 * A bar chart component that displays sales attribution by platform (web, iOS, Android)
 */
const PlatformSalesAttributionChart: React.FC<
  PlatformSalesAttributionChartProps
> = ({
  data,
  metricToShow = "sales",
  title,
  showLegend = true,
  displayType = "grouped",
}) => {
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 320,
          bgcolor: "grey.100",
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary">
          No platform data available
        </Typography>
      </Box>
    );
  }

  // Calculate default title based on metric if not provided
  const defaultTitle =
    metricToShow === "sales"
      ? "Sales by Platform"
      : metricToShow === "conversion"
        ? "Conversion Rates by Platform"
        : "Transactions by Platform";

  const chartTitle = title || defaultTitle;

  // Helper function to format metric values
  const formatMetricValue = (value: number, metric: string) => {
    if (metric === "sales") {
      return "$" + value.toLocaleString("en-US");
    } else if (metric === "conversion") {
      return value.toFixed(2) + "%";
    } else {
      return value.toLocaleString("en-US");
    }
  };

  // Prepare data for Recharts format
  const chartData = data.map((merchant) => {
    // Base structure with merchant name
    const merchantData: any = {
      name: merchant.merchantName,
    };

    // Add data for each platform
    merchant.platforms.forEach((platform) => {
      merchantData[platform.platform] = platform[metricToShow];
    });

    return merchantData;
  });

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 1,
            border: "1px solid #ccc",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => {
            const platform = entry.dataKey as string;
            const platformLabel =
              platform.charAt(0).toUpperCase() + platform.slice(1);
            return (
              <Typography
                key={`tooltip-${index}`}
                variant="body2"
                sx={{ color: entry.color as string }}
              >
                {`${platformLabel}: ${formatMetricValue(entry.value as number, metricToShow)}`}
              </Typography>
            );
          })}
        </Box>
      );
    }
    return null;
  };

  // Get Y-axis label based on metric
  const yAxisLabel =
    metricToShow === "sales"
      ? "Sales ($)"
      : metricToShow === "conversion"
        ? "Conversion Rate (%)"
        : "Number of Transactions";

  return (
    <Box sx={{ width: "100%" }}>
      {chartTitle && (
        <Typography variant="h6" gutterBottom align="center">
          {chartTitle}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barSize={20}
          // For stacked vs grouped layout
          barGap={0}
          barCategoryGap={displayType === "stacked" ? "10%" : "30%"}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="name"
            label={{ value: "Merchant", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
            tickFormatter={(value) => formatMetricValue(value, metricToShow)}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend verticalAlign="top" height={36} />}

          {/* Create bars for each platform */}
          <Bar
            dataKey="web"
            name="Web"
            stackId={displayType === "stacked" ? "stack1" : undefined}
            fill={PLATFORM_COLORS.web}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="ios"
            name="iOS"
            stackId={displayType === "stacked" ? "stack1" : undefined}
            fill={PLATFORM_COLORS.ios}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="android"
            name="Android"
            stackId={displayType === "stacked" ? "stack1" : undefined}
            fill={PLATFORM_COLORS.android}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PlatformSalesAttributionChart;
