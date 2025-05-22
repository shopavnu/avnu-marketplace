import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
// Import custom Grid wrapper to fix TypeScript errors
import { Grid, GridContainer, GridItem } from "../../../components/ui/Grid";
// Properly import MetricCard component
import MetricCard from "../../../components/admin/MetricCard";
// Import Recharts components instead of MockChart
import {
  BarChartComponent,
  PieChartComponent,
  LineChartComponent,
} from "../../../components/charts";

/**
 * Product Catalog Analytics Dashboard
 * Monitors product performance, turnover rates, and catalog health
 */
const CatalogAnalytics: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState(0);
  const [timeRange, setTimeRange] = React.useState("30");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock data - to be replaced with API call
  const mockData = {
    totalProducts: 24578,
    newProducts30Days: 1287,
    avgInventoryTurnover: 3.8,
    viewsToInventoryRatio: 8.4,
    productDiscovery: {
      newProductViewRate: 27.4, // % of views going to new products
      discoveryPathways: [
        { source: "Search", percentage: 34 },
        { source: "Category Navigation", percentage: 28 },
        { source: "Recommendations", percentage: 21 },
        { source: "Homepage Features", percentage: 12 },
        { source: "External Links", percentage: 5 },
      ],
      newProductPerformance: {
        viewToCartRate: 12.6,
        conversionRate: 3.8,
        repeatViewRate: 22.4,
      },
    },
    unavailableProducts: {
      unavailableViewsRate: 4.2, // % of views to out-of-stock items
      topUnavailableProducts: [
        {
          name: "Sustainable Bamboo Water Bottle",
          category: "Home Goods",
          views: 2876,
          interestScore: 87,
          restockEstimate: "3 days",
        },
        {
          name: "Recycled Denim Tote Bag",
          category: "Accessories",
          views: 2345,
          interestScore: 82,
          restockEstimate: "1 week",
        },
        {
          name: "Organic Wool Sweater",
          category: "Clothing",
          views: 1987,
          interestScore: 79,
          restockEstimate: "2 days",
        },
        {
          name: "Solar-Powered Phone Charger",
          category: "Electronics",
          views: 1754,
          interestScore: 91,
          restockEstimate: "Out of season",
        },
        {
          name: "Biodegradable Yoga Mat",
          category: "Fitness",
          views: 1633,
          interestScore: 85,
          restockEstimate: "5 days",
        },
      ],
      waitlistSignups: 1842,
      estimatedRevenueLoss: 76850,
    },
    topCategories: [
      {
        name: "Sustainable Clothing",
        productCount: 4827,
        viewCount: 23450,
        turnoverRate: 4.2,
        restockVelocity: 3.2,
        outOfStockRate: 2.8,
      },
      {
        name: "Eco Home Goods",
        productCount: 3654,
        viewCount: 18760,
        turnoverRate: 3.7,
        restockVelocity: 4.5,
        outOfStockRate: 3.2,
      },
      {
        name: "Natural Beauty",
        productCount: 2987,
        viewCount: 15670,
        turnoverRate: 4.1,
        restockVelocity: 2.8,
        outOfStockRate: 1.9,
      },
      {
        name: "Organic Food",
        productCount: 2543,
        viewCount: 12450,
        turnoverRate: 5.3,
        restockVelocity: 1.5,
        outOfStockRate: 4.1,
      },
      {
        name: "Zero Waste",
        productCount: 1876,
        viewCount: 9870,
        turnoverRate: 3.9,
        restockVelocity: 3.8,
        outOfStockRate: 2.3,
      },
    ],
    productPerformance: [
      {
        name: "Organic Cotton T-Shirt",
        category: "Clothing",
        views: 2547,
        conversionRate: 5.8,
        status: "High Performer",
        daysToSell: 12,
      },
      {
        name: "Bamboo Cutlery Set",
        category: "Home Goods",
        views: 2345,
        conversionRate: 4.7,
        status: "High Performer",
        daysToSell: 18,
      },
      {
        name: "Natural Face Serum",
        category: "Beauty",
        views: 1872,
        conversionRate: 2.9,
        status: "Average",
        daysToSell: 24,
      },
      {
        name: "Recycled Paper Notebook",
        category: "Stationery",
        views: 1654,
        conversionRate: 3.2,
        status: "Average",
        daysToSell: 21,
      },
      {
        name: "Organic Snack Box",
        category: "Food",
        views: 1543,
        conversionRate: 6.2,
        status: "High Performer",
        daysToSell: 9,
      },
    ],
    inventoryTurnover: [
      {
        category: "Organic Food",
        turnoverRate: 5.3,
        restockFrequency: "Weekly",
        avgDaysToSell: 8,
      },
      {
        category: "Sustainable Clothing",
        turnoverRate: 4.2,
        restockFrequency: "Bi-weekly",
        avgDaysToSell: 16,
      },
      {
        category: "Natural Beauty",
        turnoverRate: 4.1,
        restockFrequency: "Bi-weekly",
        avgDaysToSell: 14,
      },
      {
        category: "Zero Waste",
        turnoverRate: 3.9,
        restockFrequency: "Bi-weekly",
        avgDaysToSell: 18,
      },
      {
        category: "Eco Home Goods",
        turnoverRate: 3.7,
        restockFrequency: "Monthly",
        avgDaysToSell: 22,
      },
      {
        category: "Sustainable Stationery",
        turnoverRate: 3.2,
        restockFrequency: "Monthly",
        avgDaysToSell: 25,
      },
      {
        category: "Eco Accessories",
        turnoverRate: 3.0,
        restockFrequency: "Monthly",
        avgDaysToSell: 28,
      },
    ],
  };

  // Helper function for product status label and color
  const getProductStatusInfo = (status: string) => {
    switch (status) {
      case "High Performer":
        return { color: "success" };
      case "Average":
        return { color: "primary" };
      case "Low Performer":
        return { color: "error" };
      default:
        return { color: "default" };
    }
  };

  return (
    <AdminLayout title="Product Catalog Analytics">
      <AnalyticsNav />

      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Product Catalog Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Monitor product performance, turnover rates, and catalog health
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
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 4 }}
            >
              <Tab label="Catalog Overview" />
              <Tab label="Inventory Turnover" />
              <Tab label="Product Discovery" />
              <Tab label="Unavailable Products" />
            </Tabs>

            {activeTab === 0 && (
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
                      title="New Products (30d)"
                      value={mockData.newProducts30Days.toLocaleString()}
                      icon="add_circle"
                      subtitle={`${((mockData.newProducts30Days / mockData.totalProducts) * 100).toFixed(1)}% growth`}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Avg. Inventory Turnover"
                      value={mockData.avgInventoryTurnover.toString()}
                      icon="sync"
                      subtitle="Times per year"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Views to Inventory Ratio"
                      value={mockData.viewsToInventoryRatio.toString()}
                      icon="visibility"
                      subtitle="views per product"
                    />
                  </GridItem>
                </GridContainer>

                <GridContainer spacing={3}>
                  <GridItem xs={12} md={6}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Inventory Turnover by Category
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        Number of times inventory is sold and replaced in a year
                      </Typography>
                      <Box height={300}>
                        <BarChartComponent
                          data={[
                            { category: "Electronics", rate: 4.8 },
                            { category: "Fashion", rate: 7.2 },
                            { category: "Home Goods", rate: 3.6 },
                            { category: "Beauty", rate: 5.3 },
                            { category: "Sports", rate: 2.9 },
                            { category: "Toys", rate: 4.1 },
                          ]}
                          xKey="category"
                          yKey="rate"
                          height={270}
                          barSize={40}
                          xAxisLabel="Product Category"
                          yAxisLabel="Turnover Rate"
                          tooltipFormatter={(value: number) =>
                            `${value.toFixed(1)} times/year`
                          }
                        />
                      </Box>
                    </Paper>
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Views to Conversion Ratio
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        Product view to purchase conversion rate
                      </Typography>
                      <Box height={300}>
                        <BarChartComponent
                          data={[
                            { category: "Electronics", rate: 3.2 },
                            { category: "Fashion", rate: 4.1 },
                            { category: "Home Goods", rate: 2.7 },
                            { category: "Beauty", rate: 3.8 },
                            { category: "Sports", rate: 2.3 },
                            { category: "Toys", rate: 3.5 },
                          ]}
                          xKey="category"
                          yKey="rate"
                          height={270}
                          barSize={40}
                          xAxisLabel="Product Category"
                          yAxisLabel="Conversion Rate (%)"
                          tooltipFormatter={(value: number) =>
                            `${value.toFixed(1)}%`
                          }
                        />
                      </Box>
                    </Paper>
                  </GridItem>
                  <GridItem xs={12} md={12}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Top Categories by Inventory Turnover
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Product Count</TableCell>
                              <TableCell align="right">View Count</TableCell>
                              <TableCell align="right">
                                View:Product Ratio
                              </TableCell>
                              <TableCell align="right">Turnover Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockData.topCategories.map((category) => (
                              <TableRow key={category.name}>
                                <TableCell component="th" scope="row">
                                  {category.name}
                                </TableCell>
                                <TableCell align="right">
                                  {category.productCount.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {category.viewCount.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {(
                                    category.viewCount / category.productCount
                                  ).toFixed(1)}
                                </TableCell>
                                <TableCell align="right">
                                  {category.turnoverRate.toFixed(1)}x
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </GridItem>
                  <GridItem xs={12}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Top Product Performance
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Product Name</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Views (30d)</TableCell>
                              <TableCell align="right">
                                Conversion Rate
                              </TableCell>
                              <TableCell align="center">Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockData.productPerformance.map((product) => {
                              const statusInfo = getProductStatusInfo(
                                product.status,
                              );
                              return (
                                <TableRow key={product.name}>
                                  <TableCell component="th" scope="row">
                                    {product.name}
                                  </TableCell>
                                  <TableCell>{product.category}</TableCell>
                                  <TableCell align="right">
                                    {product.views.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    {product.conversionRate}%
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={product.status}
                                      color={statusInfo.color as any}
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

            {activeTab === 1 && (
              <>
                <GridContainer spacing={3} className="mb-6">
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Avg Inventory Turnover"
                      value={mockData.avgInventoryTurnover.toString() + "x"}
                      icon="autorenew"
                      subtitle="Products sold per month"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Fastest Category"
                      value="Organic Food"
                      icon="restaurant"
                      subtitle="5.3x turnover rate"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Avg Days to Sell"
                      value="18"
                      icon="schedule"
                      subtitle="Across all products"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Restock Velocity"
                      value="3.1"
                      icon="local_shipping"
                      subtitle="Days to restock inventory"
                    />
                  </GridItem>
                </GridContainer>

                <GridContainer spacing={3}>
                  <GridItem xs={12} md={7}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Categories by Inventory Turnover
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        Categories ranked by how quickly inventory sells
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Turnover Rate</TableCell>
                              <TableCell align="right">
                                Avg Days to Sell
                              </TableCell>
                              <TableCell align="right">
                                Restock Frequency
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockData.inventoryTurnover.map((category) => (
                              <TableRow key={category.category}>
                                <TableCell component="th" scope="row">
                                  {category.category}
                                </TableCell>
                                <TableCell align="right">
                                  {category.turnoverRate}x
                                </TableCell>
                                <TableCell align="right">
                                  {category.avgDaysToSell}
                                </TableCell>
                                <TableCell align="right">
                                  {category.restockFrequency}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </GridItem>
                  <GridItem xs={12} md={5}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Turnover Rate Comparison
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        How quickly products sell by category
                      </Typography>
                      <Box height={300}>
                        <BarChartComponent
                          data={[
                            {
                              category: "Electronics",
                              current: 4.8,
                              previous: 4.2,
                            },
                            {
                              category: "Fashion",
                              current: 7.2,
                              previous: 6.5,
                            },
                            {
                              category: "Home Goods",
                              current: 3.6,
                              previous: 3.2,
                            },
                            { category: "Beauty", current: 5.3, previous: 4.7 },
                            { category: "Sports", current: 2.9, previous: 2.6 },
                            { category: "Toys", current: 4.1, previous: 3.7 },
                          ]}
                          xKey="category"
                          yKey="current"
                          height={270}
                          barSize={30}
                          xAxisLabel="Product Category"
                          yAxisLabel="Turnover Rate"
                          tooltipFormatter={(value: number) =>
                            `${value.toFixed(1)} times/year`
                          }
                        />
                      </Box>
                    </Paper>
                  </GridItem>
                </GridContainer>
              </>
            )}

            {activeTab === 2 && (
              <>
                <GridContainer spacing={3} className="mb-6">
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="New Product View Rate"
                      value={`${mockData.productDiscovery.newProductViewRate}%`}
                      icon="visibility"
                      subtitle="Of total product views"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Discovery to Cart Rate"
                      value={`${mockData.productDiscovery.newProductPerformance.viewToCartRate}%`}
                      icon="add_shopping_cart"
                      subtitle="For new products"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="New Product Conversion"
                      value={`${mockData.productDiscovery.newProductPerformance.conversionRate}%`}
                      icon="check_circle"
                      subtitle="View to purchase"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Repeat View Rate"
                      value={`${mockData.productDiscovery.newProductPerformance.repeatViewRate}%`}
                      icon="repeat"
                      subtitle="Return to view again"
                    />
                  </GridItem>
                </GridContainer>

                <GridContainer spacing={3}>
                  <GridItem xs={12} md={6}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Product Discovery Sources
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        How shoppers discover new products
                      </Typography>
                      <Box height={300}>
                        <PieChartComponent
                          data={[
                            { name: "Search", value: 42 },
                            { name: "Recommendations", value: 23 },
                            { name: "Categories", value: 15 },
                            { name: "Email", value: 10 },
                            { name: "Social", value: 7 },
                            { name: "Other", value: 3 },
                          ]}
                          nameKey="name"
                          valueKey="value"
                          height={270}
                          donut={true}
                          tooltipFormatter={(value: number) => `${value}%`}
                        />
                      </Box>
                    </Paper>
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        New Product Performance
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        Key metrics for products added in the last 30 days
                      </Typography>
                      <Box height={300}>
                        <LineChartComponent
                          data={[
                            { day: "1", views: 245, orders: 12 },
                            { day: "5", views: 420, orders: 28 },
                            { day: "10", views: 580, orders: 42 },
                            { day: "15", views: 750, orders: 58 },
                            { day: "20", views: 890, orders: 67 },
                            { day: "25", views: 1020, orders: 82 },
                            { day: "30", views: 1180, orders: 94 },
                          ]}
                          xKey="day"
                          yKey="views"
                          height={270}
                          xAxisLabel="Days Since Launch"
                          yAxisLabel="Product Views"
                          tooltipFormatter={(value: number) =>
                            `${value.toLocaleString()}`
                          }
                        />
                      </Box>
                    </Paper>
                  </GridItem>
                </GridContainer>
              </>
            )}

            {activeTab === 3 && (
              <>
                <GridContainer spacing={3} className="mb-6">
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Unavailable Product Views"
                      value={`${mockData.unavailableProducts.unavailableViewsRate}%`}
                      icon="inventory"
                      subtitle="Of total product views"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Waitlist Signups"
                      value={mockData.unavailableProducts.waitlistSignups.toLocaleString()}
                      icon="person_add"
                      subtitle="For out-of-stock items"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Lost Revenue (Est.)"
                      value={`$${mockData.unavailableProducts.estimatedRevenueLoss.toLocaleString()}`}
                      icon="attach_money"
                      subtitle="Due to unavailability"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <MetricCard
                      title="Avg Interest Score"
                      value="85/100"
                      icon="trending_up"
                      subtitle="For unavailable items"
                    />
                  </GridItem>
                </GridContainer>

                <GridContainer spacing={3}>
                  <GridItem xs={12}>
                    <Paper className="p-4">
                      <Typography variant="h6" gutterBottom>
                        Most Viewed Unavailable Products
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        High-demand products currently out of stock
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Views (30d)</TableCell>
                              <TableCell align="right">
                                Interest Score
                              </TableCell>
                              <TableCell align="right">Est. Restock</TableCell>
                              <TableCell align="right">
                                Recommendation
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockData.unavailableProducts.topUnavailableProducts.map(
                              (product) => {
                                const getRecommendation = () => {
                                  if (
                                    product.restockEstimate === "Out of season"
                                  ) {
                                    return {
                                      text: "Alternative Products",
                                      color: "info",
                                    };
                                  }
                                  if (product.interestScore >= 85) {
                                    return {
                                      text: "Expedite Restock",
                                      color: "error",
                                    };
                                  }
                                  return {
                                    text: "Standard Restock",
                                    color: "warning",
                                  };
                                };

                                const recommendation = getRecommendation();

                                return (
                                  <TableRow key={product.name}>
                                    <TableCell component="th" scope="row">
                                      {product.name}
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell align="right">
                                      {product.views.toLocaleString()}
                                    </TableCell>
                                    <TableCell align="right">
                                      {product.interestScore}/100
                                    </TableCell>
                                    <TableCell align="right">
                                      {product.restockEstimate}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip
                                        label={recommendation.text}
                                        color={recommendation.color as any}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              },
                            )}
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

export default CatalogAnalytics;
