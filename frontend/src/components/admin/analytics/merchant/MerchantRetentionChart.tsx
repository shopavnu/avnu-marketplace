import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  TooltipProps,
} from "recharts";
import { Box, Typography } from "@mui/material";

export interface RetentionDataPoint {
  month: number; // 0 = first month, 1 = second month, etc.
  retentionRate: number; // percentage of merchants still active
  cohortSize?: number; // original size of the cohort
}

export interface ChurnPrediction {
  merchantId: string;
  merchantName: string;
  churnProbability: number;
  riskFactors: string[];
  monthsActive: number;
  lastActivity: string; // ISO date string
}

interface MerchantRetentionChartProps {
  retentionData: RetentionDataPoint[];
  title?: string;
  showAreaFill?: boolean;
  yAxisMin?: number;
}

/**
 * A line chart component that displays merchant retention rates over time
 */
const MerchantRetentionChart: React.FC<MerchantRetentionChartProps> = ({
  retentionData,
  title = "Merchant Retention Rate",
  showAreaFill = true,
  yAxisMin = 0,
}) => {
  if (!retentionData || retentionData.length === 0) {
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
          No retention data available
        </Typography>
      </Box>
    );
  }

  // Sort data by month
  const sortedData = [...retentionData]
    .sort((a, b) => a.month - b.month)
    .map((item) => ({
      ...item,
      // Create a formatted month label
      label: `Month ${item.month + 1}`,
    }));

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as RetentionDataPoint & {
        label: string;
      };
      const rate = dataPoint.retentionRate;

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
            {dataPoint.label}
          </Typography>
          <Typography variant="body2">Retention: {rate.toFixed(1)}%</Typography>
          {dataPoint.cohortSize && (
            <Typography variant="body2">
              {Math.round(dataPoint.cohortSize * (rate / 100))} of{" "}
              {dataPoint.cohortSize} merchants
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Determine which chart type to use based on showAreaFill prop
  const renderChart = () => {
    const chartProps = {
      data: sortedData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    if (showAreaFill) {
      return (
        <AreaChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="label"
            label={{
              value: "Cohort Age",
              position: "insideBottom",
              offset: -10,
            }}
          />
          <YAxis
            domain={[yAxisMin, 100]}
            label={{
              value: "Retention Rate (%)",
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Area
            type="monotone"
            dataKey="retentionRate"
            name="Retention Rate"
            stroke="rgba(101, 163, 13, 1)"
            fill="rgba(101, 163, 13, 0.1)"
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      );
    } else {
      return (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="label"
            label={{
              value: "Cohort Age",
              position: "insideBottom",
              offset: -10,
            }}
          />
          <YAxis
            domain={[yAxisMin, 100]}
            label={{
              value: "Retention Rate (%)",
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="retentionRate"
            name="Retention Rate"
            stroke="rgba(101, 163, 13, 1)"
            strokeWidth={2}
            dot={{
              stroke: "rgba(101, 163, 13, 1)",
              strokeWidth: 1,
              r: 4,
              fill: "white",
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {title && (
        <Typography variant="h6" gutterBottom align="center">
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={320}>
        {renderChart()}
      </ResponsiveContainer>
    </Box>
  );
};

export default MerchantRetentionChart;
