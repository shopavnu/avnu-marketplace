import React from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';

/**
 * Navigation component for analytics pages
 */
const AnalyticsNavigation: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  // Define analytics navigation items
  const navItems = [
    { label: 'Dashboard', path: '/admin/analytics' },
    { label: 'Performance', path: '/admin/analytics/performance-metrics' },
    { label: 'User Behavior', path: '/admin/analytics/user-behavior' },
    { label: 'Revenue', path: '/admin/analytics/revenue-analytics' },
    { label: 'Search', path: '/admin/analytics/search-analytics' },
    { label: 'Merchant', path: '/admin/analytics/merchant-performance' },
  ];

  // Find the current tab index based on the path
  const currentTabIndex = navItems.findIndex(item => 
    currentPath === item.path || 
    (item.path !== '/admin/analytics' && currentPath.startsWith(item.path))
  );

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Paper elevation={0}>
        <Tabs 
          value={currentTabIndex !== -1 ? currentTabIndex : 0}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {navItems.map((item, index) => (
            <Tab
              key={index}
              label={item.label}
              component={Link}
              href={item.path}
            />
          ))}
        </Tabs>
      </Paper>
    </Box>
  );
};

export default AnalyticsNavigation;
