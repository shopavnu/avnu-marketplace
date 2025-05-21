import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNav from '../../../components/admin/AnalyticsNav';
import { Grid, GridContainer, GridItem } from '../../../components/ui/Grid';
import MetricCard from '../../../components/admin/MetricCard';
import { BarChartComponent, PieChartComponent, LineChartComponent, CompositeChartComponent } from '../../../components/charts';

/**
 * Revenue Analytics Dashboard
 * Tracks commissions, fees, and financial performance across the marketplace
 */
const RevenueAnalytics: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Mock data - to be replaced with API call
  const mockData = {
    totalRevenue: 524750,
    commissionRevenue: 431250,
    feeRevenue: 93500,
    avgTransactionValue: 78.50,
    revenueGrowth: 14.7,
    paymentMethods: [
      { method: "Credit Card", transactions: 8754, value: 328750, conversionRate: 4.8 },
      { method: "PayPal", transactions: 3421, value: 124300, conversionRate: 4.2 },
      { method: "Apple Pay", transactions: 1876, value: 42980, conversionRate: 5.1 },
      { method: "Google Pay", transactions: 1245, value: 28720, conversionRate: 4.7 }
    ],
    feeStructure: [
      { type: "Commission", percentage: 82.2, value: 431250 },
      { type: "Listing Fee", percentage: 8.4, value: 44050 },
      { type: "Premium Placement", percentage: 5.8, value: 30450 },
      { type: "Other Fees", percentage: 3.6, value: 19000 }
    ],
    categoryRevenue: [
      { category: "Clothing & Apparel", revenue: 187500, growth: 16.8 },
      { category: "Home & Living", revenue: 142300, growth: 12.4 },
      { category: "Beauty & Personal Care", revenue: 87450, growth: 18.7 },
      { category: "Food & Beverages", revenue: 65200, growth: 10.2 },
      { category: "Accessories", revenue: 42300, growth: 8.7 }
    ]
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <AdminLayout title="Revenue Analytics">
      <AnalyticsNav />
      
      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Revenue Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track marketplace revenue, commissions, and payment performance
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
                  title="Total Monthly Revenue" 
                  value={formatCurrency(mockData.totalRevenue)}
                  icon="attach_money"
                  trend={mockData.revenueGrowth}
                  trendLabel="vs. last month"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Commission Revenue" 
                  value={formatCurrency(mockData.commissionRevenue)}
                  icon="percent"
                  subtitle={`${Math.round((mockData.commissionRevenue / mockData.totalRevenue) * 100)}% of total`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Fees Revenue" 
                  value={formatCurrency(mockData.feeRevenue)}
                  icon="receipt_long"
                  subtitle={`${Math.round((mockData.feeRevenue / mockData.totalRevenue) * 100)}% of total`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Avg. Transaction Value" 
                  value={`$${mockData.avgTransactionValue}`}
                  icon="shopping_cart"
                  trend={2.4}
                  trendLabel="vs. last month"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Revenue Trends
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Monthly revenue by type over the past 12 months
                  </Typography>
                  <Box height={300}>
                    <CompositeChartComponent
                      data={[
                        { month: 'Jan', commission: 35250, fees: 7800 },
                        { month: 'Feb', commission: 33800, fees: 7400 },
                        { month: 'Mar', commission: 36500, fees: 8100 },
                        { month: 'Apr', commission: 38200, fees: 8400 },
                        { month: 'May', commission: 40100, fees: 8800 },
                        { month: 'Jun', commission: 42500, fees: 9200 },
                        { month: 'Jul', commission: 43800, fees: 9500 },
                        { month: 'Aug', commission: 44300, fees: 9600 },
                        { month: 'Sep', commission: 42900, fees: 9300 },
                        { month: 'Oct', commission: 45800, fees: 9900 },
                        { month: 'Nov', commission: 48200, fees: 10400 },
                        { month: 'Dec', commission: 52100, fees: 11700 }
                      ]}
                      xKey="month"
                      metrics={[
                        { key: 'commission', type: 'line', name: 'Commission Revenue' },
                        { key: 'fees', type: 'line', name: 'Fee Revenue' }
                      ]}
                      height={270}
                      xAxisLabel="Month"
                      yAxisLabel="Revenue ($)"
                      tooltipFormatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Revenue Breakdown
                  </Typography>
                  <Box height={300}>
                    <PieChartComponent
                      data={mockData.feeStructure.map(fee => (
                        { name: fee.type, value: fee.percentage }
                      ))}
                      nameKey="name"
                      valueKey="value"
                      height={270}
                      donut={true}
                      tooltipFormatter={(value: number) => `${value}%`}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Category Revenue
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Growth</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.categoryRevenue.map((category) => (
                          <TableRow key={category.category}>
                            <TableCell component="th" scope="row">
                              {category.category}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                            <TableCell 
                              align="right"
                              sx={{
                                color: category.growth > 0 ? 'success.main' : 
                                       category.growth < 0 ? 'error.main' : 'inherit'
                              }}
                            >
                              {category.growth > 0 ? '+' : ''}
                              {category.growth}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Payment Methods
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Method</TableCell>
                          <TableCell align="right">Transactions</TableCell>
                          <TableCell align="right">Value</TableCell>
                          <TableCell align="right">Conversion</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.paymentMethods.map((method) => (
                          <TableRow key={method.method}>
                            <TableCell component="th" scope="row">
                              {method.method}
                            </TableCell>
                            <TableCell align="right">{method.transactions.toLocaleString()}</TableCell>
                            <TableCell align="right">{formatCurrency(method.value)}</TableCell>
                            <TableCell align="right">{method.conversionRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Fee Structure Optimization
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Model of potential revenue based on different fee structures
                  </Typography>
                  <Box height={350}>
                    <BarChartComponent
                      data={[
                        { feeType: 'Current Structure', revenue: 524750 },
                        { feeType: 'Lower Commission', revenue: 492300 },
                        { feeType: 'Higher Fees', revenue: 540800 },
                        { feeType: 'Volume Optimized', revenue: 568200 },
                        { feeType: 'Merchant Friendly', revenue: 480500 }
                      ]}
                      xKey="feeType"
                      yKey="revenue"
                      height={320}
                      barSize={60}
                      xAxisLabel="Fee Structure Model"
                      yAxisLabel="Projected Revenue ($)"
                      tooltipFormatter={(value: number) => `$${value.toLocaleString()}`}
                    />
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

export default RevenueAnalytics;
