import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNav from '../../../components/admin/AnalyticsNav';
import MetricCard from '../../../components/admin/MetricCard';
import { BarChartComponent, PieChartComponent, LineChartComponent } from '../../../components/charts';
// Import custom Grid wrapper to fix TypeScript errors
import { Grid, GridContainer, GridItem } from '../../../components/ui/Grid';

/**
 * Cross-Device Journey Dashboard
 * Tracks user journeys that span multiple devices and platforms
 */
const CrossDeviceJourney: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Mock data - to be replaced with API call
  const mockData = {
    crossDeviceUsers: 8754,
    avgDevicesPerUser: 2.3,
    crossDeviceConversion: 4.7,
    mobileToWebRatio: 2.4,
    deviceJourneyDistribution: [
      { type: "Mobile Only", percentage: 42 },
      { type: "Desktop Only", percentage: 31 },
      { type: "Mobile to Desktop", percentage: 16 },
      { type: "Desktop to Mobile", percentage: 11 },
    ],
    topConversionPaths: [
      { path: "Mobile App → Desktop Web → Purchase", rate: 5.8 },
      { path: "Desktop Browse → Mobile App → Purchase", rate: 4.2 },
      { path: "Mobile Web → Desktop Web → Purchase", rate: 3.9 },
    ]
  };
  
  return (
    <AdminLayout title="Cross-Device Journey">
      <AnalyticsNav />
      
      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Cross-Device User Journey
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track how users move between devices and platforms during their shopping journey
        </Typography>
        
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
            <Grid container spacing={3} className="mb-6">
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Cross-Device Users" 
                  value={mockData.crossDeviceUsers.toLocaleString()}
                  icon="devices"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Avg Devices Per User" 
                  value={mockData.avgDevicesPerUser.toString()}
                  icon="smartphone"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Cross-Device Conversion" 
                  value={`${mockData.crossDeviceConversion}%`}
                  icon="shopping_cart"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Mobile:Web Ratio" 
                  value={mockData.mobileToWebRatio.toString()}
                  icon="phonelink"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Cross-Device Conversion Funnel
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    How users progress through the purchase funnel across devices
                  </Typography>
                  <Box height={300}>
                    <BarChartComponent
                      data={[
                        { stage: 'Mobile Browse', value: 100 },
                        { stage: 'Add to Cart (Mobile)', value: 68 },
                        { stage: 'Switch to Desktop', value: 42 },
                        { stage: 'Complete Purchase', value: 23 }
                      ]}
                      xKey="stage"
                      yKey="value"
                      height={270}
                      barSize={40}
                      xAxisLabel="Journey Stage"
                      yAxisLabel="Users (%)"
                      tooltipFormatter={(value: number) => `${value}%`}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Device Journey Distribution
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Breakdown of single-device vs cross-device journeys
                  </Typography>
                  <Box height={300}>
                    <PieChartComponent
                      data={[
                        { name: 'Mobile → Desktop', value: 42 },
                        { name: 'Desktop → Mobile', value: 18 },
                        { name: 'Mobile Only', value: 24 },
                        { name: 'Desktop Only', value: 16 }
                      ]}
                      nameKey="name"
                      valueKey="value"
                      height={270}
                      donut={true}
                      tooltipFormatter={(value: number) => `${value}%`}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Top Performing Cross-Device Paths
                  </Typography>
                  <Box className="mt-4">
                    {mockData.topConversionPaths.map((path, index) => (
                      <Box key={index} className="mb-3">
                        <Typography variant="body1" gutterBottom>
                          {path.path}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Box width="70%" bgcolor="grey.100" mr={2} height={10} borderRadius={5}>
                            <Box
                              width={`${Math.min(100, path.rate * 10)}%`}
                              bgcolor="primary.main"
                              height={10}
                              borderRadius={5}
                            />
                          </Box>
                          <Typography variant="body2">{path.rate}% Conversion</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default CrossDeviceJourney;
