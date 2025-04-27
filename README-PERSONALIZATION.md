# Avnu Marketplace Personalization & Recommendation System

## Overview

The Avnu Marketplace Personalization & Recommendation System provides a robust, production-ready solution for delivering personalized product recommendations to users. This system tracks user preferences and behaviors, analyzes product similarities, and delivers highly relevant product suggestions throughout the shopping experience.

The system also includes a Product Suppression & Merchant Notification component that ensures only high-quality product listings are displayed to customers by automatically validating product data, suppressing products with missing key information, and notifying merchants so they can fix issues.

## Key Features

- **Personalized Recommendations**: Tailored product suggestions based on user browsing history, preferences, and behavior
- **Similar Products**: Product recommendations based on attribute similarity, view patterns, and hybrid approaches
- **Recently Viewed Products**: Tracking and display of products the user has recently viewed
- **Consistent UI**: Uniform product card display with fixed heights regardless of content length or image dimensions
- **Responsive Design**: Optimized display across mobile, tablet, and desktop devices
- **Analytics Integration**: Comprehensive tracking of impressions, clicks, and conversions
- **Loading States**: Skeleton loaders that match exact product card dimensions to prevent layout shifts
- **Error Handling**: Graceful fallbacks and error states throughout the system
- **Product Validation**: Automated validation of product data completeness and quality
- **Intelligent Suppression**: Context-aware suppression of products with missing key data
- **Merchant Notifications**: Email alerts to merchants about suppressed products with guidance on how to fix issues

## Architecture

The personalization and recommendation system consists of:

### Frontend Components

- **Product Cards**: Consistent, responsive display of product information
  - `ResponsiveProductCard`: Core component with fixed dimensions
  - `ProductCard`: Wrapper with tracking and interaction features
  - `ProductCardSkeleton`: Loading state with matching dimensions

- **Recommendation Components**: Display personalized product suggestions
  - `SimilarProducts`: Products similar to the current product
  - `PersonalizedRecommendations`: User-specific recommendations with fallback to trending
  - `RecentlyViewedProducts`: Products the user has recently viewed

- **Tracking Components**: Record user interactions for personalization
  - `ProductDetailTracker`: Tracks detailed product view interactions
  - `PersonalizedProductGrid`: Tracks impressions and interactions with product grids

### Backend Services

- **Recommendation Service**: Generates personalized product recommendations
  - Similar product calculation
  - Personalized recommendation algorithms
  - Trending product identification

- **User Preference Service**: Manages user preference data
  - Recently viewed products
  - Category preferences
  - Brand affinities

- **Analytics Service**: Processes user interaction data
  - Impression tracking
  - Click tracking
  - Conversion tracking

- **Product Validation Service**: Ensures product data quality
  - Validates required product fields
  - Updates product suppression status
  - Triggers merchant notifications

- **Notification Service**: Communicates with merchants
  - Sends email notifications about suppressed products
  - Provides detailed information about issues to fix
  - Includes direct links to edit affected products

### Database Schema

- **Product Similarities**: Stores pre-computed product similarity scores
- **User Preferences**: Stores user preference data
- **Interaction Logs**: Records user interactions for analysis
- **Recommendation Configurations**: Stores configuration for recommendation algorithms
- **Product Validation**: Stores product suppression status and validation history
- **Merchant Notifications**: Tracks notification history and merchant responses

## Technical Implementation

### Frontend

- **React**: Component-based UI development
- **TypeScript**: Type-safe code with interfaces for all components and services
- **CSS-in-JS**: Styled components with consistent dimensions and responsive design
- **Axios**: API requests to backend services
- **React Router**: Navigation between product pages
- **Jest & React Testing Library**: Comprehensive test coverage

### Backend

- **NestJS**: Modular backend architecture
- **TypeORM**: Database access and migrations
- **PostgreSQL**: Relational database for product and user data
- **GraphQL & REST**: Dual API approach for flexibility
- **Redis**: Caching for performance optimization
- **Jest**: Backend testing framework

## Usage Examples

### Product Detail Page

```tsx
import ProductDetailTracker from '../components/tracking/ProductDetailTracker';
import SimilarProducts from '../components/recommendations/SimilarProducts';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import RecentlyViewedProducts from '../components/recommendations/RecentlyViewedProducts';

const ProductDetailPage = ({ product }) => {
  return (
    <ProductDetailTracker product={product}>
      <div className="container">
        {/* Product details */}
        
        {/* Similar Products */}
        <SimilarProducts
          productId={product.id}
          similarityType="hybrid"
          limit={4}
        />
        
        {/* Recently Viewed Products */}
        <RecentlyViewedProducts
          limit={4}
          excludeProductId={product.id}
        />
        
        {/* Personalized Recommendations */}
        <PersonalizedRecommendations
          limit={4}
          title="Recommended For You"
          fallbackTitle="You Might Be Interested In"
        />
      </div>
    </ProductDetailTracker>
  );
};
```

