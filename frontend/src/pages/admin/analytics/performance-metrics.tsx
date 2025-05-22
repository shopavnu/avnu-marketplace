import React, { useState, useEffect, ChangeEvent } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,

  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
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
  Cell,
} from 'recharts';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNavigation from '../../../components/analytics/AnalyticsNavigation';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `performance-tab-${index}`,
    'aria-controls': `performance-tabpanel-${index}`,
  };
}

interface PerformanceData {
  pageLoadTime: {
    average: number;
    byPage: { pagePath: string; loadTime: number }[];
  };
  firstContentfulPaint: {
    average: number;
    byPage: { pagePath: string; fcp: number }[];
  };
  largestContentfulPaint: {
    average: number;
    byPage: { pagePath: string; lcp: number }[];
  };
  firstInputDelay: {
    average: number;
    byPage: { pagePath: string; fid: number }[];
  };
  cumulativeLayoutShift: {
    average: number;
    byPage: { pagePath: string; cls: number }[];
  };
  timeToInteractive: {
    average: number;
    byPage: { pagePath: string; tti: number }[];
  };
}

const PerformanceMetrics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState(30);
  const { data: performanceData, loading, error } = useAnalyticsData<PerformanceData>(
    `/api/analytics/performance?period=${period}`
  );

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePeriodChange = (event: SelectChangeEvent<number>) => {
    setPeriod(event.target.value as number);
  };

  const formatTime = (seconds: number): string => {
    return seconds.toFixed(2) + 's';
  };

  const generateChartData = () => {
    if (!performanceData) return [];

    const pages = performanceData.pageLoadTime.byPage.map((item: { pagePath: string }) => item.pagePath);
    
    return pages.map((page: string) => {
      const fcpItem = performanceData.firstContentfulPaint.byPage.find(
        (item: { pagePath: string }) => item.pagePath === page
      );
      const lcpItem = performanceData.largestContentfulPaint.byPage.find(
        (item: { pagePath: string }) => item.pagePath === page
      );
      const loadItem = performanceData.pageLoadTime.byPage.find(
        (item: { pagePath: string }) => item.pagePath === page
      );
      
      return {
        name: page,
        fcp: fcpItem ? fcpItem.fcp : 0,
        lcp: lcpItem ? lcpItem.lcp : 0,
        pageLoad: loadItem ? loadItem.loadTime : 0,
      };
    });
  };

  const generateFirstInputDelayData = () => {
    if (!performanceData) return [];

    return performanceData.firstInputDelay.byPage.map((item: { pagePath: string; fid: number }) => ({
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
          <Box mb={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
              </Grid>

              <Grid item xs={12} md={4}>
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
              </Grid>

              <Grid item xs={12} md={4}>
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
              </Grid>

              <Grid item xs={12} md={4}>
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
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Page Load Times Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box mb={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
              </Grid>

              <Grid item xs={12}>
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
                          {performanceData.pageLoadTime.byPage.map((page: { pagePath: string; loadTime: number }) => (
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
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Layout Stability Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box mb={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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
                          data={performanceData.cumulativeLayoutShift.byPage}
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
                          <Tooltip formatter={(value) => [value, "CLS"]} />
                          <Bar dataKey="cls" name="CLS" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="First Input Delay" />
                  <CardContent>
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h3" color="primary">
                        {formatTime(performanceData.firstInputDelay.average)}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        Average FID
                      </Typography>
                    </Box>
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={generateFirstInputDelayData()}
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
                          <Tooltip
                            formatter={(value) => [`${value}ms`, "FID"]}
                          />
                          <Bar dataKey="fid" name="FID" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Box>
    </AdminLayout>
  );
};

export default PerformanceMetrics;
