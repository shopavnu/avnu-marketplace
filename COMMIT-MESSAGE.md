feat(admin): Add suppression analytics dashboard and fix vertical card consistency

This commit implements two major features:

1. Admin Suppression Analytics Dashboard:
   - Backend: Added ProductSuppressionAnalyticsService and Resolver
   - Frontend: Created suppression-metrics page with charts and tables
   - Added Category entity and module for analytics support
   - Implemented metrics for suppression rates and resolution times
   - Added navigation component for analytics pages
   - Added admin dashboard link to header dropdown for testing

2. Vertical Discovery Card Consistency:
   - Created VerticalConsistentProductCard component
   - Implemented fixed heights for all card elements
   - Added proper text truncation and overflow handling
   - Ensured consistent vertical alignment regardless of content

3. Code Quality Improvements:
   - Fixed TypeScript errors in multiple files
   - Fixed linting issues across the codebase
   - Added comprehensive documentation
   - Added proper TypeScript interfaces for all data structures

This work addresses the vertical discovery card consistency issue where product cards were showing different sizes. It also adds valuable analytics for the admin team to track product suppression rates and resolution times.

Resolves: #123 (Product Card Consistency)
Resolves: #456 (Admin Suppression Analytics)
