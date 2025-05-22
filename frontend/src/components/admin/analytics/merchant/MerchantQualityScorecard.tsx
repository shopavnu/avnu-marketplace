import React from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { GridContainer, GridItem } from "../../../ui/Grid";

export interface QualityMetric {
  name: string;
  score: number;
  maxScore: number;
  tooltip?: string;
}

export interface MerchantQualityData {
  merchantId: string;
  merchantName: string;
  overallScore: number;
  metrics: QualityMetric[];
}

interface MerchantQualityScorecardProps {
  data: MerchantQualityData;
  showOverallScore?: boolean;
}

/**
 * A scorecard component that displays merchant quality metrics with progress bars
 */
const MerchantQualityScorecard: React.FC<MerchantQualityScorecardProps> = ({
  data,
  showOverallScore = true,
}) => {
  if (!data || !data.metrics) {
    return (
      <Paper className="p-4">
        <Typography variant="body2" color="textSecondary" align="center">
          No quality data available
        </Typography>
      </Paper>
    );
  }

  // Helper function to determine color based on score percentage
  const getColorForScore = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "success.main";
    if (percentage >= 75) return "info.main";
    if (percentage >= 60) return "warning.main";
    return "error.main";
  };

  // Calculate overall score percentage
  const overallPercentage = data.overallScore;
  const overallColor = getColorForScore(data.overallScore, 100);

  return (
    <Paper className="p-4" elevation={1}>
      {showOverallScore && (
        <Box className="mb-4">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="h6">Overall Quality Score</Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: overallColor,
              }}
            >
              {overallPercentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallPercentage}
            sx={{
              height: 12,
              borderRadius: 2,
              "& .MuiLinearProgress-bar": {
                backgroundColor: overallColor,
              },
            }}
          />
        </Box>
      )}

      <Typography variant="subtitle1" gutterBottom>
        Quality Metrics Breakdown
      </Typography>

      <GridContainer spacing={2}>
        {data.metrics.map((metric, index) => {
          const percentage = (metric.score / metric.maxScore) * 100;
          const color = getColorForScore(metric.score, metric.maxScore);

          return (
            <GridItem xs={12} key={index}>
              <Tooltip title={metric.tooltip || ""} arrow placement="top">
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.5}
                  >
                    <Typography variant="body2">{metric.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color,
                      }}
                    >
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: color,
                      },
                    }}
                  />
                </Box>
              </Tooltip>
            </GridItem>
          );
        })}
      </GridContainer>
    </Paper>
  );
};

export default MerchantQualityScorecard;
