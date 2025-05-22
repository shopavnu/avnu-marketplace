import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNavigation from "../../../components/admin/AnalyticsNavigation";
import { format } from "date-fns";
import GridContainer from "../../../components/analytics/GridContainer";
import GridItem from "../../../components/analytics/GridItem";
import { PerformanceMetricsData } from "../../../components/analytics/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tab-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `performance-tab-${index}`,
    "aria-controls": `performance-tabpanel-${index}`,
  };
}

const PerformanceMetrics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [performanceData, setPerformanceData] =
    useState<PerformanceMetricsData | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Load mock data
  useEffect(() => {
    setLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Mock performance metrics data
        const mockData: PerformanceMetricsData = {
          pageLoadTime: {
            average: 2.3,
            byPage: [
              { pagePath: "/", loadTime: 1.8 },
              { pagePath: "/shop", loadTime: 2.1 },
              { pagePath: "/product/123", loadTime: 2.5 },
              { pagePath: "/cart", loadTime: 1.9 },
              { pagePath: "/checkout", loadTime: 3.2 },
            ],
          },
          firstContentfulPaint: {
            average: 1.2,
            byPage: [
              { pagePath: "/", fcp: 0.9 },
              { pagePath: "/shop", fcp: 1.1 },
              { pagePath: "/product/123", fcp: 1.3 },
              { pagePath: "/cart", fcp: 1.0 },
              { pagePath: "/checkout", fcp: 1.7 },
            ],
          },
          largestContentfulPaint: {
            average: 2.8,
            byPage: [
              { pagePath: "/", lcp: 2.2 },
              { pagePath: "/shop", lcp: 2.6 },
              { pagePath: "/product/123", lcp: 3.1 },
              { pagePath: "/cart", lcp: 2.4 },
              { pagePath: "/checkout", lcp: 3.7 },
            ],
          },
          cumulativeLayoutShift: {
            average: 0.12,
            byPage: [
              { pagePath: "/", cls: 0.08 },
              { pagePath: "/shop", cls: 0.11 },
              { pagePath: "/product/123", cls: 0.15 },
              { pagePath: "/cart", cls: 0.09 },
              { pagePath: "/checkout", cls: 0.17 },
            ],
          },
          firstInputDelay: {
            average: 45,
            byPage: [
              { pagePath: "/", fid: 35 },
              { pagePath: "/shop", fid: 42 },
              { pagePath: "/product/123", fid: 48 },
              { pagePath: "/cart", fid: 38 },
              { pagePath: "/checkout", fid: 62 },
            ],
          },
        };

        setPerformanceData(mockData);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred"),
        );
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [period]);

  const handlePeriodChange = (event: SelectChangeEvent<number>) => {
    setPeriod(Number(event.target.value));
  };

  // Format time in seconds with ms precision
  const formatTime = (time: number, unit: string = "s") => {
    return `${time.toFixed(2)}${unit}`;
  };

  // Generate chart data from performance metrics
  const generateChartData = () => {
    if (!performanceData) return [];

    return performanceData.pageLoadTime.byPage.map((item) => {
      const fcpItem = performanceData.firstContentfulPaint.byPage.find(
        (i) => i.pagePath === item.pagePath,
      );
      const lcpItem = performanceData.largestContentfulPaint.byPage.find(
        (i) => i.pagePath === item.pagePath,
      );

      return {
        name: item.pagePath,
        pageLoad: item.loadTime,
        fcp: fcpItem?.fcp || 0,
        lcp: lcpItem?.lcp || 0,
      };
    });
  };

  // Generate layout shift chart data
  const generateLayoutShiftData = () => {
    if (!performanceData) return [];

    return performanceData.cumulativeLayoutShift.byPage.map((item) => ({
      name: item.pagePath,
      cls: item.cls,
    }));
  };

  // Generate first input delay chart data
  const generateFidData = () => {
    if (!performanceData) return [];

    return performanceData.firstInputDelay.byPage.map((item) => ({
      name: item.pagePath,
      fid: item.fid,
    }));
  };

  // Handle loading state
  if (loading) {
    return (
      <AdminLayout title="Performance Metrics">
        <AnalyticsNavigation />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <AdminLayout title="Performance Metrics">
        <AnalyticsNavigation />
        <Box p={3}>
          <Alert severity="error">
            Error loading performance metrics: {error.message}
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  // Handle no data state
  if (!performanceData) {
    return (
      <AdminLayout title="Performance Metrics">
        <AnalyticsNavigation />
        <Box p={3}>
          <Alert severity="info">
            No performance metrics available. Please try again later.
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Performance Metrics">
      <AnalyticsNavigation />

      {/* Period selector */}
      <Box display="flex" justifyContent="flex-end" mb={3} p={3}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="period-select-label">Time Period</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={period}
            onChange={handlePeriodChange}
            label="Time Period"
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ width: "100%", px: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="performance metrics tabs"
          >
            <Tab label="Core Web Vitals" {...a11yProps(0)} />
            <Tab label="Page Load Times" {...a11yProps(1)} />
            <Tab label="Layout Stability" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {/* Core Web Vitals Tab */}
        <TabPanel value={tabValue} index={0}>
          <GridContainer spacing={3}>
            <GridItem xs={12}>
              <Card>
                <CardHeader title="Core Web Vitals Overview" />
                <CardContent>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={generateChartData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}s`, ""]} />
                        <Legend />
                        <Bar
                          dataKey="fcp"
                          name="First Contentful Paint"
                          fill="#8884d8"
                        />
                        <Bar
                          dataKey="lcp"
                          name="Largest Contentful Paint"
                          fill="#82ca9d"
                        />
                        <Bar
                          dataKey="pageLoad"
                          name="Page Load Time"
                          fill="#ffc658"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>

            <GridItem xs={12} md={4}>
              <Card>
                <CardHeader title="Page Load Time" />
                <CardContent>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h3" color="primary">
                      {formatTime(performanceData.pageLoadTime.average)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Average page load time
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>

            <GridItem xs={12} md={4}>
              <Card>
                <CardHeader title="First Contentful Paint" />
                <CardContent>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h3" color="primary">
                      {formatTime(performanceData.firstContentfulPaint.average)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Average FCP
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>

            <GridItem xs={12} md={4}>
              <Card>
                <CardHeader title="Largest Contentful Paint" />
                <CardContent>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h3" color="primary">
                      {formatTime(
                        performanceData.largestContentfulPaint.average,
                      )}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Average LCP
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>
          </GridContainer>
        </TabPanel>

        {/* Page Load Times Tab */}
        <TabPanel value={tabValue} index={1}>
          <GridContainer spacing={3}>
            <GridItem xs={12}>
              <Card>
                <CardHeader title="Page Load Times by Page" />
                <CardContent>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData.pageLoadTime.byPage}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="pagePath"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value}s`, "Load Time"]}
                        />
                        <Bar
                          dataKey="loadTime"
                          name="Load Time"
                          fill="#8884d8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>

            <GridItem xs={12}>
              <Card>
                <CardHeader title="Page Load Time Details" />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Page</TableCell>
                          <TableCell align="right">Load Time (s)</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performanceData.pageLoadTime.byPage.map((page) => (
                          <TableRow key={page.pagePath}>
                            <TableCell component="th" scope="row">
                              {page.pagePath}
                            </TableCell>
                            <TableCell align="right">
                              {formatTime(page.loadTime)}
                            </TableCell>
                            <TableCell align="right">
                              {page.loadTime < 2.0 ? (
                                <Typography color="success.main">
                                  Good
                                </Typography>
                              ) : page.loadTime < 3.0 ? (
                                <Typography color="warning.main">
                                  Needs Improvement
                                </Typography>
                              ) : (
                                <Typography color="error.main">Poor</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </GridItem>
          </GridContainer>
        </TabPanel>

        {/* Layout Stability Tab */}
        <TabPanel value={tabValue} index={2}>
          <GridContainer spacing={3}>
            <GridItem xs={12} md={6}>
              <Card>
                <CardHeader title="Cumulative Layout Shift" />
                <CardContent>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h3" color="primary">
                      {performanceData.cumulativeLayoutShift.average.toFixed(2)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Average CLS
                    </Typography>
                  </Box>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={generateLayoutShiftData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, "CLS"]} />
                        <Bar dataKey="cls" name="Layout Shift" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>

            <GridItem xs={12} md={6}>
              <Card>
                <CardHeader title="First Input Delay" />
                <CardContent>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h3" color="primary">
                      {performanceData.firstInputDelay.average}ms
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Average FID
                    </Typography>
                  </Box>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={generateFidData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}ms`, "FID"]} />
                        <Bar
                          dataKey="fid"
                          name="First Input Delay"
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </GridItem>
          </GridContainer>
        </TabPanel>
      </Box>
    </AdminLayout>
  );
};

export default PerformanceMetrics;
