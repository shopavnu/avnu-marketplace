# Avnu Marketplace Admin Analytics

This document outlines the new admin analytics features implemented in the Avnu Marketplace platform, focusing on product suppression metrics and vertical discovery card consistency.

## Features Implemented

### 1. Admin Suppression Analytics Dashboard

A new analytics dashboard has been added to track product suppression rates and resolution times. This helps admin team members monitor and improve product quality across the marketplace.

#### Backend Components:
- `ProductSuppressionAnalyticsService`: Calculates suppression metrics including rates, resolution times, and breakdowns by merchant/category.
- `ProductSuppressionAnalyticsResolver`: GraphQL resolver exposing suppression metrics to the frontend.
- `Category` entity and module: Added to support category-based analytics.

#### Frontend Components:
- `suppression-metrics.tsx`: Main dashboard page displaying suppression analytics.
- `AnalyticsNav.tsx`: Navigation component for all analytics pages.

#### Key Metrics Tracked:
- Overall suppression rate
- Average resolution time
- Suppression trends over time
- Breakdown by merchant and category
- Resolution time distribution

#### Access:
- Available to users with ADMIN role
- Temporarily accessible via the header dropdown menu for testing

### 2. Vertical Discovery Card Consistency

Implemented a new product card component that ensures consistent height and vertical alignment regardless of content length or image dimensions.

#### Components:
- `VerticalConsistentProductCard.tsx`: A new product card component with fixed dimensions for all elements.

#### Key Features:
- Fixed total height (360px)
- Fixed image section height (200px)
- Fixed content sections with proper text truncation
- Consistent vertical alignment of all elements
- Responsive design that maintains consistency

## Technical Implementation Details

### GraphQL Queries

The suppression metrics are exposed via a GraphQL query:

```graphql
query SuppressionMetrics($period: Int, $merchantId: String) {
  suppressionMetrics(period: $period, merchantId: $merchantId) {
    overview {
      totalSuppressedProducts
      totalActiveSuppressedProducts
      totalResolvedSuppressions
      avgResolutionTimeHours
      suppressionRate
    }
    byMerchant {
      merchantId
      merchantName
      suppressedCount
      resolvedCount
      avgResolutionTimeHours
      suppressionRate
    }
    byCategory {
      categoryId
      categoryName
      suppressedCount
      resolvedCount
      avgResolutionTimeHours
      suppressionRate
    }
    byTimeframe {
      date
      suppressedCount
      resolvedCount
      avgResolutionTimeHours
      suppressionRate
    }
    resolutionTimeDistribution {
      timeRange
      count
      percentage
    }
  }
}
```

### Authentication & Authorization

The suppression metrics endpoint is protected with the following guards:
- `JwtAuthGuard`: Ensures the user is authenticated
- `RolesGuard`: Ensures the user has the ADMIN role

### Data Calculation

Suppression metrics are calculated using TypeORM queries with the following logic:
- Suppression rate = (suppressed products / total products) * 100
- Resolution time = average time between suppression and resolution
- Time-based metrics use date-fns for accurate date calculations

## Setup & Configuration

### Dependencies

- Backend: TypeORM, NestJS, date-fns
- Frontend: React, Apollo GraphQL, Chart.js

### Environment Variables

No additional environment variables are required for these features.

## Future Enhancements

1. Add export functionality for suppression metrics
2. Implement email alerts for high suppression rates
3. Add detailed product view for suppressed items
4. Create automated resolution suggestions
5. Implement merchant-specific dashboards for their suppressed products

## Known Issues

- The merchant list query assumes a `merchants` GraphQL query exists
- Some parameter types in the frontend may need explicit typing for full TypeScript compliance
- The backend assumes certain product entity fields (`suppressedAt`, `unsuppressedAt`) exist

## Contributors

- Avnu Marketplace Team
