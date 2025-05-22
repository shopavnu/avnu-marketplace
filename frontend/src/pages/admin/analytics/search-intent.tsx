import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
import { Grid, GridContainer, GridItem } from "../../../components/ui/Grid";
import MetricCard from "../../../components/admin/MetricCard";
// Import Recharts components
import {
  BarChartComponent,
  PieChartComponent,
  LineChartComponent,
  CompositeChartComponent,
} from "../../../components/charts";

// Mock data for Search Intent Dashboard
const mockData = {
  totalSearches: 2457843,
  avgSearchesPerSession: 3.2,
  successfulSearchRate: 84.3,
  reformulationRate: 18.2,
  intentDistribution: {
    productSpecific: 38,
    categoryBrowsing: 42,
    informational: 14,
    navigational: 6,
  },
  intentSuccess: [
    { intent: "Product Specific", success: 86 },
    { intent: "Category Browsing", success: 92 },
    { intent: "Informational", success: 76 },
    { intent: "Navigational", success: 94 },
  ],
  topQueries: [
    {
      query: "organic cotton t-shirt",
      volume: 4287,
      conversionRate: 6.8,
      avgResults: 48,
    },
    {
      query: "wireless headphones",
      volume: 3982,
      conversionRate: 8.2,
      avgResults: 32,
    },
    { query: "yoga mat", volume: 3541, conversionRate: 7.4, avgResults: 28 },
    {
      query: "iphone case",
      volume: 3298,
      conversionRate: 5.3,
      avgResults: 142,
    },
    {
      query: "water bottle",
      volume: 2865,
      conversionRate: 4.9,
      avgResults: 56,
    },
  ],
  zeroResultQueries: [
    {
      query: "biodegradable phone case",
      volume: 283,
      lastSearched: "2025-05-20T14:23:00",
    },
    {
      query: "sustainable fashion brands",
      volume: 267,
      lastSearched: "2025-05-20T10:15:00",
    },
    {
      query: "refurbished tablets",
      volume: 245,
      lastSearched: "2025-05-19T16:42:00",
    },
    {
      query: "eco-friendly cleaning products",
      volume: 212,
      lastSearched: "2025-05-20T09:37:00",
    },
    {
      query: "vegan leather bag",
      volume: 198,
      lastSearched: "2025-05-20T11:05:00",
    },
  ],
};

/**
 * Search Intent Dashboard
 * Analyzes user search patterns and intent types
 */
const SearchIntentDashboard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Format time since last search
  const formatTimeSince = (dateString: string) => {
    const now = new Date();
    const searchTime = new Date(dateString);
    const diffHours = Math.round(
      (now.getTime() - searchTime.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 1) return "Less than an hour ago";
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <AdminLayout title="Search Intent Analysis">
      <AnalyticsNav />

      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Search Intent Analysis
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Understand user search behavior and intent patterns
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2, mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            <GridContainer spacing={3} className="mb-6">
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard
                  title="Total Searches"
                  value={mockData.totalSearches.toLocaleString()}
                  icon="search"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard
                  title="Avg. Searches/Session"
                  value={mockData.avgSearchesPerSession.toString()}
                  icon="repeat"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard
                  title="Successful Search Rate"
                  value={`${mockData.successfulSearchRate}%`}
                  icon="check_circle"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard
                  title="Query Reformulation Rate"
                  value={`${mockData.reformulationRate}%`}
                  icon="edit"
                />
              </GridItem>
            </GridContainer>

            <GridContainer spacing={3}>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Search Intent Distribution
                  </Typography>
                  <Box height={300}>
                    <PieChartComponent
                      data={[
                        {
                          name: "Product Specific",
                          value: mockData.intentDistribution.productSpecific,
                        },
                        {
                          name: "Category Browsing",
                          value: mockData.intentDistribution.categoryBrowsing,
                        },
                        {
                          name: "Informational",
                          value: mockData.intentDistribution.informational,
                        },
                        {
                          name: "Navigational",
                          value: mockData.intentDistribution.navigational,
                        },
                      ]}
                      nameKey="name"
                      valueKey="value"
                      height={280}
                      tooltipFormatter={(value: number) => `${value}%`}
                      colors={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Search Success by Intent Type
                  </Typography>
                  <Box height={300}>
                    <BarChartComponent
                      data={mockData.intentSuccess}
                      xKey="intent"
                      yKey="success"
                      height={280}
                      xAxisLabel="Intent Type"
                      yAxisLabel="Success Rate (%)"
                      tooltipFormatter={(value: number) => `${value}%`}
                      barSize={40}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Top Search Queries
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Query</TableCell>
                          <TableCell align="right">Volume</TableCell>
                          <TableCell align="right">Conversion</TableCell>
                          <TableCell align="right">Avg. Results</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.topQueries.map((row) => (
                          <TableRow key={row.query}>
                            <TableCell component="th" scope="row">
                              {row.query}
                            </TableCell>
                            <TableCell align="right">
                              {row.volume.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {row.conversionRate}%
                            </TableCell>
                            <TableCell align="right">
                              {row.avgResults}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Zero-Result Searches
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Query</TableCell>
                          <TableCell align="right">Volume</TableCell>
                          <TableCell align="right">Last Searched</TableCell>
                          <TableCell align="right">Priority</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.zeroResultQueries.map((row) => (
                          <TableRow key={row.query}>
                            <TableCell component="th" scope="row">
                              {row.query}
                            </TableCell>
                            <TableCell align="right">{row.volume}</TableCell>
                            <TableCell align="right">
                              {formatTimeSince(row.lastSearched)}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={
                                  row.volume > 250
                                    ? "High"
                                    : row.volume > 150
                                      ? "Medium"
                                      : "Low"
                                }
                                color={
                                  row.volume > 250
                                    ? "error"
                                    : row.volume > 150
                                      ? "warning"
                                      : "success"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </GridItem>
            </GridContainer>
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default SearchIntentDashboard;
