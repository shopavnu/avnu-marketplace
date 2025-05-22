import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { brandColors } from "../../utils/chartTheme";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string; // Kept for compatibility with existing code, but not used
  trend?: number;
  trendLabel?: string;
}

/**
 * MetricCard component for displaying key metrics on admin dashboards
 * Simplified version without icons to avoid deployment issues
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon, // Added back but unused
  trend,
  trendLabel,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        border: `1px solid ${brandColors.sand}`,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
        },
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
              fontSize: "0.875rem",
              letterSpacing: "0.02em",
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
              fontSize: "1.75rem",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: brandColors.olive,
                fontSize: "0.875rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </div>
      </div>

      {trend !== undefined && (
        <Box sx={{ mt: 4, display: "flex", alignItems: "center" }}>
          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              mr: 2,
              bgcolor:
                trend >= 0
                  ? "rgba(194, 212, 207, 0.3)"
                  : "rgba(199, 129, 100, 0.2)",
              color: trend >= 0 ? brandColors.teal : brandColors.terracotta,
              fontWeight: 600,
            }}
          >
            {/* Trend indicator without icon */}
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
          </Box>
          {trendLabel && (
            <Typography
              variant="body2"
              sx={{
                color: brandColors.olive,
                fontSize: "0.75rem",
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
