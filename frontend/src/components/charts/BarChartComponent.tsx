import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import chartTheme, { brandColors, chartColors } from '../../utils/chartTheme';
import { generateLegendLabel, formatKeyToLabel } from '../../utils/chartFormatters';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  subtitle?: string;
  height?: number;
  secondaryYKey?: string;
  stackedBars?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
  horizontal?: boolean;
  barSize?: number;
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  subtitle,
  height = 300,
  secondaryYKey,
  stackedBars = false,
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter = (value) => `${value}`,
  valueFormatter = (value) => `${value}`,
  showGrid = true,
  horizontal = false,
  barSize
}) => {
  const muiTheme = useTheme();
  const primaryColor = brandColors.teal;
  const secondaryColor = brandColors.terracotta;

  return (
    <Box sx={{ width: '100%', height: height }}>
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
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{
            top: 20,
            right: 20,
            left: 20, // Reduced margin to prevent squishing the chart content
            bottom: 20,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={brandColors.sand} strokeOpacity={0.4} />}
          <XAxis 
            dataKey={horizontal ? undefined : xKey}
            type={horizontal ? 'number' : 'category'}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 10, style: { fill: brandColors.charcoal, fontSize: 12 } } : undefined}
            tick={{ fill: brandColors.charcoal, fontSize: 12 }}
            axisLine={{ stroke: brandColors.sand }}
            tickLine={{ stroke: brandColors.sand }}
          />
          <YAxis 
            dataKey={horizontal ? xKey : undefined}
            type={horizontal ? 'category' : 'number'}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'left', 
              dx: -10, // Smaller offset to prevent layout issues
              style: { fill: brandColors.charcoal, fontSize: 12 } 
            } : undefined}
            tick={{ fill: brandColors.charcoal, fontSize: 12 }}
            axisLine={{ stroke: brandColors.sand }}
            tickLine={{ stroke: brandColors.sand }}
            width={50} // Fixed width for the Y-axis
          />
          <Tooltip 
            formatter={tooltipFormatter}
            contentStyle={{ 
              backgroundColor: '#FFFFFF',
              border: `1px solid ${brandColors.sand}`,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 500
            }}
            cursor={{ fill: brandColors.cream, fillOpacity: 0.3 }}
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
              color: brandColors.charcoal
            }}
            iconType="rect"
            iconSize={12}
            formatter={(value) => {
              // Make legend values more descriptive
              return <span style={{color: brandColors.charcoal, padding: '0 8px'}}>{value}</span>;
            }}
          />
          {!secondaryYKey ? (
            // For single-series bar charts, use color cells for each bar
            <Bar 
              dataKey={yKey} 
              name={yKey}
              stackId={stackedBars ? 'stack' : undefined}
              barSize={barSize || 30}
              animationDuration={800}
              animationEasing="ease-out"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          ) : (
            // For multi-series charts, use consistent colors for the series
            <>
              <Bar 
                dataKey={yKey} 
                fill={primaryColor} 
                name={generateLegendLabel(yKey, title)} // Use our formatter utility for better legend display
                stackId={stackedBars ? 'stack' : undefined}
                barSize={barSize || 30}
                animationDuration={800}
                animationEasing="ease-out"
                radius={stackedBars ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
              <Bar 
                dataKey={secondaryYKey} 
                fill={secondaryColor} 
                name={generateLegendLabel(secondaryYKey)} // Use our formatter utility for better legend display
                stackId={stackedBars ? 'stack' : undefined}
                barSize={barSize || 30}
                animationDuration={800}
                animationEasing="ease-out"
                radius={stackedBars ? [4, 4, 0, 0] : [4, 4, 0, 0]}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChartComponent;
