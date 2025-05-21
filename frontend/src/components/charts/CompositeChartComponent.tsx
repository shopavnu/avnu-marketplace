import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface MetricConfig {
  key: string;
  type: 'bar' | 'line' | 'area';
  name?: string;
  color?: string;
  yAxisId?: 'left' | 'right';
  stackId?: string;
}

interface CompositeChartProps {
  data: any[];
  xKey: string;
  metrics: MetricConfig[];
  title?: string;
  subtitle?: string;
  height?: number;
  xAxisLabel?: string;
  leftYAxisLabel?: string;
  rightYAxisLabel?: string;
  yAxisLabel?: string; // Added for backward compatibility
  useRightYAxis?: boolean;
  tooltipFormatter?: (value: number, name: string) => string;
  showGrid?: boolean;
}

const CompositeChartComponent: React.FC<CompositeChartProps> = ({
  data,
  xKey,
  metrics,
  title,
  subtitle,
  height = 400,
  xAxisLabel,
  leftYAxisLabel,
  rightYAxisLabel,
  useRightYAxis = false,
  tooltipFormatter = (value) => `${value}`,
  showGrid = true
}) => {
  const theme = useTheme();
  
  // Default colors if not specified
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main
  ];

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
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />}
          <XAxis 
            dataKey={xKey}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 0 } : undefined}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            label={leftYAxisLabel ? { value: leftYAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          {useRightYAxis && (
            <YAxis 
              yAxisId="right" 
              orientation="right"
              label={rightYAxisLabel ? { value: rightYAxisLabel, angle: 90, position: 'insideRight' } : undefined}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
          )}
          <Tooltip 
            formatter={tooltipFormatter}
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              boxShadow: theme.shadows[2]
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: 15,
              marginTop: 10,
              bottom: 0
            }}
          />
          
          {metrics.map((metric, index) => {
            const color = metric.color || defaultColors[index % defaultColors.length];
            const name = metric.name || metric.key;
            const yAxisId = metric.yAxisId || 'left';
            
            switch (metric.type) {
              case 'bar':
                return (
                  <Bar 
                    key={metric.key}
                    dataKey={metric.key} 
                    name={name}
                    fill={color}
                    yAxisId={yAxisId}
                    stackId={metric.stackId}
                  />
                );
              case 'line':
                return (
                  <Line 
                    key={metric.key}
                    type="monotone" 
                    dataKey={metric.key} 
                    name={name}
                    stroke={color}
                    yAxisId={yAxisId}
                    strokeWidth={2}
                    dot={{ fill: color, strokeWidth: 2 }}
                  />
                );
              case 'area':
                return (
                  <Area 
                    key={metric.key}
                    type="monotone" 
                    dataKey={metric.key} 
                    name={name}
                    fill={color}
                    stroke={color}
                    yAxisId={yAxisId}
                    fillOpacity={0.3}
                    stackId={metric.stackId}
                  />
                );
              default:
                return null;
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CompositeChartComponent;
