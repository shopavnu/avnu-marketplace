import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
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
  ResponsiveContainer 
} from 'recharts';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNavigation from '../../../components/admin/AnalyticsNavigation';
import { format } from 'date-fns';
import { Grid as GridContainer, Grid as GridItem } from '../../../components/ui/MuiGrid';
import { PerformanceMetricsData } from '../../../components/analytics/types';

const PerformanceMetrics: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceMetricsData | null>(null);

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
              { pagePath: '/', loadTime: 1.8 },
              { pagePath: '/shop', loadTime: 2.1 },
              { pagePath: '/product/123', loadTime: 2.5 },
              { pagePath: '/cart', loadTime: 1.9 },
              { pagePath: '/checkout', loadTime: 3.2 }
            ]
          },
          firstContentfulPaint: {
            average: 1.2,
            byPage: [
              { pagePath: '/', fcp: 0.9 },
              { pagePath: '/shop', fcp: 1.1 },
              { pagePath: '/product/123', fcp: 1.3 },
              { pagePath: '/cart', fcp: 1.0 },
              { pagePath: '/checkout', fcp: 1.7 }
            ]
          },
          largestContentfulPaint: {
            average: 2.8,
            byPage: [
              { pagePath: '/', lcp: 2.2 },
              { pagePath: '/shop', lcp: 2.6 },
              { pagePath: '/product/123', lcp: 3.1 },
              { pagePath: '/cart', lcp: 2.4 },
              { pagePath: '/checkout', lcp: 3.7 }
            ]
          },
          cumulativeLayoutShift: {
            average: 0.12,
            byPage: [
              { pagePath: '/', cls: 0.08 },
              { pagePath: '/shop', cls: 0.11 },
              { pagePath: '/product/123', cls: 0.15 },
              { pagePath: '/cart', cls: 0.09 },
              { pagePath: '/checkout', cls: 0.17 }
            ]
          },
          firstInputDelay: {
            average: 45,
            byPage: [
              { pagePath: '/', fid: 35 },
              { pagePath: '/shop', fid: 42 },
              { pagePath: '/product/123', fid: 48 },
              { pagePath: '/cart', fid: 38 },
              { pagePath: '/checkout', fid: 62 }
            ]
          }
        };
        
        setPerformanceData(mockData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [period]);

  const handlePeriodChange = (event: SelectChangeEvent<number>) => {
    setPeriod(Number(event.target.value));
  };

  // Format time in seconds with ms precision
  const formatTime = (time: number, unit: string = 's') => {
    return `${time.toFixed(2)}${unit}`;
  };

  // Generate chart data from performance metrics
  const generateChartData = () => {
    if (!performanceData) return [];
    
    return performanceData.pageLoadTime.byPage.map((item) => {
      const fcpItem = performanceData.firstContentfulPaint.byPage.find(
        (i) => i.pagePath === item.pagePath
      );
      const lcpItem = performanceData.largestContentfulPaint.byPage.find(
        (i) => i.pagePath === item.pagePath
      );
      
      return {
        name: item.pagePath.replace(/^\//, '').replace(/\/$/, '') || 'Home',
        pageLoad: item.loadTime,
        fcp: fcpItem?.fcp || 0,
        lcp: lcpItem?.lcp || 0
      };
    });
  };

  // Generate layout shift chart data
  const generateLayoutShiftData = () => {
    if (!performanceData) return [];
    
    return performanceData.cumulativeLayoutShift.byPage.map((item) => {
      return {
        name: item.pagePath.replace(/^\//, '').replace(/\/$/, '') || 'Home',
        cls: item.cls
      };
    });
  };

  // Generate first input delay chart data
  const generateFidData = () => {
    if (!performanceData) return [];
    
    return performanceData.firstInputDelay.byPage.map((item) => {
      return {
        name: item.pagePath.replace(/^\//, '').replace(/\/$/, '') || 'Home',
        fid: item.fid
      };
    });
  };

  // Handle loading state
  if (loading) {
    return (
      <AdminLayout title="Performance Metrics">
        <AnalyticsNavigation />
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
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
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading performance metrics. Please try again later.</p>
          <p className="text-sm mt-2">
            {error?.message || 'Unknown error'}
          </p>
        </div>
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
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="period-select-label">Period</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={period}
            onChange={handlePeriodChange}
            label="Period"
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Core Web Vitals Overview */}
      <GridContainer spacing={3} mb={3}>
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Core Web Vitals Overview" />
            <CardContent>
              <GridContainer spacing={3}>
                <GridItem xs={12} md={4}>
                  <Box textAlign="center" p={2} borderRadius={1} bgcolor="#f5f5f5">
                    <Typography variant="h6" color="primary" gutterBottom>
                      LCP
                    </Typography>
                    <Typography variant="h4">
                      {formatTime(performanceData.largestContentfulPaint.average)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Largest Contentful Paint
                    </Typography>
                    <Typography variant="caption" 
                      color={performanceData.largestContentfulPaint.average < 2.5 ? "success.main" : 
                        performanceData.largestContentfulPaint.average < 4 ? "warning.main" : "error.main"}>
                      {performanceData.largestContentfulPaint.average < 2.5 ? "Good" : 
                        performanceData.largestContentfulPaint.average < 4 ? "Needs Improvement" : "Poor"}
                    </Typography>
                  </Box>
                </GridItem>
                <GridItem xs={12} md={4}>
                  <Box textAlign="center" p={2} borderRadius={1} bgcolor="#f5f5f5">
                    <Typography variant="h6" color="primary" gutterBottom>
                      FID
                    </Typography>
                    <Typography variant="h4">
                      {formatTime(performanceData.firstInputDelay.average / 1000)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      First Input Delay
                    </Typography>
                    <Typography variant="caption" 
                      color={performanceData.firstInputDelay.average < 100 ? "success.main" : 
                        performanceData.firstInputDelay.average < 300 ? "warning.main" : "error.main"}>
                      {performanceData.firstInputDelay.average < 100 ? "Good" : 
                        performanceData.firstInputDelay.average < 300 ? "Needs Improvement" : "Poor"}
                    </Typography>
                  </Box>
                </GridItem>
                <GridItem xs={12} md={4}>
                  <Box textAlign="center" p={2} borderRadius={1} bgcolor="#f5f5f5">
                    <Typography variant="h6" color="primary" gutterBottom>
                      CLS
                    </Typography>
                    <Typography variant="h4">
                      {performanceData.cumulativeLayoutShift.average.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Cumulative Layout Shift
                    </Typography>
                    <Typography variant="caption" 
                      color={performanceData.cumulativeLayoutShift.average < 0.1 ? "success.main" : 
                        performanceData.cumulativeLayoutShift.average < 0.25 ? "warning.main" : "error.main"}>
                      {performanceData.cumulativeLayoutShift.average < 0.1 ? "Good" : 
                        performanceData.cumulativeLayoutShift.average < 0.25 ? "Needs Improvement" : "Poor"}
                    </Typography>
                  </Box>
                </GridItem>
              </GridContainer>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
      
      {/* Page Load Metrics Chart */}
      <GridContainer spacing={3} mb={3}>
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Page Load Metrics by Page" />
            <CardContent>
              <Box height={400}>
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
                    <YAxis label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} seconds`, '']} />
                    <Legend />
                    <Bar dataKey="pageLoad" name="Page Load Time" fill="#8884d8" />
                    <Bar dataKey="fcp" name="First Contentful Paint" fill="#82ca9d" />
                    <Bar dataKey="lcp" name="Largest Contentful Paint" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
      
      {/* Layout Shift and Input Delay Charts */}
      <GridContainer spacing={3} mb={3}>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Cumulative Layout Shift by Page" />
            <CardContent>
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
                    <Tooltip formatter={(value) => [`${value}`, 'CLS Score']} />
                    <Bar dataKey="cls" name="CLS Score" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="First Input Delay by Page" />
            <CardContent>
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
                    <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} ms`, 'FID']} />
                    <Bar dataKey="fid" name="FID (ms)" fill="#8dd1e1" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
      
      {/* Detailed Metrics Table */}
      <GridContainer spacing={3}>
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Detailed Performance Metrics by Page" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Page</TableCell>
                      <TableCell align="right">Page Load (s)</TableCell>
                      <TableCell align="right">FCP (s)</TableCell>
                      <TableCell align="right">LCP (s)</TableCell>
                      <TableCell align="right">CLS</TableCell>
                      <TableCell align="right">FID (ms)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.pageLoadTime.byPage.map((item, index) => {
                      const fcpItem = performanceData.firstContentfulPaint.byPage.find(
                        (i) => i.pagePath === item.pagePath
                      );
                      const lcpItem = performanceData.largestContentfulPaint.byPage.find(
                        (i) => i.pagePath === item.pagePath
                      );
                      const clsItem = performanceData.cumulativeLayoutShift.byPage.find(
                        (i) => i.pagePath === item.pagePath
                      );
                      const fidItem = performanceData.firstInputDelay.byPage.find(
                        (i) => i.pagePath === item.pagePath
                      );
                      
                      return (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {item.pagePath || '/'}
                          </TableCell>
                          <TableCell align="right">{item.loadTime.toFixed(2)}</TableCell>
                          <TableCell align="right">{fcpItem?.fcp.toFixed(2) || '-'}</TableCell>
                          <TableCell align="right">{lcpItem?.lcp.toFixed(2) || '-'}</TableCell>
                          <TableCell align="right">{clsItem?.cls.toFixed(2) || '-'}</TableCell>
                          <TableCell align="right">{fidItem?.fid || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
    </AdminLayout>
  );
};

export default PerformanceMetrics;
