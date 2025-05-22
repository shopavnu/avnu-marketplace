import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Box, Typography } from "@mui/material";

export interface MerchantGrowthDataPoint {
  date: string;
  revenue: number;
  previousRevenue: number;
  growthPercentage: number;
  merchantId?: string;
  merchantName?: string;
}

interface MerchantGrowthChartProps {
  growthData: MerchantGrowthDataPoint[];
  title?: string;
  chartType?: "line" | "bar" | "combo";
  showPercentages?: boolean;
  merchantName?: string;
}

const MerchantGrowthChart: React.FC<MerchantGrowthChartProps> = ({
  growthData,
  title = "Merchant Revenue Growth",
  chartType = "combo",
  showPercentages = true,
  merchantName,
}) => {
  if (!growthData || growthData.length === 0) {
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
        <Typography color="text.secondary">No growth data available</Typography>
      </Box>
    );
  }

  // Sort data by date
  const sortedData = [...growthData]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      ...item,
      formattedDate: format(parseISO(item.date), "MMM yyyy"),
    }));

  const displayTitle = merchantName ? `${title}: ${merchantName}` : title;

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
          <Typography variant="body2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={`tooltip-${index}`}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name === "revenue"
                ? `Revenue: $${entry.value?.toLocaleString("en-US")}`
                : `Growth: ${Number(entry.value).toFixed(1)}%`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Determine what components to render based on chartType
  const renderChart = () => {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="formattedDate"
            label={{ value: "Month", position: "insideBottom", offset: -15 }}
          />

          {/* Primary Y-axis for Revenue */}
          <YAxis
            yAxisId="left"
            label={{ value: "Revenue ($)", angle: -90, position: "insideLeft" }}
            tickFormatter={(value) => `$${value.toLocaleString("en-US")}`}
          />

          {/* Secondary Y-axis for Growth % */}
          {showPercentages && (
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Growth %", angle: 90, position: "insideRight" }}
              tickFormatter={(value) => `${value}%`}
            />
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />

          {/* Render Bar for Revenue if needed */}
          {(chartType === "bar" || chartType === "combo") && (
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="revenue"
              fill="rgba(101, 163, 13, 0.8)"
              stroke="rgba(101, 163, 13, 1)"
              barSize={20}
            />
          )}

          {/* Render Line for Growth % if needed */}
          {(chartType === "line" || chartType === "combo") && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growthPercentage"
              name="growth"
              stroke="rgba(255, 99, 132, 1)"
              fill="rgba(255, 99, 132, 0.2)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {displayTitle && (
        <Typography variant="h6" gutterBottom align="center">
          {displayTitle}
        </Typography>
      )}
      {renderChart()}
    </Box>
  );
};

export default MerchantGrowthChart;
