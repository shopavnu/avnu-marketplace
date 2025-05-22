import React, { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
import { Box, Typography, Alert } from "@mui/material";
import { Grid, GridContainer, GridItem } from "../../../components/ui/Grid";
import MetricCard from "../../../components/admin/MetricCard";
import { BarChartComponent } from "../../../components/charts";

/**
 * Cohort Analysis Dashboard
 * Tracks customer cohorts and their behavior over time
 */
const CohortAnalysisDashboard: React.FC = () => {
  return (
    <AdminLayout title="Cohort Analysis">
      <AnalyticsNav />

      <Box className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Cohort Analysis
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track customer cohorts and analyze their behavior over time
        </Typography>

        <GridContainer spacing={3} className="mb-6">
          <GridItem xs={12} sm={6} md={4}>
            <MetricCard title="Active Cohorts" value={"8"} />
          </GridItem>
          <GridItem xs={12} sm={6} md={4}>
            <MetricCard title="Avg. Retention Rate" value={"68%"} />
          </GridItem>
          <GridItem xs={12} sm={6} md={4}>
            <MetricCard title="Avg. Lifetime Value" value={"$457"} />
          </GridItem>
        </GridContainer>

        <Alert severity="info" sx={{ mb: 4 }}>
          Full cohort analysis features will be available in the next release.
        </Alert>
      </Box>
    </AdminLayout>
  );
};

export default CohortAnalysisDashboard;
