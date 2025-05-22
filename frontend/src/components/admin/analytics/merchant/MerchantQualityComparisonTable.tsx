import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  LinearProgress,
  Tooltip,
} from "@mui/material";

export interface QualityScore {
  metricName: string;
  score: number;
}

export interface MerchantQualityTableData {
  id: string;
  name: string;
  overallScore: number;
  dataCompleteness: number;
  imageQuality: number;
  descriptionQuality: number;
  seoEffectiveness: number;
  additionalMetrics?: QualityScore[];
}

interface MerchantQualityComparisonTableProps {
  data: MerchantQualityTableData[];
  title?: string;
  sortBy?: keyof MerchantQualityTableData;
  sortDirection?: "asc" | "desc";
}

/**
 * A component that displays a comparison table of merchant quality metrics
 */
const MerchantQualityComparisonTable: React.FC<
  MerchantQualityComparisonTableProps
> = ({
  data,
  title = "Merchant Quality Comparison",
  sortBy = "overallScore",
  sortDirection = "desc",
}) => {
  if (!data || data.length === 0) {
    return (
      <Paper className="p-4">
        <Typography variant="body2" color="textSecondary" align="center">
          No quality comparison data available
        </Typography>
      </Paper>
    );
  }

  // Sort data based on the specified column and direction
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy] as number;
    const bValue = b[sortBy] as number;
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Helper function to get quality status and color
  const getQualityStatus = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "success" };
    if (score >= 80) return { label: "Good", color: "primary" };
    if (score >= 70) return { label: "Average", color: "warning" };
    return { label: "Needs Improvement", color: "error" };
  };

  return (
    <Paper className="p-4" elevation={1}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={0}>
        <Table aria-label="merchant quality comparison table">
          <TableHead>
            <TableRow>
              <TableCell>Merchant</TableCell>
              <TableCell align="center">Overall Score</TableCell>
              <TableCell align="center">Data Completeness</TableCell>
              <TableCell align="center">Image Quality</TableCell>
              <TableCell align="center">Description Quality</TableCell>
              <TableCell align="center">SEO Effectiveness</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((merchant) => {
              const qualityStatus = getQualityStatus(merchant.overallScore);

              return (
                <TableRow key={merchant.id}>
                  <TableCell component="th" scope="row">
                    {merchant.name}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ mr: 1, fontWeight: "bold" }}
                      >
                        {merchant.overallScore.toFixed(1)}%
                      </Typography>
                      <Box sx={{ width: "50%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={merchant.overallScore}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "grey.200",
                            "& .MuiLinearProgress-bar": {
                              bgcolor:
                                merchant.overallScore >= 90
                                  ? "success.main"
                                  : merchant.overallScore >= 80
                                    ? "primary.main"
                                    : merchant.overallScore >= 70
                                      ? "warning.main"
                                      : "error.main",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip
                      title="Product listings with complete required fields"
                      arrow
                    >
                      <Typography variant="body2">
                        {merchant.dataCompleteness.toFixed(1)}%
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip
                      title="Quality score for product images (resolution, clarity, background)"
                      arrow
                    >
                      <Typography variant="body2">
                        {merchant.imageQuality.toFixed(1)}%
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip
                      title="Quality score for product descriptions (length, details, formatting)"
                      arrow
                    >
                      <Typography variant="body2">
                        {merchant.descriptionQuality.toFixed(1)}%
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip
                      title="Effectiveness of SEO elements (keywords, metadata, structure)"
                      arrow
                    >
                      <Typography variant="body2">
                        {merchant.seoEffectiveness.toFixed(1)}%
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={qualityStatus.label}
                      color={qualityStatus.color as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MerchantQualityComparisonTable;
