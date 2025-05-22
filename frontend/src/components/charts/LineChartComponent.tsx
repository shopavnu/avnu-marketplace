import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import chartTheme, {
  brandColors,
  chartColors,
  gradients,
} from "../../utils/chartTheme";
import { generateLegendLabel } from "../../utils/chartFormatters";

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  subtitle?: string;
  height?: number;
  secondaryYKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
}

const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  subtitle,
  height = 300,
  secondaryYKey,
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter = (value) => `${value}`,
  valueFormatter = (value) => `${value}`,
  showGrid = true,
}) => {
  const muiTheme = useTheme();
  const primaryColor = brandColors.teal;
  const secondaryColor = brandColors.terracotta;

  return (
    <Box sx={{ width: "100%", height: height }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {subtitle}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20, // Reduced margin to prevent squishing the chart content
            bottom: 20,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={brandColors.sand}
              strokeOpacity={0.4}
            />
          )}
          <XAxis
            dataKey={xKey}
            label={
              xAxisLabel
                ? {
                    value: xAxisLabel,
                    position: "bottom",
                    offset: 10,
                    style: { fill: brandColors.charcoal, fontSize: 12 },
                  }
                : undefined
            }
            tick={{ fill: brandColors.charcoal, fontSize: 12 }}
            axisLine={{ stroke: brandColors.sand }}
            tickLine={{ stroke: brandColors.sand }}
          />
          <YAxis
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: "left",
                    dx: -10, // Smaller offset to prevent layout issues
                    style: { fill: brandColors.charcoal, fontSize: 12 },
                  }
                : undefined
            }
            tick={{ fill: brandColors.charcoal, fontSize: 12 }}
            axisLine={{ stroke: brandColors.sand }}
            tickLine={{ stroke: brandColors.sand }}
            width={50} // Fixed width for the Y-axis
          />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${brandColors.sand}`,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 500,
            }}
            cursor={{
              stroke: brandColors.charcoal,
              strokeWidth: 1,
              strokeDasharray: "5 5",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={40}
            wrapperStyle={{
              paddingTop: 15,
              marginTop: 15,
              bottom: 0,
              fontSize: 13,
              fontWeight: 500,
              color: brandColors.charcoal,
            }}
            iconType="rect"
            iconSize={12}
            formatter={(value) => {
              // Make legend values more descriptive
              return (
                <span style={{ color: brandColors.charcoal, padding: "0 8px" }}>
                  {value}
                </span>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            name={generateLegendLabel(yKey, title)} // Use our formatter utility for better legend display
            stroke={primaryColor}
            strokeWidth={2.5}
            dot={{
              fill: "#FFFFFF",
              stroke: primaryColor,
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 7,
              fill: primaryColor,
              stroke: "#FFFFFF",
              strokeWidth: 2,
            }}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
          {secondaryYKey && (
            <Line
              type="monotone"
              dataKey={secondaryYKey}
              name={generateLegendLabel(secondaryYKey)} // Use our formatter utility for better legend display
              stroke={secondaryColor}
              strokeWidth={2.5}
              dot={{
                fill: "#FFFFFF",
                stroke: secondaryColor,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 7,
                fill: secondaryColor,
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              animationDuration={1200}
              animationEasing="ease-in-out"
              animationBegin={300} // Slight delay for second line animation
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartComponent;
