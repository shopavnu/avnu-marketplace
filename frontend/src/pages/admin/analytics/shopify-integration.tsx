import React, { useState } from "react";
// Removed MUI icon imports to fix deployment issues
import AdminLayout from "../../../components/admin/AdminLayout";
import AnalyticsNav from "../../../components/admin/AnalyticsNav";
import { Box, Typography, Alert } from "@mui/material";
import { Grid, GridContainer, GridItem } from "../../../components/ui/Grid";

/**
 * Shopify Integration Analytics Dashboard
 * Displays metrics related to Shopify store integrations
 */
const ShopifyIntegrationDashboard: React.FC = () => {
  return (
    <AdminLayout title="Shopify Integration Analytics">
      <AnalyticsNav />

      <Box className="p-6">
        <Alert severity="info" sx={{ mb: 4 }}>
          This dashboard is currently under development. Check back soon for
          Shopify integration analytics.
        </Alert>

        <Typography variant="h5" gutterBottom>
          Shopify Integration Dashboard
        </Typography>
        <Typography variant="body1">
          This page will track metrics related to Shopify store integrations,
          sync performance, and cross-platform analytics.
        </Typography>
      </Box>
    </AdminLayout>
  );
};

export default ShopifyIntegrationDashboard;
