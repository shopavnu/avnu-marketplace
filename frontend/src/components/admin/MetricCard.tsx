import React, { ReactNode } from 'react';
import { Paper, Typography, Box, Tooltip, Icon } from '@mui/material';
import { brandColors } from '../../utils/chartTheme';
import { 
  Groups as GroupsIcon,
  Repeat as RepeatIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Devices as DevicesIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  trend?: number;
  trendLabel?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${brandColors.sand}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: brandColors.charcoal,
              fontWeight: 500,
              mb: 1,
              fontSize: '0.875rem',
              letterSpacing: '0.02em'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              color: brandColors.teal,
              fontSize: '1.75rem',
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: brandColors.olive,
                fontSize: '0.875rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </div>
        {icon && (
          <Box 
            sx={{ 
              p: 2,
              borderRadius: '50%',
              bgcolor: `${brandColors.cream}`,
              color: brandColors.terracotta,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {(() => {
              // Render the appropriate icon based on the icon string
              switch(icon) {
                case 'group':
                  return <GroupsIcon />;
                case 'repeat':
                  return <RepeatIcon />;
                case 'attach_money':
                  return <AttachMoneyIcon />;
                case 'shopping_cart':
                  return <ShoppingCartIcon />;
                case 'devices':
                  return <DevicesIcon />;
                case 'timeline':
                  return <TimelineIcon />;
                case 'trending_up':
                  return <TrendingUpIcon />;
                default:
                  return <Icon>{icon}</Icon>; // Fallback to text-based icon
              }
            })()} 
          </Box>
        )}
      </div>
      
      {trend !== undefined && (
        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          <Box 
            component="span" 
            sx={{ 
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              mr: 2,
              bgcolor: trend >= 0 ? 'rgba(194, 212, 207, 0.3)' : 'rgba(199, 129, 100, 0.2)',
              color: trend >= 0 ? brandColors.teal : brandColors.terracotta,
              fontWeight: 600
            }}
          >
            <Icon sx={{ fontSize: '0.875rem', mr: 0.5 }}>
              {trend >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </Icon>
            {Math.abs(trend).toFixed(1)}%
          </Box>
          {trendLabel && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: brandColors.olive,
                fontSize: '0.75rem'
              }}
            >
              {trendLabel}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default MetricCard;
