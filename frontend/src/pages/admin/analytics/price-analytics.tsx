import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { GridContainer, GridItem } from '../../../components/ui/MuiGrid';
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
 * Price Analytics Dashboard
 * Tracks price competitiveness, elasticity, and optimization opportunities
 */
const PriceAnalytics: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Mock data - to be replaced with API call
  const mockData = {
    avgPriceIndex: 98.2, // 100 is market average - below 100 means more competitive
    elasticCategories: [
      { category: "Beauty & Skincare", elasticity: 2.7 },
      { category: "Eco Apparel", elasticity: 1.8 },
      { category: "Home Goods", elasticity: 1.5 },
    ],
    inelasticCategories: [
      { category: "Sustainable Foods", elasticity: 0.3 },
      { category: "Ethical Jewelry", elasticity: 0.5 },
      { category: "Zero Waste Essentials", elasticity: 0.7 },
    ],
    competitiveAnalysis: [
      { category: "Beauty", avnuPrice: 34.99, directPrice: 39.99, difference: -12.5 },
      { category: "Apparel", avnuPrice: 58.50, directPrice: 54.99, difference: 6.4 },
      { category: "Home Goods", avnuPrice: 45.75, directPrice: 48.99, difference: -6.6 },
      { category: "Accessories", avnuPrice: 29.99, directPrice: 32.50, difference: -7.7 },
      { category: "Food", avnuPrice: 22.49, directPrice: 21.99, difference: 2.3 }
    ],
    priceDistribution: {
      belowMarket: 54,
      atMarket: 31,
      aboveMarket: 15
    }
  };
  
  return (
    <AdminLayout title="Price Analytics">
      <AnalyticsNav />
      
      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Price Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Monitor price competitiveness and identify pricing optimization opportunities
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
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Marketplace Price Index" 
                  value={mockData.avgPriceIndex.toString()}
                  subtitle="vs. Direct-to-Consumer (100)"
                  icon="price_check"
                  trend={-1.8}
                  trendLabel="More competitive"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Below Market Prices" 
                  value={`${mockData.priceDistribution.belowMarket}%`}
                  icon="trending_down"
                  subtitle="of products"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="At Market Prices" 
                  value={`${mockData.priceDistribution.atMarket}%`}
                  icon="drag_handle"
                  subtitle="of products"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Above Market Prices" 
                  value={`${mockData.priceDistribution.aboveMarket}%`}
                  icon="trending_up"
                  subtitle="of products"
                />
              </GridItem>
            </GridContainer>

            <GridContainer spacing={3}>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Price Elasticity by Category
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    How price changes affect purchase volume
                  </Typography>
                  <Box height={300}>
                    <BarChartComponent
                      data={[
                        ...mockData.elasticCategories,
                        ...mockData.inelasticCategories
                      ].sort((a, b) => b.elasticity - a.elasticity)}
                      xKey="category"
                      yKey="elasticity"
                      height={270}
                      barSize={40}
                      xAxisLabel="Category"
                      yAxisLabel="Price Elasticity"
                      tooltipFormatter={(value: number) => `${value.toFixed(1)}`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Price Competitiveness Over Time
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Marketplace vs. Direct-to-Consumer pricing trends
                  </Typography>
                  <Box height={300}>
                    <LineChartComponent
                      data={[
                        { month: 'Jan', marketplace: 98.5, direct: 100 },
                        { month: 'Feb', marketplace: 97.8, direct: 100 },
                        { month: 'Mar', marketplace: 98.2, direct: 100 },
                        { month: 'Apr', marketplace: 97.5, direct: 100 },
                        { month: 'May', marketplace: 96.8, direct: 100 },
                        { month: 'Jun', marketplace: 97.2, direct: 100 },
                        { month: 'Jul', marketplace: 98.8, direct: 100 },
                        { month: 'Aug', marketplace: 99.1, direct: 100 },
                        { month: 'Sep', marketplace: 98.5, direct: 100 },
                        { month: 'Oct', marketplace: 97.9, direct: 100 },
                        { month: 'Nov', marketplace: 97.4, direct: 100 },
                        { month: 'Dec', marketplace: 98.2, direct: 100 }
                      ]}
                      xKey="month"
                      yKey="marketplace"
                      height={270}
                      xAxisLabel="Month"
                      yAxisLabel="Price Index (Direct-to-Consumer = 100)"
                      tooltipFormatter={(value: number) => `${value.toFixed(1)}`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Category Price Competitiveness
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Avg. Avnu Price</TableCell>
                          <TableCell align="right">Avg. Direct-to-Consumer</TableCell>
                          <TableCell align="right">Price Difference</TableCell>
                          <TableCell align="right">Elasticity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.competitiveAnalysis.map((category) => {
                          // Find elasticity for this category
                          const elasticityItem = [...mockData.elasticCategories, ...mockData.inelasticCategories]
                            .find(item => item.category.includes(category.category) || category.category.includes(item.category));
                          
                          return (
                            <TableRow key={category.category}>
                              <TableCell component="th" scope="row">
                                {category.category}
                              </TableCell>
                              <TableCell align="right">${category.avnuPrice}</TableCell>
                              <TableCell align="right">${category.directPrice}</TableCell>
                              <TableCell 
                                align="right"
                                sx={{
                                  color: category.difference < 0 ? 'success.main' : 
                                         category.difference > 0 ? 'error.main' : 'inherit'
                                }}
                              >
                                {category.difference < 0 ? '' : '+'}
                                {category.difference}%
                              </TableCell>
                              <TableCell align="right">{elasticityItem?.elasticity || 'N/A'}</TableCell>
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

export default PriceAnalytics;
