import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import { Grid, GridContainer, GridItem } from "../../../components/ui/Grid";
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
import MetricCard from "../../../components/admin/MetricCard";
// Import Recharts components
import {
  BarChartComponent,
  PieChartComponent,
  LineChartComponent,
  CompositeChartComponent,
} from "../../../components/charts";

/**
 * Personalization Impact Dashboard
 * Measures the effectiveness and business impact of personalization features
 */
const PersonalizationImpact: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Mock data - to be replaced with API call
  const mockData = {
    clickThroughImprovement: 31.4,
    conversionImprovement: 36.8,
    averageOrderIncrease: 28.2,
    timeOnSiteIncrease: 42.6,
    experimentGroups: [
      { name: "Control Group", conversionRate: 3.2, orderValue: 67.5 },
      { name: "Personalized Group", conversionRate: 4.4, orderValue: 86.5 },
    ],
    abtestResults: [
      {
        test: "Product Recommendations Algorithm",
        uplift: 27.4,
        confidence: 98.2,
      },
      { test: "Personalized Search Results", uplift: 36.8, confidence: 99.5 },
      { test: "Category Personalization", uplift: 18.6, confidence: 95.3 },
      { test: "Home Page Layout", uplift: 22.3, confidence: 97.8 },
      { test: "Email Content Personalization", uplift: 31.5, confidence: 98.9 },
    ],
    userSegments: [
      {
        segment: "New Visitors",
        impactScore: 82,
        description: "First-time visitors to the marketplace",
      },
      {
        segment: "Repeat Browsers",
        impactScore: 94,
        description: "Users who browse regularly but purchase rarely",
      },
      {
        segment: "Regular Shoppers",
        impactScore: 87,
        description: "Users who purchase at least monthly",
      },
      {
        segment: "Value Seekers",
        impactScore: 91,
        description: "Price-sensitive shoppers",
      },
      {
        segment: "Eco-Focused",
        impactScore: 96,
        description: "Shoppers focused on sustainability",
      },
    ],
  };

  // Helper function to get color based on impact score
  const getImpactColor = (score: number) => {
    if (score >= 90) return "success.main";
    if (score >= 80) return "primary.main";
    if (score >= 70) return "warning.main";
    return "error.main";
  };

  return (
    <AdminLayout title="Personalization Impact Analytics">
      <AnalyticsNav />

      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Personalization Impact
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Measure the effectiveness and business impact of personalization
          features
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
                  title="Click-Through Improvement"
                  value={`+${mockData.clickThroughImprovement}%`}
                  icon="touch_app"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Conversion Improvement"
                  value={`+${mockData.conversionImprovement}%`}
                  icon="shopping_cart"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Avg. Order Increase"
                  value={`+${mockData.averageOrderIncrease}%`}
                  icon="trending_up"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Time on Site Increase"
                  value={`+${mockData.timeOnSiteIncrease}%`}
                  icon="schedule"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Personalization Test Results
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Impact of personalization features on conversion rate
                  </Typography>
                  <Box height={350}>
                    <BarChartComponent
                      data={mockData.abtestResults}
                      xKey="test"
                      yKey="uplift"
                      height={320}
                      barSize={40}
                      xAxisLabel="Feature"
                      yAxisLabel="Uplift (%)"
                      tooltipFormatter={(value: number) =>
                        `${value.toFixed(1)}% improvement`
                      }
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Control vs. Personalized Groups
                  </Typography>
                  <Box className="mt-6">
                    <Typography variant="subtitle2" gutterBottom>
                      Conversion Rate Comparison
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Control
                        </Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            mockData.experimentGroups[0].conversionRate * 10
                          }
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" align="right">
                          {mockData.experimentGroups[0].conversionRate}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Personalized
                        </Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            mockData.experimentGroups[1].conversionRate * 10
                          }
                          color="success"
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" align="right">
                          {mockData.experimentGroups[1].conversionRate}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 4 }}>
                      Average Order Value
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Control
                        </Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (mockData.experimentGroups[0].orderValue / 100) *
                            100
                          }
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" align="right">
                          ${mockData.experimentGroups[0].orderValue}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Personalized
                        </Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (mockData.experimentGroups[1].orderValue / 100) *
                            100
                          }
                          color="success"
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" align="right">
                          ${mockData.experimentGroups[1].orderValue}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    A/B Test Results
                  </Typography>
                  <Grid container spacing={2} className="mt-2">
                    {mockData.abtestResults.map((test, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper
                          elevation={0}
                          className="p-3"
                          sx={{
                            bgcolor: "background.default",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            {test.test}
                          </Typography>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Typography variant="body2" color="textSecondary">
                              Uplift
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              +{test.uplift}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                              Statistical Confidence
                            </Typography>
                            <Typography variant="body2">
                              {test.confidence}%
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className="p-4">
                  <Typography variant="h6" gutterBottom>
                    Personalization Impact by User Segment
                  </Typography>
                  <Grid container spacing={2} className="mt-2">
                    {mockData.userSegments.map((segment, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper
                          className="p-3"
                          elevation={0}
                          sx={{
                            bgcolor: "background.default",
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Typography variant="subtitle2">
                              {segment.segment}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: getImpactColor(segment.impactScore),
                              }}
                            >
                              {segment.impactScore}/100
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {segment.description}
                          </Typography>
                          <Box mt={2}>
                            <LinearProgress
                              variant="determinate"
                              value={segment.impactScore}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: "grey.200",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: getImpactColor(segment.impactScore),
                                },
                              }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default PersonalizationImpact;
