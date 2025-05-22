# Avnu Marketplace Admin Portal Implementation

## Overview
This PR implements the admin portal for the Avnu Marketplace, focusing on two key features:
1. Application review workflow for new merchant applications
2. Product reporting system for marketplace policy violations

## Features Implemented

### Admin Components
- **AdminLayout**: Core layout component for all admin pages
- **AdminSidebar**: Navigation sidebar with sections for applications, products, merchants, and reports
- **AdminHeader**: Responsive header with search functionality and user profile options
- **MobileSidebar**: Mobile-friendly navigation for smaller screens
- **AdminBreadcrumbs**: Contextual navigation showing current location in admin portal

### Application Review System
- Application list page with filtering and sorting capabilities
- Detailed application view for reviewing merchant information
- Approval and rejection workflows with email notifications
- Product validation checks before merchant approval

### Product Reporting System
- **Customer-Facing**:
  - ReportProductButton: Integrated into product cards and detail pages
  - ReportProductModal: Form for submitting reports with categorized reasons
  
- **Admin Features**:
  - Reports Dashboard: Lists all product reports with filtering options
  - Report Detail View: Detailed view of individual reports with action options
  - Merchant Report Summaries: Overview of reported issues by merchant

## Services and Utilities
- **reportService**: API service for managing product reports
- TypeScript type definitions for reports, applications, and admin features

## Next Steps
- Connect to actual database endpoints for reports and applications
- Implement email notification system for report outcomes and application status changes
- Add user authentication and permission checks for admin routes
- Set up automated risk scoring for merchants based on report frequency

## Technical Notes
- The admin portal is built with Next.js and Tailwind CSS
- All components are fully responsive and follow our design system
- TypeScript is used throughout for type safety