### Discovery Feed

```tsx
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import RecentlyViewedProducts from '../components/recommendations/RecentlyViewedProducts';
import PersonalizedProductGrid from '../components/tracking/PersonalizedProductGrid';

const DiscoveryFeed = () => {
  return (
    <div className="container">
      <h1>Discovery Feed</h1>
      
      {/* Personalized Recommendations */}
      <PersonalizedRecommendations 
        title="Recommended for You"
        fallbackTitle="Trending Now"
        limit={4}
        showRefreshButton={true}
      />
      
      {/* Recently Viewed Products */}
      <RecentlyViewedProducts limit={4} />
      
      {/* Main Product Grid with Tracking */}
      <h2>Popular Products</h2>
      <PersonalizedProductGrid
        products={products}
        pageType="discovery_feed"
        renderProductCard={(product) => <ProductCard product={product} />}
      />
    </div>
  );
};
```

## Vertical Optimization for Product Cards

A key feature of this system is the consistent vertical alignment and fixed heights for all product cards, regardless of content length or image dimensions. This ensures a visually stable experience for users, preventing layout shifts and creating a professional, uniform appearance throughout the marketplace.

### Key Aspects of Vertical Optimization

1. **Fixed Card Heights**: Each card has a fixed height based on device size:
   - Mobile: 280px
   - Tablet: 320px
   - Desktop: 360px

2. **Fixed Image Heights**: Product images have fixed heights:
   - Mobile: 160px
   - Tablet: 180px
   - Desktop: 200px

3. **Text Truncation**: Titles and descriptions are truncated with ellipsis to maintain consistent heights:
   - Titles: 2 lines on all devices
   - Descriptions: 2 lines on mobile, 3 lines on tablet and desktop

4. **Consistent Typography**: Font sizes are specified for each element and device size:
   - Brand: 0.75rem (mobile/tablet), 0.8125rem (desktop)
   - Title: 0.875rem (mobile), 0.9375rem (tablet), 1rem (desktop)
   - Description: 0.75rem (mobile), 0.8125rem (tablet), 0.875rem (desktop)
   - Price: 0.875rem (mobile), 0.9375rem (tablet), 1rem (desktop)

5. **Fixed Padding**: Consistent padding for card content:
   - Mobile/Tablet: 12px
   - Desktop: 16px

6. **Fallback Handling**: Graceful handling of missing content:
   - Missing images: Placeholder SVG
   - Missing titles: "Untitled Product"
   - Missing descriptions: "No description available"
   - Missing prices: $0.00

## Analytics & Tracking

The personalization system tracks the following user interactions:

### Product Views

```typescript
trackInteraction('product_view', {
  productId: product.id,
  categoryId: product.categoryId,
  brandId: product.brandId,
  price: product.price,
  viewTimeMs: viewTime,
  scrollDepth: scrollDepth,
  engagement: hasEngaged,
  timestamp: new Date().toISOString()
});
```

### Recommendation Impressions

```typescript
trackInteraction('RECOMMENDATION_IMPRESSION', {
  recommendationType: 'similar_products',
  recommendedProductId: product.id,
  timestamp: new Date().toISOString()
});
```

### Recommendation Clicks

```typescript
trackInteraction('RECOMMENDATION_CLICK', {
  recommendationType: 'similar_products',
  recommendedProductId: product.id,
  timestamp: new Date().toISOString()
});
```

## Testing

The personalization system includes comprehensive test coverage:

- **Component Tests**: Verify rendering, loading states, error handling, and user interactions
- **Service Tests**: Verify API integration and data processing
- **End-to-End Tests**: Verify complete user flows and integration between components

## Performance Considerations

- **Lazy Loading**: Images are lazy-loaded to improve initial page load time
- **Skeleton Loaders**: Provide visual feedback during data loading
- **Caching**: API responses are cached to reduce redundant requests
- **Debouncing**: User interactions are debounced to prevent excessive tracking events
- **Code Splitting**: Components are code-split to reduce initial bundle size

## Future Enhancements

- **A/B Testing**: Framework for testing different recommendation algorithms
- **Machine Learning Integration**: More sophisticated recommendation algorithms
- **Real-time Personalization**: Immediate updates based on current session behavior
- **Cross-device Synchronization**: Consistent recommendations across devices
- **Collaborative Filtering**: Recommendations based on similar user behaviors

## Documentation

Detailed documentation is available for each component:

- [Product Card Components](/frontend/src/components/product/README.md)
- [Recommendation Components](/frontend/src/components/recommendations/README.md)
- [Product Suppression & Merchant Notification](/docs/PRODUCT_SUPPRESSION.md)
- [Vertical Optimization for Product Cards](/docs/VERTICAL_OPTIMIZATION.md)
- [Backend API Documentation](/backend/docs/api.md)

## Contributors

- Avnu Marketplace Engineering Team
