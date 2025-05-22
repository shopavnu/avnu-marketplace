import React from "react";
import { Box, Typography } from "@mui/material";

export interface MockChartProps {
  type?: "line" | "bar" | "pie" | "area" | "scatter";
  title?: string;
  description?: string;
  height?: number | string;
}

const MockChart: React.FC<MockChartProps> = ({
  type = "line",
  title,
  description,
  height = "100%",
}) => {
  // Generate random data points for visual variety
  const generateRandomData = () => {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
  };

  const chartColors = {
    line: "#34D399",
    bar: "#60A5FA",
    pie: "#F59E0B",
    area: "#A78BFA",
    scatter: "#EC4899",
  };

  return (
    <Box
      sx={{
        height: height,
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "1px dashed #CBD5E1",
        borderRadius: 1,
        bgcolor: "#F8FAFC",
        padding: 2,
      }}
    >
      {title && (
        <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}

      <Box
        sx={{
          width: "100%",
          height: "70%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
        }}
      >
        {type === "line" && (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,80 20,70 40,85 60,40 80,65 100,30 120,50 140,20 160,45 180,10 200,30"
              fill="none"
              stroke={chartColors.line}
              strokeWidth="2"
            />
          </svg>
        )}

        {type === "bar" && (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "flex-end",
              justifyContent: "space-around",
            }}
          >
            {generateRandomData().map((value, index) => (
              <Box
                key={index}
                sx={{
                  height: `${value}%`,
                  width: "8%",
                  bgcolor: chartColors.bar,
                  borderRadius: "2px 2px 0 0",
                }}
              />
            ))}
          </Box>
        )}

        {type === "pie" && (
          <Box
            sx={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: `conic-gradient(
                ${chartColors.pie} 0% 25%, 
                ${chartColors.line} 25% 45%, 
                ${chartColors.bar} 45% 65%, 
                ${chartColors.area} 65% 85%, 
                ${chartColors.scatter} 85%
              )`,
            }}
          />
        )}

        {type === "area" && (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 20,70 40,85 60,40 80,65 100,30 120,50 140,20 160,45 180,10 200,30 V100 H0 Z"
              fill={chartColors.area}
              fillOpacity="0.3"
              stroke={chartColors.area}
              strokeWidth="1"
            />
          </svg>
        )}

        {type === "scatter" && (
          <svg width="100%" height="100%" viewBox="0 0 200 100">
            {Array.from({ length: 15 }).map((_, index) => {
              const x = Math.floor(Math.random() * 180) + 10;
              const y = Math.floor(Math.random() * 80) + 10;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={chartColors.scatter}
                />
              );
            })}
          </svg>
        )}
      </Box>

      {description ? (
        <Typography
          variant="body2"
          color="textSecondary"
          component="div"
          sx={{ mt: 2, textAlign: "center" }}
        >
          {description}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          color="textSecondary"
          component="div"
          sx={{ mt: 2, textAlign: "center" }}
        >
          This is a mock {type} chart. Real data visualization will be
          implemented here.
        </Typography>
      )}
    </Box>
  );
};

export default MockChart;
