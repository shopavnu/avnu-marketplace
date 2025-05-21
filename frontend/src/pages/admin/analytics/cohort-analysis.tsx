import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  MenuItem,
  Button
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Repeat as RepeatIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  DevicesOther as DevicesIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNav from '../../../components/admin/AnalyticsNav';
// Import custom Grid wrapper to fix TypeScript errors
import { Grid as CustomGrid, GridContainer, GridItem } from '../../../components/ui/Grid';
import AnalyticsFilters, { AnalyticsFilterValues } from '../../../components/admin/AnalyticsFilters';
import AnomalyAlerts, { Anomaly, AnomalyType, AnomalySeverity } from '../../../components/admin/AnomalyAlerts';
// Properly import MetricCard component
import MetricCard from '../../../components/admin/MetricCard';
// Replace MockChart with Recharts components
import { 
  PieChartComponent, 
  BarChartComponent, 
  LineChartComponent, 
  AreaChartComponent 
} from '../../../components/charts';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { brandColors } from '../../../utils/chartTheme';

/**
 * Cohort Analysis Dashboard
 * Analytics page for tracking user cohorts, retention, and lifetime value metrics,
 * including cross-device journey mapping
 */
// Mock anomaly data for cohort analysis dashboard
const mockAnomalies: Anomaly[] = [
  {
    id: 'anomaly-1',
    type: AnomalyType.DROP,
    metric: 'Email Cohort Retention',
    value: 38.2,
    expectedValue: 65.0,
    deviation: -41.2,
    timestamp: '2025-05-20T14:30:00Z',
    severity: AnomalySeverity.CRITICAL,
    description: 'Email acquisition cohort showing severe retention decline',
    affectedSegment: 'Email Campaign (April 2025)',
    recommendation: 'Investigate recent email campaign content quality and onboarding flow issues',
  },
  {
    id: 'anomaly-2',
    type: AnomalyType.SPIKE,
    metric: 'Multi-Device Journey Abandonment',
    value: 47.5,
    expectedValue: 31.5,
    deviation: 50.8,
    timestamp: '2025-05-19T16:15:00Z',
    severity: AnomalySeverity.HIGH,
    description: 'Sharp increase in users abandoning during device transition',
    affectedSegment: 'Mobile → Desktop Journey',
    recommendation: 'Review cross-device authentication and session persistence mechanisms',
  },
  {
    id: 'anomaly-3',
    type: AnomalyType.THRESHOLD_BREACH,
    metric: 'Lifetime Value Stagnation',
    value: 127.0,
    expectedValue: 152.0,
    deviation: -16.4,
    timestamp: '2025-05-18T09:20:00Z',
    severity: AnomalySeverity.MEDIUM,
    description: 'Average customer LTV has failed to grow as expected',
    affectedSegment: 'Paid Search Cohorts',
    recommendation: 'Review paid search targeting and landing page optimization',
  },
];

