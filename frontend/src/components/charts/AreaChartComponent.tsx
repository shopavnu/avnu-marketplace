import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import chartTheme, {
  brandColors,
  chartColors,
  gradients,
} from "../../utils/chartTheme";
import { generateLegendLabel } from "../../utils/chartFormatters";

interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  subtitle?: string;
  height?: number;
  secondaryYKey?: string;
  stackedAreas?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

const AreaChartComponent: React.FC<AreaChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  subtitle,
  height = 300,
  secondaryYKey,
  stackedAreas = false,
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter = (value) => `${value}`,
  valueFormatter = (value) => `${value}`,
  showGrid = true,
  gradientFrom,
  gradientTo,
}) => {
  const muiTheme = useTheme();
  const primaryColor = brandColors.teal;
  const secondaryColor = brandColors.terracotta;

  const primaryGradientFrom = gradientFrom || gradients.teal.from;
  const primaryGradientTo = gradientTo || gradients.teal.to;
  const secondaryGradientFrom = gradients.terracotta.from;
  const secondaryGradientTo = gradients.terracotta.to;

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
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20, // Reduced margin to prevent squishing the chart content
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={primaryGradientFrom}
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor={primaryGradientTo}
                stopOpacity={0.3}
              />
            </linearGradient>
            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={secondaryGradientFrom}
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor={secondaryGradientTo}
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>
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
              strokeOpacity: 0.5,
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
          <Area
            type="monotone"
            dataKey={yKey}
            name={generateLegendLabel(yKey, title)} // Use our formatter utility for better legend display
            stroke={primaryColor}
            strokeWidth={2}
            fillOpacity={0.9}
            fill="url(#colorPrimary)"
            stackId={stackedAreas ? "stack" : undefined}
            activeDot={{
              r: 6,
              fill: primaryColor,
              stroke: "#FFFFFF",
              strokeWidth: 2,
            }}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
          {secondaryYKey && (
            <Area
              type="monotone"
              dataKey={secondaryYKey}
              name={generateLegendLabel(secondaryYKey)} // Use our formatter utility for better legend display
              stroke={secondaryColor}
              strokeWidth={2}
              fillOpacity={0.8}
              fill="url(#colorSecondary)"
              stackId={stackedAreas ? "stack" : undefined}
              activeDot={{
                r: 6,
                fill: secondaryColor,
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              animationDuration={1200}
              animationEasing="ease-in-out"
              animationBegin={300} // Slight delay for second area animation
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AreaChartComponent;
