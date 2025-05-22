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
  ReferenceLine,
  TooltipProps,
} from "recharts";
import { Box, Typography } from "@mui/material";

export interface MerchantCategoryData {
  category: string;
  conversionRate: number;
  avgRevenue?: number;
  merchantCount?: number;
  color?: string;
}

interface MerchantCategoryConversionChartProps {
  data: MerchantCategoryData[];
  title?: string;
  showAvgLine?: boolean;
}

const DEFAULT_COLORS = [
  "rgba(101, 163, 13, 0.8)", // Sage green
  "rgba(59, 130, 246, 0.8)", // Blue
  "rgba(249, 115, 22, 0.8)", // Orange
  "rgba(139, 92, 246, 0.8)", // Purple
  "rgba(234, 88, 12, 0.8)", // Dark orange
  "rgba(16, 185, 129, 0.8)", // Teal
  "rgba(236, 72, 153, 0.8)", // Pink
  "rgba(251, 191, 36, 0.8)", // Yellow
];

/**
 * A bar chart component that displays conversion rates by merchant category
 */
const MerchantCategoryConversionChart: React.FC<
  MerchantCategoryConversionChartProps
> = ({
  data,
  title = "Conversion Rates by Merchant Category",
  showAvgLine = true,
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
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  // Calculate average conversion rate
  const average =
    data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length;

  // Prepare data with colors for Recharts
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

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
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {label}
          </Typography>
          <Typography variant="body2">
            Conversion Rate: {payload[0].value?.toFixed(2)}%
          </Typography>
          {payload[0].payload.merchantCount && (
            <Typography variant="body2">
              Merchant Count: {payload[0].payload.merchantCount}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {title && (
        <Typography variant="h6" gutterBottom align="center">
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="category"
            label={{ value: "Category", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            label={{
              value: "Conversion Rate (%)",
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Bar
            dataKey="conversionRate"
            name="Conversion Rate"
            radius={[4, 4, 0, 0]}
            fill="#8884d8"
          />
          {showAvgLine && average > 0 && (
            <ReferenceLine
              y={average}
              stroke="rgba(255, 99, 132, 0.7)"
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${average.toFixed(2)}%`,
                position: "right",
                fill: "rgba(255, 99, 132, 0.7)",
                fontSize: 12,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MerchantCategoryConversionChart;
