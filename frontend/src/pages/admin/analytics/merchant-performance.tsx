import React from "react";
// Removed MUI icon imports to fix deployment issues
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
import { Box, Typography, Alert } from "@mui/material";
import { Grid, GridContainer, GridItem } from "../../../components/ui/Grid";

/**
 * Merchant Performance Dashboard
 * Tracks and analyzes merchant performance metrics
 */
const MerchantPerformanceDashboard: React.FC = () => {
  return (
    <AdminLayout title="Merchant Performance">
      <AnalyticsNav />

      <Box className="p-6">
        <Alert severity="info" sx={{ mb: 4 }}>
          This dashboard is currently under development. Check back soon for
          merchant performance metrics.
        </Alert>

        <Typography variant="h5" gutterBottom>
          Merchant Performance Dashboard
        </Typography>
        <Typography variant="body1">
          This page will track merchant performance metrics, including sales
          volumes, return rates, customer satisfaction, and fulfillment times.
        </Typography>
      </Box>
    </AdminLayout>
  );
};

export default MerchantPerformanceDashboard;
