import React, { useState, useEffect } from 'react';
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
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNavigation from '../../../components/admin/AnalyticsNavigation';
// Mock data instead of using axios
import { format } from 'date-fns';
import { GridContainer, GridItem } from '../../../components/ui/MuiGrid';

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Format milliseconds as readable time
const formatTime = (ms: number) => {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
};

// Define tab panel component
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Define performance metrics dashboard
export default function PerformanceMetricsDashboard() {
  // State for tab value
  const [tabValue, setTabValue] = useState(0);
  
  // State for period selection
  const [period, setPeriod] = useState(30);
  
  // State for threshold sliders
  const [apiSlowThreshold, setApiSlowThreshold] = useState(1000);
  const [querySlowThreshold, setQuerySlowThreshold] = useState(500);
  
  // State for loading indicators
  const [apiLoading, setApiLoading] = useState(true);
  const [clientLoading, setClientLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(true);
  
  // State for metrics data
  const [apiMetrics, setApiMetrics] = useState<any>({slowEndpoints: [], performanceTrends: []});
  const [clientMetrics, setClientMetrics] = useState<any>({slowPages: [], performanceTrends: []});
  const [queryMetrics, setQueryMetrics] = useState<any>({slowQueries: [], executionCounts: [], performanceTrends: []});

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  // Load API performance metrics with mock data
  const loadApiMetrics = () => {
    setApiLoading(true);
    try {
      // Use mock data instead of axios
      setTimeout(() => {
        setApiMetrics({
          slowEndpoints: [
            { endpoint: '/api/products', responseTime: 850, count: 245 },
            { endpoint: '/api/orders', responseTime: 720, count: 189 },
            { endpoint: '/api/users', responseTime: 650, count: 320 },
            { endpoint: '/api/analytics', responseTime: 580, count: 156 },
            { endpoint: '/api/checkout', responseTime: 520, count: 98 }
          ],
          performanceTrends: [
            { date: '2023-01-01', responseTime: 620 },
            { date: '2023-01-02', responseTime: 580 },
            { date: '2023-01-03', responseTime: 650 },
            { date: '2023-01-04', responseTime: 590 },
            { date: '2023-01-05', responseTime: 540 },
            { date: '2023-01-06', responseTime: 510 },
            { date: '2023-01-07', responseTime: 490 }
          ]
        });
        setApiLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load API performance metrics:', error);
      setApiLoading(false);
    }
  };

  // Load client performance metrics
  const loadClientMetrics = async () => {
    setClientLoading(true);
    try {
      // Simulate API call - in a real app, this would be an actual API call
      // const response = await axios.get(`/analytics/performance/client?period=${period}`);
      // setClientMetrics(response.data);
      setTimeout(() => {
        setClientMetrics({
          slowPages: [
            { page: '/products', loadTime: 1200, count: 1245 },
            { page: '/checkout', loadTime: 980, count: 567 },
            { page: '/product/details', loadTime: 890, count: 876 },
            { page: '/cart', loadTime: 780, count: 654 },
            { page: '/account', loadTime: 720, count: 432 }
          ],
          performanceTrends: [
            { date: '2023-01-01', loadTime: 950 },
            { date: '2023-01-02', loadTime: 920 },
            { date: '2023-01-03', loadTime: 980 },
            { date: '2023-01-04', loadTime: 910 },
            { date: '2023-01-05', loadTime: 890 },
            { date: '2023-01-06', loadTime: 870 },
            { date: '2023-01-07', loadTime: 850 }
          ]
        });
        setClientLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load client performance metrics:', error);
      setClientLoading(false);
    }
  };

  // Load query performance metrics
  const loadQueryMetrics = async () => {
    setQueryLoading(true);
    try {
      // Simulate API call - in a real app, this would be an actual API call
      // const response = await axios.get(`/analytics/performance/query?period=${period}&slowThreshold=${querySlowThreshold}`);
      // setQueryMetrics(response.data);
      setTimeout(() => {
        setQueryMetrics({
          slowQueries: [
            { queryType: 'SELECT', responseTime: 320, count: 5678 },
            { queryType: 'INSERT', responseTime: 280, count: 1234 },
            { queryType: 'UPDATE', responseTime: 260, count: 987 },
            { queryType: 'DELETE', responseTime: 220, count: 345 },
            { queryType: 'JOIN', responseTime: 380, count: 789 }
          ],
          executionCounts: [
            { queryType: 'SELECT', count: 5678 },
            { queryType: 'INSERT', count: 1234 },
            { queryType: 'UPDATE', count: 987 },
            { queryType: 'DELETE', count: 345 },
            { queryType: 'JOIN', count: 789 }
          ],
          performanceTrends: [
            { date: '2023-01-01', responseTime: 290 },
            { date: '2023-01-02', responseTime: 310 },
            { date: '2023-01-03', responseTime: 280 },
            { date: '2023-01-04', responseTime: 270 },
            { date: '2023-01-05', responseTime: 260 },
            { date: '2023-01-06', responseTime: 250 },
            { date: '2023-01-07', responseTime: 240 }
          ]
        });
        setQueryLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load query performance metrics:', error);
      setQueryLoading(false);
    }
  };

  // Load all metrics when component mounts or filters change
  useEffect(() => {
    loadApiMetrics();
    loadClientMetrics();
    loadQueryMetrics();
  }, [period, apiSlowThreshold, querySlowThreshold]);

  // API Performance Tab Component
  const ApiPerformanceTab = () => {
    if (apiLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (!apiMetrics || !apiMetrics.slowEndpoints || !apiMetrics.performanceTrends) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6">No API metrics data available</Typography>
        </Box>
      );
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">API Performance Metrics would display here</Typography>
      </Box>
    );
  };

  // Client Performance Tab Component
  const ClientPerformanceTab = () => {
    if (clientLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">Client Performance Metrics would display here</Typography>
      </Box>
    );
  };

  // Render query performance metrics
  const QueryPerformanceTab = () => {
    if (queryLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    // Safely access the data with null checks
    const slowQueries = queryMetrics?.slowQueries || [];
    const executionCounts = queryMetrics?.executionCounts || [];
    const performanceTrends = queryMetrics?.performanceTrends || [];
    
    return (
      <GridContainer spacing={3}>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Slow Queries by Type" />
            <CardContent>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={slowQueries.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="ms" />
                    <YAxis 
                      dataKey="queryType" 
                      type="category" 
                      width={150}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.length > 25 ? `${value.substring(0, 25)}...` : value}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'Avg Execution Time') return [`${value.toFixed(0)}ms`, name];
                        if (name === 'Max Execution Time') return [`${value.toFixed(0)}ms`, name];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Query Type: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="avgExecutionTime" name="Avg Execution Time" fill="#8884d8" />
                    <Bar dataKey="maxExecutionTime" name="Max Execution Time" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Query Execution Count" />
            <CardContent>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slowQueries.slice(0, 5)}
                      dataKey="count"
                      nameKey="queryType"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => entry.queryType.split('.')[1] || entry.queryType}
                    >
                      {slowQueries.slice(0, 5).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} executions`, 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12}>
          <Card>
            <CardHeader title="Query Performance Trends" />
            <CardContent>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={queryMetrics.queryPerformanceTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        try {
                          return format(new Date(value), 'MM/dd');
                        } catch (e) {
                          return value;
                        }
                      }}
                    />
                    <YAxis unit="ms" />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(0)}ms`, 'Avg Execution Time']}
                      labelFormatter={(label) => {
                        try {
                          return format(new Date(label), 'MMM dd, yyyy');
                        } catch (e) {
                          return label;
                        }
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avgExecutionTime" name="Avg Execution Time" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12}>
          <Card>
            <CardHeader title="Slow Query Details" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Query ID</TableCell>
                      <TableCell>Query Type</TableCell>
                      <TableCell align="right">Execution Time</TableCell>
                      <TableCell align="right">Result Count</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Parameters</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryMetrics.slowQueryDetails.slice(0, 10).map((query: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell 
                          component="th" 
                          scope="row"
                          sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {query.queryId}
                        </TableCell>
                        <TableCell
                          sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {query.queryType}
                        </TableCell>
                        <TableCell align="right">{formatTime(query.executionTime)}</TableCell>
                        <TableCell align="right">{query.resultCount}</TableCell>
                        <TableCell>
                          {format(new Date(query.timestamp), 'MM/dd/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell
                          sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {query.parameters}
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
    );
  };

  return (
    <AdminLayout title="Performance Metrics Dashboard">
      <AnalyticsNavigation />
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Metrics Dashboard
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <GridContainer spacing={3}>
            <GridItem xs={12} md={4}>
              <Typography gutterBottom>API Slow Threshold: {apiSlowThreshold}ms</Typography>
              <Slider
                value={apiSlowThreshold}
                min={50}
                max={1000}
                step={50}
                onChange={(e, newValue) => setApiSlowThreshold(newValue as number)}
                valueLabelDisplay="auto"
              />
            </GridItem>

            <GridItem xs={12} md={4}>
              <Typography gutterBottom>Query Slow Threshold: {querySlowThreshold}ms</Typography>
              <Slider
                value={querySlowThreshold}
                min={50}
                max={1000}
                step={50}
                onChange={(e, newValue) => setQuerySlowThreshold(newValue as number)}
                valueLabelDisplay="auto"
              />
            </GridItem>

            <GridItem xs={12} md={4}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  loadApiMetrics();
                  loadClientMetrics();
                  loadQueryMetrics();
                }}
              >
                Refresh
              </Button>
            </GridItem>
          </GridContainer>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="performance metrics tabs">
            <Tab label="API Performance" id="performance-tab-0" aria-controls="performance-tabpanel-0" />
            <Tab label="Client Performance" id="performance-tab-1" aria-controls="performance-tabpanel-1" />
            <Tab label="Query Performance" id="performance-tab-2" aria-controls="performance-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <ApiPerformanceTab />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ClientPerformanceTab />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <QueryPerformanceTab />
        </TabPanel>
      </Box>
    </AdminLayout>
  );
}
