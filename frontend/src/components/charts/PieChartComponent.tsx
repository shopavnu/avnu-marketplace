import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import chartTheme, { brandColors, chartColors } from '../../utils/chartTheme';

interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  title?: string;
  subtitle?: string;
  height?: number;
  colors?: string[];
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  donut?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
}

const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  nameKey,
  valueKey,
  title,
  subtitle,
  height = 300,
  colors,
  tooltipFormatter = (value) => `${value}`,
  valueFormatter = (value) => `${value}`,
  donut = false,
  innerRadius = 60,
  outerRadius = 80,
  legendPosition = 'bottom'
}) => {
  const muiTheme = useTheme();
  
  // Use our brand colors as the default color scheme
  const colorPalette = colors || chartColors;

  // Calculate legend position for the ResponsiveContainer
  const getLegendPosition = () => {
    // Common styling for better spacing
    const commonStyle = {
      paddingTop: 15,
      marginTop: 10,
      fontWeight: 'normal' as const
    };
    
    switch (legendPosition) {
      case 'top':
        return { 
          layout: 'horizontal' as const, 
          verticalAlign: 'top' as const, 
          align: 'center' as const,
          height: 36,
          wrapperStyle: { ...commonStyle, top: 0 }
        };
      case 'right':
        return { 
          layout: 'vertical' as const, 
          verticalAlign: 'middle' as const, 
          align: 'right' as const,
          wrapperStyle: { ...commonStyle, right: 0, paddingLeft: 20 }
        };
      case 'bottom':
        return { 
          layout: 'horizontal' as const, 
          verticalAlign: 'bottom' as const, 
          align: 'center' as const,
          height: 36,
          wrapperStyle: { ...commonStyle, bottom: 0 }
        };
      case 'left':
        return { 
          layout: 'vertical' as const, 
          verticalAlign: 'middle' as const, 
          align: 'left' as const,
          wrapperStyle: { ...commonStyle, left: 0, paddingRight: 20 }
        };
      default:
        return { 
          layout: 'horizontal' as const, 
          verticalAlign: 'bottom' as const, 
          align: 'center' as const,
          height: 36,
          wrapperStyle: { ...commonStyle, bottom: 0 }
        };
    }
  };

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
        <PieChart
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={donut ? innerRadius : 0}
            outerRadius={outerRadius}
            fill={brandColors.teal}
            dataKey={valueKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            paddingAngle={3}
            animationDuration={1200}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colorPalette[index % colorPalette.length]} 
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
          />
          <Legend {...getLegendPosition()} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChartComponent;
