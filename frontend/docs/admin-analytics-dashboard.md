# Admin Analytics Dashboard Documentation

## Overview

The Admin Analytics Dashboard provides a comprehensive view of marketplace performance metrics, user behavior, and personalization effectiveness. This documentation covers the implementation details, components, and data flow for the admin analytics section.

## Key Features

- **Dashboard Overview**: Summary of key metrics including sessions, interactions, conversion rates
- **Personalization Impact**: Visualization of how personalization affects click-through and conversion rates
- **User Behavior Analysis**: Heatmaps, scroll patterns, and interaction tracking
- **Performance Metrics**: API, client, and query performance monitoring

## Implementation Details

### Mock Data Implementation

The dashboard uses mock data for local development to ensure consistent rendering regardless of backend availability. This approach:

- Prevents "Failed to fetch" errors during development
- Provides realistic data visualization without requiring backend services
- Simulates loading states for UI testing

To switch to real API data, modify the `useEffect` hooks in each dashboard component to use actual API endpoints instead of the mock data generators.

### Grid System

The dashboard uses custom Grid wrapper components to ensure compatibility with Material UI v5:

- `GridContainer`: Wrapper for MUI Grid container component
- `GridItem`: Wrapper for MUI Grid item component

These wrappers handle the breaking changes in MUI v5's Grid implementation, particularly around the `container` and `item` props.

### Performance Metrics Collection

The dashboard integrates with the `web-vitals` library to collect core web vitals:

- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Largest Contentful Paint (LCP)
- First Contentful Paint (FCP)
- Time to First Byte (TTFB)

### User Behavior Analytics

The dashboard collects and visualizes user behavior data including:

- Scroll depth and patterns
- Click and interaction heatmaps
- Form interactions
- Text selections

## Navigation

The Admin Dashboard is accessible via:

1. The user profile dropdown in the main site header
2. Direct URL navigation to `/admin/analytics`

## Components Structure

- `pages/admin/analytics/index.tsx`: Main dashboard overview
- `pages/admin/analytics/performance-metrics.tsx`: Detailed performance metrics
- `pages/admin/analytics/user-behavior.tsx`: User behavior analysis
- `components/analytics/`: Reusable analytics components
  - `GridContainer.tsx` & `GridItem.tsx`: MUI v5 Grid wrappers
  - `HeatmapAnalyticsTab.tsx`: Heatmap visualization
  - `ScrollAnalyticsTab.tsx`: Scroll pattern analysis
  - `ConversionFunnelTab.tsx`: Conversion funnel visualization

## Future Improvements

1. **Real Data Integration**: Replace mock data with actual API endpoints
2. **Additional Metrics**: Add revenue metrics, product performance, and user segmentation
3. **Interactive Filters**: Add date range pickers and more filtering options
4. **Export Functionality**: Allow exporting analytics data to CSV/PDF
5. **Real-time Updates**: Implement WebSocket for real-time analytics updates

## Troubleshooting

If you encounter issues with the analytics dashboard:

1. Check browser console for errors
2. Verify that all required dependencies are installed
3. For type errors, ensure proper typing of components and data structures
4. For layout issues, check the Grid component implementations
