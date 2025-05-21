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
 * Supply-Demand Balance Dashboard
 * Tracks the balance between inventory supply and shopper demand across the marketplace
 */
const SupplyDemandBalance: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Mock data - to be replaced with API call
  const mockData = {
    totalProducts: 24578,
    totalCategories: 87,
    categoryCoverage: 92.8,
    emptySearchRate: 3.6,
    categoryGaps: [
      { category: "Sustainable Electronics", searchVolume: 1245, productCount: 32, status: "Significant Gap" },
      { category: "Eco-friendly Pet Supplies", searchVolume: 876, productCount: 54, status: "Moderate Gap" },
      { category: "Sustainable Office Supplies", searchVolume: 745, productCount: 87, status: "Minor Gap" },
      { category: "Zero Waste Kitchen", searchVolume: 642, productCount: 142, status: "Balanced" },
      { category: "Eco Beauty", searchVolume: 467, productCount: 324, status: "Oversupplied" }
    ],
    searchDemandMap: {
      mostSearched: [
        { term: "sustainable clothing", count: 4567 },
        { term: "eco-friendly kitchen", count: 3421 },
        { term: "organic skincare", count: 2987 }
      ],
      leastInventory: [
        { term: "biodegradable electronics", count: 1876 },
        { term: "sustainable furniture", count: 1543 },
        { term: "eco-friendly toys", count: 1245 }
      ]
    }
  };

  // Helper function to get gap status color
  const getGapStatusColor = (status: string) => {
    switch(status) {
      case "Significant Gap": return "error";
      case "Moderate Gap": return "warning";
      case "Minor Gap": return "info";
      case "Balanced": return "success";
      case "Oversupplied": return "secondary";
      default: return "default";
    }
  };
  
  return (
    <AdminLayout title="Supply-Demand Balance">
      <AnalyticsNav />
      
      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Supply-Demand Balance
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Monitor the balance between product availability and shopper demand
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
                  title="Total Products" 
                  value={mockData.totalProducts.toLocaleString()}
                  icon="inventory_2"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Total Categories" 
                  value={mockData.totalCategories.toString()}
                  icon="category"
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Category Coverage" 
                  value={`${mockData.categoryCoverage}%`}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <MetricCard 
                  title="Empty Search Rate" 
                  value={`${mockData.emptySearchRate}%`}
                  trend={-0.4}
                />
              </GridItem>
            </GridContainer>

            <GridContainer spacing={3}>
              <GridItem xs={12} md={7}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Product-to-Search Volume Ratio by Category
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Comparing supply (products) to demand (search volume) by category
                  </Typography>
                  <Box height={350}>
                    <BarChartComponent
                      data={mockData.categoryGaps.map(item => ({
                        category: item.category,
                        ratio: item.searchVolume / (item.productCount || 1)
                      }))}
                      xKey="category"
                      yKey="ratio"
                      height={320}
                      barSize={40}
                      xAxisLabel="Category"
                      yAxisLabel="Search/Product Ratio"
                      tooltipFormatter={(value: number) => `${value.toFixed(1)} searches per product`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12} md={5}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Top Search Terms with No Results
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Most frequent searches yielding zero results
                  </Typography>
                  <Box height={350}>
                    <BarChartComponent
                      data={mockData.searchDemandMap.leastInventory.map(item => ({
                        name: item.term,
                        value: item.count
                      }))}
                      xKey="name"
                      yKey="value"
                      height={320}
                      barSize={40}
                      xAxisLabel="Search Term"
                      yAxisLabel="Search Count"
                      tooltipFormatter={(value: number) => `${value.toLocaleString()} searches`}
                    />
                  </Box>
                </Paper>
              </GridItem>
              <GridItem xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Category Supply-Demand Gaps
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Monthly Search Volume</TableCell>
                          <TableCell align="right">Product Count</TableCell>
                          <TableCell align="right">Supply/Demand Ratio</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.categoryGaps.map((category) => {
                          const ratio = (category.productCount / category.searchVolume * 100).toFixed(1);
                          return (
                            <TableRow key={category.category}>
                              <TableCell component="th" scope="row">
                                {category.category}
                              </TableCell>
                              <TableCell align="right">{category.searchVolume.toLocaleString()}</TableCell>
                              <TableCell align="right">{category.productCount}</TableCell>
                              <TableCell align="right">{ratio}%</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={category.status} 
                                  color={getGapStatusColor(category.status) as any} 
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

export default SupplyDemandBalance;
