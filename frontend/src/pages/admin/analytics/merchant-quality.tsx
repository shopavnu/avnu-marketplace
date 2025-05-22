import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { GridContainer, GridItem } from '../../../components/ui/Grid';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNav from '../../../components/admin/AnalyticsNav';
// Properly import MetricCard component
import MetricCard from '../../../components/admin/MetricCard';
// Import Recharts components
import { 
  BarChartComponent, 
  PieChartComponent, 
  LineChartComponent,
  CompositeChartComponent
} from '../../../components/charts';

/**
 * Merchant Quality Dashboard
 * Tracks quality metrics for merchant stores and product listings
 */
const MerchantQuality: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Mock data - to be replaced with API call
  const mockData = {
    avgDataCompleteness: 87.3,
    avgImageQuality: 76.8,
    avgDescriptionQuality: 82.1,
    qualityDistribution: {
      excellent: 32,
      good: 45,
      needsImprovement: 18,
      poor: 5
    },
    merchantScores: [
      { name: "Eco Apparel Co.", completeness: 96.2, imageQuality: 92.5, descriptionQuality: 94.8, overallScore: 94.6 },
      { name: "Green Living", completeness: 89.7, imageQuality: 88.3, descriptionQuality: 91.2, overallScore: 89.8 },
      { name: "Sustainable Beauty", completeness: 87.4, imageQuality: 79.8, descriptionQuality: 85.6, overallScore: 84.2 },
      { name: "Planet Friendly Foods", completeness: 82.1, imageQuality: 76.3, descriptionQuality: 84.7, overallScore: 81.5 },
      { name: "Ethical Wares", completeness: 74.9, imageQuality: 68.7, descriptionQuality: 71.2, overallScore: 71.6 }
    ]
  };

  // Helper function to get quality label and color
  const getQualityInfo = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'success' };
    if (score >= 80) return { label: 'Good', color: 'primary' };
    if (score >= 70) return { label: 'Average', color: 'warning' };
    return { label: 'Needs Improvement', color: 'error' };
  };
  
  return (
    <AdminLayout title="Merchant Quality Metrics">
      <AnalyticsNav />
      
      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Merchant Quality Metrics
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track and improve the quality of merchant product listings
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
            <GridContainer spacing={3} className="mb-6">
              <GridItem xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Data Completeness" 
                  value={`${mockData.avgDataCompleteness}%`}
                  icon="check_circle"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Image Quality Score" 
                  value={`${mockData.avgImageQuality}%`}
                  icon="image"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={4}>
                <MetricCard 
                  title="Description Quality" 
                  value={`${mockData.avgDescriptionQuality}%`}
                  icon="description"
                />
              </GridItem>
            </GridContainer>

            <GridContainer spacing={3}>
              <GridItem xs={12} md={5}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Quality Score Distribution
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Breakdown of merchants by quality tier
                  </Typography>
                  <Box height={300}>
                    <PieChartComponent
                      data={[
                        { name: "Excellent", value: mockData.qualityDistribution.excellent },
                        { name: "Good", value: mockData.qualityDistribution.good },
                        { name: "Needs Improvement", value: mockData.qualityDistribution.needsImprovement },
                        { name: "Poor", value: mockData.qualityDistribution.poor }
                      ]}
                      nameKey="name"
                      valueKey="value"
                      height={280}
                      tooltipFormatter={(value: number) => `${value}%`}
                      colors={['#4caf50', '#8bc34a', '#ffeb3b', '#f44336']}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={7}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Quality Score Impact on Conversion
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Correlation between quality metrics and purchase conversion
                  </Typography>
                  <Box height={300}>
                    <LineChartComponent
                      data={mockData.merchantScores.map(item => ({
                        name: item.name,
                        quality: item.overallScore,
                        conversion: item.overallScore * (Math.random() * 0.5 + 0.5) // Simulated conversion rate
                      }))}
                      xKey="quality"
                      yKey="conversion"
                      height={280}
                      xAxisLabel="Quality Score"
                      yAxisLabel="Conversion Rate (%)"
                      tooltipFormatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Merchant Quality Scores
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Merchant Name</TableCell>
                          <TableCell align="right">Data Completeness</TableCell>
                          <TableCell align="right">Image Quality</TableCell>
                          <TableCell align="right">Description Quality</TableCell>
                          <TableCell align="right">Overall Score</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.merchantScores.map((merchant) => {
                          const qualityInfo = getQualityInfo(merchant.overallScore);
                          return (
                            <TableRow key={merchant.name}>
                              <TableCell component="th" scope="row">
                                {merchant.name}
                              </TableCell>
                              <TableCell align="right">{merchant.completeness}%</TableCell>
                              <TableCell align="right">{merchant.imageQuality}%</TableCell>
                              <TableCell align="right">{merchant.descriptionQuality}%</TableCell>
                              <TableCell align="right">{merchant.overallScore}%</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={qualityInfo.label} 
                                  color={qualityInfo.color as any} 
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
              </GridItem>
            </GridContainer>
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default MerchantQuality;
