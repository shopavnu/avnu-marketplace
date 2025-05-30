# Avnu Marketplace

## Project Overview

Avnu Marketplace is a comprehensive e-commerce platform that connects merchants with customers through a personalized shopping experience. The platform features advanced search capabilities, personalized product recommendations, merchant campaign management, and detailed analytics dashboards.

## Major Features

### 1. Merchant Portal with Campaign Management
- Campaign creation and management
- Budget allocation and tracking
- Performance analytics and reporting
- Ad placement optimization

### 2. Advanced Search Functionality
- Elasticsearch-powered search with ngram tokenization
- Personalized search results based on user preferences
- Faceted filtering and sorting options
- Search suggestions and auto-complete

### 3. Analytics Dashboard
- User journey visualization
- Segment analysis and reporting
- A/B testing framework
- Search personalization impact metrics
- Merchant advertising performance tracking
- Platform revenue and product sales analytics
- Historical trend analysis with interactive visualizations
- Real-time alerts and monitoring

### 4. Product and Brand Management
- Product catalog management
- Brand profile pages
- Category organization
- Inventory tracking

### 5. Infrastructure and Configuration Updates
- TypeScript strict mode compliance
- ESLint configuration for code quality
- Dependency management and version compatibility
- Build process optimization

## Recent Changes and Improvements

### TypeScript and Linting Fixes

#### Frontend
1. **Type Hygiene & Linting:**
   - Fixed implicit `any` errors by adding explicit type annotations to function parameters (e.g., map/filter/reduce callbacks)
   - Defined and updated interfaces for all mock data and analytics features
   - Ensured all mock product data and demo data structures match the latest interface definitions
   - Added missing type properties to interfaces as needed
   - Updated chart data preparation logic to return default empty objects instead of `null` to satisfy strict Chart.js typing

2. **Component & Page Refactoring:**
   - Repaired corrupted or broken files (notably `user-journey.tsx`)
   - Modularized and clarified interface usage in analytics dashboards
   - Updated all uses of `.map` and similar array methods to include explicit parameter types

3. **Mock Data Updates:**
   - Added required properties (`slug`, `categories`) to mock products in `shop.tsx`
   - Added required attributes (`material`, `weight`, `dimensions`) to product attributes
   - Fixed mock data in `CartDropdown.tsx` to include all required properties

4. **Icon Updates:**
   - Replaced deprecated `CursorClickIcon` with `CursorArrowRaysIcon` from Heroicons v2

#### Backend
1. **ESLint Configuration:**
   - Fixed quote style in Elasticsearch index configuration from double quotes to single quotes
   - Added `'index.max_ngram_diff': 18` setting to resolve Elasticsearch ngram tokenizer warning

2. **Dependency Management:**
   - Downgraded Express from version 5.1.0 to 4.18.2 to resolve peer dependency conflicts with apollo-server-express
   - Added `.npmrc` file with `legacy-peer-deps=true` to resolve dependency conflicts

3. **TypeORM Compatibility:**
   - Updated TypeORM queries to use the `In` operator correctly for array parameters

### Build and Deployment Optimization

1. **Frontend Build:**
   - Added missing dependencies (recharts) for analytics charts
   - Fixed all TypeScript errors to ensure successful builds
   - Ensured all pages render correctly with proper typing

2. **Backend Build:**
   - Resolved all critical linting errors
   - Fixed Elasticsearch configuration for proper indexing
   - Ensured compatibility with NestJS and GraphQL

3. **Vercel Deployment:**
   - Created `hotfix/vercel-deployment` branch with all fixes
   - Ensured all builds pass with no errors for seamless deployment

## CI/CD and Deployment Automation

This project utilizes GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD).

- **Dockerization**: The frontend, backend, and worker services are containerized using Docker.
- **Image Registry**: Docker images are built and pushed to GitHub Container Registry (ghcr.io).
- **Backend/Worker Deployment**: The backend and worker services are deployed to Render, pulling their Docker images from ghcr.io. Deployments to Render are triggered automatically by the CI/CD pipeline upon pushes to the main branch.
- **Frontend Deployment**: The frontend is deployed to Vercel (details in the Vercel deployment section if applicable, or manage via Vercel's GitHub integration).

Key Workflows:
- `.github/workflows/docker-build.yml`: Handles building Docker images for all services, pushing them to ghcr.io, and triggering deployments on Render for the backend and worker services.

## Development Setup

### Prerequisites
- Node.js (v20+)
- npm or yarn
- Docker and Docker Compose

### Quick Start with Docker

The easiest way to set up the entire platform is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/shopavnu/avnu-marketplace.git
cd avnu-marketplace

# Build the application
npm run build # Builds both frontend and backend

# Start the application with Docker Compose
docker compose up
```

This will start all services:
- Web application at http://localhost:3000
- API at http://localhost:8080
- Background worker
- PostgreSQL database
- Redis cache
- Elasticsearch

For development with hot-reloading:

```bash
# Use the development setup
docker compose up web api worker
```

### Manual Setup (Alternative)

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

## Testing

### Frontend Tests
```bash
cd frontend
npm run lint
npm run build
```

### Backend Tests
```bash
cd backend
npm run lint
npm run build
npm run test
```

## Deployment

The project is configured for deployment on Vercel. All TypeScript errors and linting issues have been resolved to ensure smooth deployment.

## Latest Features (April 2025)

### 1. Merchant Advertising Analytics Dashboard
- Comprehensive analytics for merchant advertising performance
- Platform revenue and product sales tracking from ads
- Historical trend analysis with interactive visualizations
- Campaign-level performance metrics and insights
- Filtering by merchant, time period, and campaign

### 2. Merchant Product Suppression
- Merchants can now control which products appear in recommendations and discovery feeds
- Dedicated dashboard for managing suppressed products
- Bulk actions for efficient product management
- Immediate effect on marketplace visibility

### 3. Fresh & Diverse Recommendations
- Enhanced recommendation system to prevent repetitive product suggestions
- Automatic exclusion of purchased products from recommendations
- Freshness controls to balance between new discoveries and familiar items
- Interactive "Discover" page for exploring personalized recommendations

See the [April 2025 Changelog](./CHANGELOG-APRIL-2025.md) and [Admin Dashboard Documentation](./docs/ADMIN-DASHBOARD.md) for complete details on these features.

## Future Enhancements

1. Further optimization of TypeScript types across the codebase
2. Addressing remaining lint warnings in the backend
3. Expanding test coverage for critical components
4. Enhancing documentation for API endpoints and component usage
5. Integrating real data sources for advertising analytics
6. Adding export functionality for analytics reports
7. Expanding segmentation options for advertising performance analysis
