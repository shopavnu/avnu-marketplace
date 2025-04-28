# Avnu Marketplace Changelog - April 2025

## Feature: Merchant Portal Product Suppression

Merchants can now manage which of their products appear in marketplace recommendations and discovery feeds through a dedicated suppression dashboard.

### Key Components:

1. **Frontend**:
   - New merchant dashboard page at `/merchant/products/suppressed`
   - Intuitive UI for viewing, filtering, and managing suppressed products
   - Bulk actions for suppressing/unsuppressing multiple products
   - Detailed product cards with suppression status indicators

2. **Backend**:
   - Extended `MerchantProductsController` with suppression endpoints
   - Added suppression status to product entity
   - Implemented filtering logic to exclude suppressed products from recommendations

3. **Integration**:
   - Updated recommendation services to respect product suppression settings
   - Added product service methods for suppression management

### User Flow:
1. Merchant logs into their dashboard
2. Navigates to Products > Suppressed Products
3. Can view all suppressed products or filter by category/status
4. Can toggle suppression status for individual or multiple products
5. Changes immediately affect product visibility in the marketplace

## Feature: Fresh & Diverse Recommendations

Enhanced the recommendation system to ensure users see fresh, diverse products and don't see products they've already purchased.

### Key Components:

1. **Frontend**:
   - Added `excludePurchased` and `freshness` props to `PersonalizedRecommendations` component
   - Updated `RecommendationService` to support new parameters
   - Created a "Discover" page with interactive controls for testing freshness and purchase exclusion
   - Added to main navigation for easy access

2. **Backend**:
   - Created `EnhancedPersonalizationService` with freshness and purchase exclusion logic
   - Updated `RecommendationController` to support new parameters
   - Replaced legacy ranking service with enhanced implementation
   - Added database queries to identify purchased products and recently viewed items

3. **User Experience**:
   - Slider control (0-100%) for adjusting recommendation freshness
   - Toggle for excluding/including purchased products
   - Balanced recommendations between familiar and new products

### Technical Details:
- Freshness parameter (0.0-1.0) controls ratio of new vs. familiar content
- Purchase exclusion uses `user_behaviors` table with `behaviorType: 'purchase'`
- System maintains vertical optimization for product cards (consistent heights)
- Fallback to trending products if not enough recommendations after filtering

## Code Quality Improvements:
- Fixed TypeScript errors in recommendation modules
- Addressed linting warnings with proper variable naming
- Improved code documentation and comments
- Maintained consistent styling across components
- Removed deprecated code and services
