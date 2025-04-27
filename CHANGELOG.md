# Changelog

All notable changes to the Avnu Marketplace project will be documented in this file.

## [Unreleased]

### Added
- Responsive product cards that maintain consistent height across all device sizes
- Device-specific image optimization (mobile: 400x400, tablet: 600x600, desktop: 800x800)
- Separate TypeScript configuration for backend example scripts with JSX support
- Type declarations for external modules used in example scripts

### Fixed
- Comprehensive linting cleanup across the entire platform:
  - Removed or prefixed unused imports and variables
  - Fixed import/export issues in backend modules
  - Corrected type errors in test files
  - Updated test implementations to match current service return types
- TypeScript compilation errors:
  - Updated frontend tsconfig.json with proper module resolution and JSX settings
  - Fixed type errors in merchant-analytics.spec.ts
  - Restored vertical optimization and card consistency work
- Frontend module resolution:
  - Fixed import paths for Product types and formatters
  - Ensured SSR compatibility with dynamic imports

## [0.2.0] - 2025-04-24

### Added
- Complete Analytics Dashboard with user journey visualization
- Segment analysis and reporting features
- A/B testing framework for merchants
- Search personalization impact metrics
- Real-time alerts and monitoring system
- Merchant campaign management interface
- Budget allocation and tracking tools
- Ad placement optimization algorithms
- Brand profile pages with customization options

### Fixed
- TypeScript errors in frontend components:
  - Added missing properties (`slug`, `categories`) to mock products in `shop.tsx`
  - Added required attributes (`material`, `weight`, `dimensions`) to product attributes
  - Fixed mock data in `CartDropdown.tsx` to include all required properties
  - Replaced deprecated `CursorClickIcon` with `CursorArrowRaysIcon` from Heroicons v2
  - Fixed implicit `any` errors in admin analytics pages
  - Updated chart data preparation logic to return default empty objects instead of `null`
  - Repaired corrupted `user-journey.tsx` file
  - Added explicit type annotations to function parameters in map/filter/reduce callbacks

- Backend configuration and dependency issues:
  - Fixed quote style in Elasticsearch index configuration
  - Added `'index.max_ngram_diff': 18` setting to resolve Elasticsearch ngram tokenizer warning
  - Downgraded Express from version 5.1.0 to 4.18.2 for apollo-server-express compatibility
  - Added `.npmrc` file with `legacy-peer-deps=true` to resolve dependency conflicts
  - Updated TypeORM queries to use the `In` operator correctly

### Changed
- Enhanced Product interface with stricter type definitions
- Improved ESLint configuration for better code quality
- Optimized build process for faster deployment
- Restructured analytics components for better maintainability
- Updated mock data to match latest interface definitions

## [0.1.0] - 2025-03-15

### Added
- Initial project setup with Next.js frontend and NestJS backend
- Basic product catalog and search functionality
- Elasticsearch integration for search capabilities
- User authentication and authorization
- Shopping cart functionality
- Basic merchant dashboard
- Product listing and detail pages
- Category navigation
- Initial GraphQL API endpoints
