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
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart,
  Pie,
  Cell,
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
import { UserBehaviorData } from '../../../components/analytics/types';
import HeatmapAnalyticsTab from '../../../components/analytics/HeatmapAnalyticsTab';

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
      id={`user-behavior-tabpanel-${index}`}
      aria-labelledby={`user-behavior-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-behavior-tab-${index}`,
    'aria-controls': `user-behavior-tabpanel-${index}`,
  };
}

const UserBehavior: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData | null>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [scrollData, setScrollData] = useState<any>(null);
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
        // Mock user behavior data
        const mockBehaviorData: UserBehaviorData = {
          sessionMetrics: {
            totalSessions: 12543,
            avgSessionDuration: 245, // in seconds
            bounceRate: 0.32,
            returnRate: 0.48
          },
          navigationPaths: [
            { 
              path: ['/', '/shop', '/product/123', '/cart', '/checkout'], 
              count: 1245,
              conversionRate: 0.65
            },
            { 
              path: ['/', '/shop', '/product/456', '/product/789'], 
              count: 876,
              conversionRate: 0.12
            },
            { 
              path: ['/', '/search', '/product/123', '/cart'], 
              count: 654,
              conversionRate: 0.23
            },
            { 
              path: ['/shop', '/product/456', '/cart', '/checkout'], 
              count: 432,
              conversionRate: 0.78
            },
            { 
              path: ['/', '/account', '/orders'], 
              count: 321,
              conversionRate: 0.05
            }
          ],
          userSegments: [
            { 
              segment: 'New Visitors', 
              sessionCount: 7654,
              avgSessionDuration: 180,
              conversionRate: 0.21
            },
            { 
              segment: 'Returning Visitors', 
              sessionCount: 4889,
              avgSessionDuration: 320,
              conversionRate: 0.38
            },
            { 
              segment: 'High Value Customers', 
              sessionCount: 1234,
              avgSessionDuration: 420,
              conversionRate: 0.65
            },
            { 
              segment: 'Cart Abandoners', 
              sessionCount: 2345,
              avgSessionDuration: 280,
              conversionRate: 0.12
            }
          ],
          deviceDistribution: [
            { deviceType: 'Desktop', sessionCount: 5678, percentage: 0.45 },
            { deviceType: 'Mobile', sessionCount: 5432, percentage: 0.43 },
            { deviceType: 'Tablet', sessionCount: 1433, percentage: 0.12 }
          ]
        };
        
        // Mock heatmap data
        const mockHeatmapData = {
          topPages: [
            { pagePath: '/', viewCount: 8765 },
            { pagePath: '/shop', viewCount: 6543 },
            { pagePath: '/product/123', viewCount: 4321 },
            { pagePath: '/cart', viewCount: 2345 },
            { pagePath: '/checkout', viewCount: 1234 }
          ],
          interactionMetricsByPage: [
            { 
              pagePath: '/', 
              clickCount: 12543, 
              hoverCount: 23456, 
              scrollPauseCount: 8765, 
              avgInteractionTime: 45.3,
              interactionDensity: 0.67
            },
            { 
              pagePath: '/shop', 
              clickCount: 9876, 
              hoverCount: 18765, 
              scrollPauseCount: 6543, 
              avgInteractionTime: 38.7,
              interactionDensity: 0.58
            },
            { 
              pagePath: '/product/123', 
              clickCount: 7654, 
              hoverCount: 14321, 
              scrollPauseCount: 5432, 
              avgInteractionTime: 62.1,
              interactionDensity: 0.72
            },
            { 
              pagePath: '/cart', 
              clickCount: 4321, 
              hoverCount: 8765, 
              scrollPauseCount: 3456, 
              avgInteractionTime: 28.9,
              interactionDensity: 0.45
            },
            { 
              pagePath: '/checkout', 
              clickCount: 2345, 
              hoverCount: 4567, 
              scrollPauseCount: 1876, 
              avgInteractionTime: 35.6,
              interactionDensity: 0.52
            }
          ],
          interactionsByDeviceType: [
            { deviceType: 'Desktop', interactionCount: 45678 },
            { deviceType: 'Mobile', interactionCount: 34567 },
            { deviceType: 'Tablet', interactionCount: 12345 }
          ],
          interactionTimeDistribution: [
            { timeRange: '0-10 seconds', sessionCount: 2345 },
            { timeRange: '10-30 seconds', sessionCount: 5678 },
            { timeRange: '30-60 seconds', sessionCount: 7654 },
            { timeRange: '1-3 minutes', sessionCount: 6543 },
            { timeRange: '3+ minutes', sessionCount: 3456 }
          ]
        };
        
        // Mock funnel data
        const mockFunnelData = {
          stages: [
            { name: 'Homepage Visit', count: 10000, conversionRate: 1.0 },
            { name: 'Product View', count: 7500, conversionRate: 0.75 },
            { name: 'Add to Cart', count: 3000, conversionRate: 0.4 },
            { name: 'Checkout Start', count: 1800, conversionRate: 0.6 },
            { name: 'Purchase', count: 1200, conversionRate: 0.67 }
          ],
          dropOffPoints: [
            { stage: 'Homepage to Product', count: 2500, percentage: 0.25 },
            { stage: 'Product to Cart', count: 4500, percentage: 0.6 },
            { stage: 'Cart to Checkout', count: 1200, percentage: 0.4 },
            { stage: 'Checkout to Purchase', count: 600, percentage: 0.33 }
          ]
        };
        
        // Mock scroll data
        const mockScrollData = {
          avgScrollDepth: 0.68,
          scrollDepthByPage: [
            { pagePath: '/', avgScrollDepth: 0.72 },
            { pagePath: '/shop', avgScrollDepth: 0.65 },
            { pagePath: '/product/123', avgScrollDepth: 0.83 },
            { pagePath: '/cart', avgScrollDepth: 0.91 },
            { pagePath: '/checkout', avgScrollDepth: 0.95 }
          ],
          scrollPausePoints: [
            { position: '25%', count: 4567 },
            { position: '50%', count: 6789 },
            { position: '75%', count: 3456 },
            { position: '100%', count: 1234 }
          ]
        };
        
        setBehaviorData(mockBehaviorData);
        setHeatmapData(mockHeatmapData);
        setFunnelData(mockFunnelData);
        setScrollData(mockScrollData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [period]);

  // Load heatmap data function (referenced in useEffect warning)
  const loadHeatmapData = () => {
    // This function would normally fetch heatmap data
    // It's already handled in the main useEffect
  };

  // Load funnel data function (referenced in useEffect warning)
  const loadFunnelData = () => {
    // This function would normally fetch funnel data
    // It's already handled in the main useEffect
  };

  // Load scroll data function (referenced in useEffect warning)
  const loadScrollData = () => {
    // This function would normally fetch scroll data
    // It's already handled in the main useEffect
  };

  const handlePeriodChange = (event: SelectChangeEvent<number>) => {
    setPeriod(Number(event.target.value));
  };

  // Generate chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Handle loading state
  if (loading) {
    return (
      <AdminLayout title="User Behavior Analytics">
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
      <AdminLayout title="User Behavior Analytics">
        <AnalyticsNavigation />
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading user behavior data. Please try again later.</p>
          <p className="text-sm mt-2">
            {error?.message || 'Unknown error'}
          </p>
        </div>
      </AdminLayout>
    );
  }

  // Handle no data state
  if (!behaviorData || !heatmapData || !funnelData || !scrollData) {
    return (
      <AdminLayout title="User Behavior Analytics">
        <AnalyticsNavigation />
        <Box p={3}>
          <Alert severity="info">
            No user behavior data available. Please try again later.
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Behavior Analytics">
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
      
      {/* Session Metrics Overview */}
      <GridContainer spacing={3} mb={3}>
        <GridItem xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h4">
                {behaviorData.sessionMetrics.totalSessions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Avg. Session Duration
              </Typography>
              <Typography variant="h4">
                {Math.floor(behaviorData.sessionMetrics.avgSessionDuration / 60)}m {behaviorData.sessionMetrics.avgSessionDuration % 60}s
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Bounce Rate
              </Typography>
              <Typography variant="h4">
                {(behaviorData.sessionMetrics.bounceRate * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Return Rate
              </Typography>
              <Typography variant="h4">
                {(behaviorData.sessionMetrics.returnRate * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
      
      {/* Tabs for different analytics views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user behavior tabs">
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Heatmap" {...a11yProps(1)} />
          <Tab label="Funnel Analysis" {...a11yProps(2)} />
          <Tab label="Scroll Behavior" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <GridContainer spacing={3}>
          {/* Device Distribution */}
          <GridItem xs={12} md={6}>
            <Card>
              <CardHeader title="Device Distribution" />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={behaviorData.deviceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="sessionCount"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {behaviorData.deviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Sessions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          
          {/* User Segments */}
          <GridItem xs={12} md={6}>
            <Card>
              <CardHeader title="User Segments" />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={behaviorData.userSegments}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Sessions']} />
                      <Legend />
                      <Bar dataKey="sessionCount" name="Sessions" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          
          {/* Navigation Paths */}
          <GridItem xs={12}>
            <Card>
              <CardHeader title="Top Navigation Paths" />
              <CardContent>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Path</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Conversion Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {behaviorData.navigationPaths.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.path.join(' → ')}
                          </TableCell>
                          <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                          <TableCell align="right">{(item.conversionRate * 100).toFixed(1)}%</TableCell>
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
      
      {/* Heatmap Tab */}
      <TabPanel value={tabValue} index={1}>
        <HeatmapAnalyticsTab data={heatmapData} />
      </TabPanel>
      
      {/* Funnel Analysis Tab */}
      <TabPanel value={tabValue} index={2}>
        <GridContainer spacing={3}>
          {/* Conversion Funnel */}
          <GridItem xs={12}>
            <Card>
              <CardHeader title="Conversion Funnel" />
              <CardContent>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={funnelData.stages}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                      />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                      <Bar 
                        dataKey="count" 
                        name="Users" 
                        fill="#8884d8"
                        label={{ position: 'right', formatter: (value) => value.toLocaleString() }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          
          {/* Drop-off Points */}
          <GridItem xs={12}>
            <Card>
              <CardHeader title="Drop-off Points" />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={funnelData.dropOffPoints}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="Users Lost" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="percentage" name="Drop-off Rate" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
        </GridContainer>
      </TabPanel>
      
      {/* Scroll Behavior Tab */}
      <TabPanel value={tabValue} index={3}>
        <GridContainer spacing={3}>
          {/* Average Scroll Depth */}
          <GridItem xs={12} md={6}>
            <Card>
              <CardHeader title="Average Scroll Depth by Page" />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={scrollData.scrollDepthByPage}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="pagePath" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Avg Scroll Depth']} />
                      <Bar dataKey="avgScrollDepth" name="Avg Scroll Depth" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          
          {/* Scroll Pause Points */}
          <GridItem xs={12} md={6}>
            <Card>
              <CardHeader title="Scroll Pause Points" />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={scrollData.scrollPausePoints}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Pauses']} />
                      <Bar dataKey="count" name="Pause Count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
        </GridContainer>
      </TabPanel>
    </AdminLayout>
  );
};

export default UserBehavior;