const CohortAnalytics: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState(0);
  const [timeRange, setTimeRange] = React.useState('90');
  const [acquisitionChannel, setAcquisitionChannel] = React.useState('all');
  const [anomalies, setAnomalies] = React.useState<Anomaly[]>(mockAnomalies);
  const [filters, setFilters] = React.useState<AnalyticsFilterValues>({
    dateRange: '90days',
    category: 'all',
    platform: 'all',
    merchant: 'all',
    comparisonType: 'previous'
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };
  
  const handleChannelChange = (event: SelectChangeEvent) => {
    setAcquisitionChannel(event.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: AnalyticsFilterValues) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
    // Apply filters to data
    if (newFilters.dateRange === '90days') setTimeRange('90');
    else if (newFilters.dateRange === '30days') setTimeRange('30');
    else if (newFilters.dateRange === '7days') setTimeRange('7');
  };

  // Handle anomaly dismissal
  const handleAnomalyDismiss = (id: string) => {
    setAnomalies(anomalies.filter(anomaly => anomaly.id !== id));
  };

  // Mock data - to be replaced with API call
  const mockData = {
    // Basic metrics
    totalCohorts: 24,
    avgRetentionRate: 34.5,
    topPerformingCohort: 'March 2025 Mobile App',
    lifetimeValue: {
      averageLTV: 127,
      bestChannelLTV: 245,
      ltv30Days: 42
    },
    repeatPurchaseRate: 28.3,
    
    // Enhanced cohort analysis data
    acquisitionChannels: [
      { id: 'organic', name: 'Organic Search' },
      { id: 'social', name: 'Social Media' },
      { id: 'email', name: 'Email Campaigns' },
      { id: 'paid', name: 'Paid Search' },
      { id: 'direct', name: 'Direct Traffic' },
      { id: 'referral', name: 'Referrals' }
    ],
    
    // Retention curve data
    retentionByChannel: {
      organic: [100, 45, 38, 32, 30, 29],
      social: [100, 38, 28, 25, 20, 18],
      email: [100, 65, 52, 48, 45, 43],
      paid: [100, 42, 36, 31, 29, 28],
      direct: [100, 46, 40, 37, 35, 34],
      referral: [100, 58, 50, 45, 42, 40],
      all: [100, 49, 41, 36, 33, 32]
    },
    retentionPeriods: ['Initial', 'Week 1', 'Week 2', 'Week 4', 'Week 8', 'Week 12'],
    
    // LTV data
    ltvByChannel: {
      organic: { avg: 85, day30: 28, day60: 42, day90: 85 },
      social: { avg: 72, day30: 22, day60: 38, day90: 65 }, // Fixed 'day72' to 'day90' for consistency
      email: { avg: 245, day30: 110, day60: 185, day90: 245 },
      paid: { avg: 120, day30: 58, day60: 95, day90: 120 },
      direct: { avg: 95, day30: 35, day60: 65, day90: 95 },
      referral: { avg: 195, day30: 85, day60: 145, day90: 195 },
      all: { avg: 127, day30: 55, day60: 95, day90: 127 }
    },
    
    // Repeat purchase data
    repeatPurchaseByChannel: {
      organic: [45, 25, 12, 8],
      social: [52, 22, 9, 4],
      email: [75, 45, 28, 18],
      paid: [58, 28, 14, 9],
      direct: [42, 25, 15, 10],
      referral: [65, 38, 22, 15],
      all: [56, 30, 17, 12]
    },
    repeatPurchasePeriods: ['1 Purchase', '2 Purchases', '3 Purchases', '4+ Purchases'],
    
    // Cross-device journey data
    crossDeviceMetrics: {
      avgDevicesPerPurchase: 1.8,
      singleDeviceConversion: 3.2,
      multiDeviceConversion: 5.7,
      deviceSwitchCompletionRate: 68.5,
      topJourneyConversionRate: 7.2
    },
    
    deviceJourneys: [
      { name: 'Mobile → Desktop', conversionRate: 7.2, avgOrderValue: 142, journeyCount: 12450 },
      { name: 'Desktop → Mobile', conversionRate: 4.8, avgOrderValue: 98, journeyCount: 8760 },
      { name: 'Mobile Only', conversionRate: 3.1, avgOrderValue: 72, journeyCount: 45280 },
      { name: 'Desktop Only', conversionRate: 4.2, avgOrderValue: 128, journeyCount: 28640 },
      { name: 'Tablet → Desktop', conversionRate: 5.1, avgOrderValue: 135, journeyCount: 4320 },
      { name: 'Mobile → Tablet → Desktop', conversionRate: 6.7, avgOrderValue: 185, journeyCount: 2240 }
    ],
    
    deviceUsage: [
      { devices: 1, percentage: 62, conversionRate: 3.5 },
      { devices: 2, percentage: 28, conversionRate: 5.8 },
      { devices: 3, percentage: 8, conversionRate: 6.9 },
      { devices: '4+', percentage: 2, conversionRate: 7.2 }
    ]
  };
  
  return (
    <AdminLayout title="Cohort Analysis">
      <AnalyticsNav />
      
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Cohort Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track user cohorts, retention metrics, and multi-device journeys
        </Typography>
        
        {/* Analytics Filters Component */}
        <AnalyticsFilters 
          onFilterChange={handleFilterChange}
          availableFilters={{
            dateRanges: true,
            platforms: true,
            comparison: true,
            exportFormats: ['CSV', 'Excel', 'PDF']
          }}
          initialValues={filters}
        />
        
        {/* Anomaly Alerts Component */}
        {anomalies.length > 0 && (
          <AnomalyAlerts 
            anomalies={anomalies} 
            onDismiss={handleAnomalyDismiss}
            onViewAll={() => alert('Viewing all cohort analysis anomalies')}
          />
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" className="mb-4">
              <Tab label="Cohort Analysis" />
              <Tab label="Cross-Device Journey" />
            </Tabs>
            
            {activeTab === 0 ? (
            <>
            <GridContainer spacing={3} className="mb-6">
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Total Tracked Cohorts" 
                  value={mockData.totalCohorts.toString()}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Average Retention Rate" 
                  value={`${mockData.avgRetentionRate}%`}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Average Lifetime Value" 
                  value={`$${mockData.lifetimeValue.averageLTV}`}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Repeat Purchase Rate" 
                  value={`${mockData.repeatPurchaseRate}%`}
                />
              </GridItem>
            </GridContainer>

            <Box mb={3} display="flex" justifyContent="flex-end">
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  label="Time Range"
                >
                  <MenuItem value="30">30 Days</MenuItem>
                  <MenuItem value="60">60 Days</MenuItem>
                  <MenuItem value="90">90 Days</MenuItem>
                  <MenuItem value="180">180 Days</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Acquisition Channel</InputLabel>
                <Select
                  value={acquisitionChannel}
                  onChange={handleChannelChange}
                  label="Acquisition Channel"
                >
                  <MenuItem value="all">All Channels</MenuItem>
                  {mockData.acquisitionChannels.map(channel => (
                    <MenuItem key={channel.id} value={channel.id}>{channel.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <GridContainer spacing={3}>
              <GridItem xs={12} md={8}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Retention Curves by Acquisition Channel
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    How users from different acquisition sources retain over time
                  </Typography>
                  <Box height={300}>
                    <LineChartComponent
                      data={mockData.retentionPeriods.map((period, index) => ({
                        period,
                        organic: mockData.retentionByChannel.organic[index],
                        social: mockData.retentionByChannel.social[index],
                        email: mockData.retentionByChannel.email[index],
                        paid: mockData.retentionByChannel.paid[index],
                        direct: mockData.retentionByChannel.direct[index],
                        referral: mockData.retentionByChannel.referral[index]
                      }))}
                      xKey="period"
                      yKey="organic"
                      height={270}
                      xAxisLabel="Time Period"
                      yAxisLabel="Retention Rate (%)"
                      tooltipFormatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                  </Box>
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary" fontWeight="medium">
                      {acquisitionChannel === 'all' ? 'All Channels' : 
                       mockData.acquisitionChannels.find(c => c.id === acquisitionChannel)?.name} Retention Rate:
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      {mockData.retentionPeriods.map((period, index) => (
                        <Box key={period} textAlign="center" width={`${100 / mockData.retentionPeriods.length}%`}>
                          <Typography variant="body2" fontWeight="bold">
                            {mockData.retentionByChannel[acquisitionChannel as keyof typeof mockData.retentionByChannel][index]}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">{period}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={4}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Lifetime Value Progression
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    LTV growth over customer lifecycle
                  </Typography>
                  <Box height={300}>
                    <Box width="100%" height={270}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { period: '30 Days', ltv: mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day30 },
                            { period: '60 Days', ltv: mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day60 },
                            { period: '90 Days', ltv: mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day90 }
                          ]}
                          margin={{
                            top: 15,
                            right: 20,
                            left: 30,  // Reduced to prevent squishing
                            bottom: 30,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={brandColors.sand} strokeOpacity={0.4} />
                          <XAxis 
                            dataKey="period" 
                            label={{ 
                              value: "Time Period", 
                              position: "bottom", 
                              offset: 5, 
                              style: { fill: brandColors.charcoal, fontSize: 12 } 
                            }}
                            tick={{ fill: brandColors.charcoal, fontSize: 12 }}
                            axisLine={{ stroke: brandColors.sand }}
                            tickLine={{ stroke: brandColors.sand }}
                          />
                          <YAxis 
                            label={{
                              value: "Lifetime Value ($)", 
                              angle: -90, 
                              position: "insideLeft", 
                              dx: -10, // Smaller offset to avoid pushing content
                              style: { fill: brandColors.charcoal, fontSize: 12 } 
                            }}
                            tick={{ fill: brandColors.charcoal, fontSize: 12 }}
                            axisLine={{ stroke: brandColors.sand }}
                            tickLine={{ stroke: brandColors.sand }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`$${value}`, "Lifetime Value"]}
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              border: `1px solid ${brandColors.sand}`,
                              borderRadius: 4,
                              padding: 10,
                              fontSize: 12
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: 10,
                              fontSize: 12
                            }}
                            formatter={() => "Customer LTV ($)"}
                          />
                          <Bar 
                            dataKey="ltv" 
                            name="Customer LTV"
                            fill={brandColors.teal}
                            radius={[4, 4, 0, 0]}
                          >
                            {[
                              { period: '30 Days', ltv: mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day30 },
                              { period: '60 Days', ltv: mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day60 },
                              { period: '90 Days', ltv: mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day90 }
                            ].map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={[
                                  brandColors.teal, 
                                  brandColors.terracotta, 
                                  brandColors.olive
                                ][index] || brandColors.teal} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="body2" fontWeight="medium">
                      {acquisitionChannel === 'all' ? 'All Channels' : 
                       mockData.acquisitionChannels.find(c => c.id === acquisitionChannel)?.name} LTV:
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Box textAlign="center">
                        <Typography variant="body2" fontWeight="bold">
                          ${mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day30}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">30 Days</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="body2" fontWeight="bold">
                          ${mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day60}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">60 Days</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="body2" fontWeight="bold">
                          ${mockData.ltvByChannel[acquisitionChannel as keyof typeof mockData.ltvByChannel].day90}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">90 Days</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Repeat Purchase Frequency
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Distribution of customers by number of purchases
                  </Typography>
                  <Box height={300}>
                    <BarChartComponent
                      data={mockData.repeatPurchasePeriods.map((period, index) => ({
                        period,
                        value: mockData.repeatPurchaseByChannel[acquisitionChannel as keyof typeof mockData.repeatPurchaseByChannel][index]
                      }))}
                      xKey="period"
                      yKey="value"
                      height={270}
                      barSize={50}
                      xAxisLabel="Purchase Count"
                      yAxisLabel="Percentage of Customers"
                      tooltipFormatter={(value: number) => `${value}%`}
                    />
                  </Box>
                  <Box mt={2}>
                    <Typography variant="body2" fontWeight="medium">Customer Distribution:</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      {mockData.repeatPurchasePeriods.map((period, index) => (
                        <Box key={period} textAlign="center">
                          <Typography variant="body2" fontWeight="bold">
                            {mockData.repeatPurchaseByChannel[acquisitionChannel as keyof typeof mockData.repeatPurchaseByChannel][index]}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">{period}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Cohort Performance Matrix
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Comparing acquisition sources by key metrics
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Acquisition Source</TableCell>
                          <TableCell align="right">Retention</TableCell>
                          <TableCell align="right">LTV</TableCell>
                          <TableCell align="right">Repeat Purchase</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.acquisitionChannels.map(channel => {
                          const channelId = channel.id as keyof typeof mockData.retentionByChannel;
                          return (
                            <TableRow key={channel.id} hover>
                              <TableCell>{channel.name}</TableCell>
                              <TableCell align="right">{mockData.retentionByChannel[channelId][2]}%</TableCell>
                              <TableCell align="right">${mockData.ltvByChannel[channelId].avg}</TableCell>
                              <TableCell align="right">
                                {mockData.repeatPurchaseByChannel[channelId][1] + 
                                 mockData.repeatPurchaseByChannel[channelId][2] + 
                                 mockData.repeatPurchaseByChannel[channelId][3]}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </GridItem>
            </GridContainer>
            </>
            ) : (
            <>
            <GridContainer spacing={3} className="mb-6">
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Avg Devices Per Purchase" 
                  value={mockData.crossDeviceMetrics.avgDevicesPerPurchase.toString()}
                  icon="devices"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Multi-Device Conversion" 
                  value={`${mockData.crossDeviceMetrics.multiDeviceConversion}%`}
                  icon="device_hub"
                  subtitle="vs. Single Device: ${mockData.crossDeviceMetrics.singleDeviceConversion}%"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Device Switch Completion" 
                  value={`${mockData.crossDeviceMetrics.deviceSwitchCompletionRate}%`}
                  icon="swap_horiz"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Top Journey Conversion" 
                  value={`${mockData.crossDeviceMetrics.topJourneyConversionRate}%`}
                  icon="trending_up"
                  subtitle="Mobile → Desktop"
                />
              </GridItem>
            </GridContainer>

            <GridContainer spacing={3}>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Cross-Device Journey Performance
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Conversion rates for different device journeys
                  </Typography>
                  <Box height={300}>
                    <BarChartComponent
                      data={mockData.deviceJourneys.map(journey => ({
                        journey: journey.name,
                        rate: journey.conversionRate
                      }))}
                      xKey="journey"
                      yKey="rate"
                      height={270}
                      barSize={40}
                      xAxisLabel="Device Journey"
                      yAxisLabel="Conversion Rate (%)"
                      tooltipFormatter={(value: number) => `${value}%`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Devices Used Per Completed Purchase
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Distribution of completed purchases by device count
                  </Typography>
                  <Box height={300}>
                    <PieChartComponent
                      data={mockData.deviceUsage.map(item => ({
                        name: `${item.devices} device${item.devices !== 1 ? 's' : ''}`,
                        value: item.percentage
                      }))}
                      nameKey="name"
                      valueKey="value"
                      height={270}
                      donut={true}
                      tooltipFormatter={(value: number) => `${value}% of purchases`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Device Journey Analysis
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Performance metrics for different cross-device journeys
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Journey Path</TableCell>
                          <TableCell align="right">Conversion Rate</TableCell>
                          <TableCell align="right">Avg Order Value</TableCell>
                          <TableCell align="right">Journey Count</TableCell>
                          <TableCell align="center">Performance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.deviceJourneys.map((journey) => {
                          let performanceColor = 'default';
                          if (journey.conversionRate > 6) performanceColor = 'success';
                          else if (journey.conversionRate > 4) performanceColor = 'primary';
                          else if (journey.conversionRate < 3.5) performanceColor = 'error';
                          
                          return (
                            <TableRow key={journey.name} hover>
                              <TableCell>{journey.name}</TableCell>
                              <TableCell align="right">{journey.conversionRate}%</TableCell>
                              <TableCell align="right">${journey.avgOrderValue}</TableCell>
                              <TableCell align="right">{journey.journeyCount.toLocaleString()}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  size="small" 
                                  color={performanceColor as any} 
                                  label={journey.conversionRate > 6 ? 'Excellent' : 
                                         journey.conversionRate > 4 ? 'Good' : 
                                         journey.conversionRate > 3.5 ? 'Average' : 'Below Average'} 
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </GridItem>
              <GridItem xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Device Usage Distribution & Conversion
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Relationship between number of devices used and conversion rates
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Number of Devices</TableCell>
                          <TableCell align="right">Percentage of Users</TableCell>
                          <TableCell align="right">Conversion Rate</TableCell>
                          <TableCell align="right">Relative Performance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.deviceUsage.map((usage) => (
                          <TableRow key={usage.devices} hover>
                            <TableCell>{usage.devices}</TableCell>
                            <TableCell align="right">{usage.percentage}%</TableCell>
                            <TableCell align="right">{usage.conversionRate}%</TableCell>
                            <TableCell align="right">
                              {usage.conversionRate > mockData.deviceUsage[0].conversionRate ? (
                                <Typography variant="body2" color="success.main">
                                  +{((usage.conversionRate / mockData.deviceUsage[0].conversionRate) * 100 - 100).toFixed(0)}%
                                </Typography>
                              ) : (
                                <Typography variant="body2">
                                  Baseline
                                </Typography>
                              )}
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
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default CohortAnalytics;

