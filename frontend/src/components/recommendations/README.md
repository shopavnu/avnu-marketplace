# Recommendation Components

## Overview

The recommendation components provide personalized product suggestions to users throughout the Avnu Marketplace. These components integrate with the personalization engine to display relevant products based on user behavior, preferences, and product attributes, ensuring a consistent and engaging shopping experience.

## Components

### SimilarProducts

Displays products similar to the current product being viewed.

```tsx
import SimilarProducts from '../components/recommendations/SimilarProducts';

<SimilarProducts 
  productId="product-123"
  similarityType="hybrid"
  limit={4}
  title="You May Also Like"
/>
```

#### Props

- `productId: string` - ID of the current product
- `similarityType?: 'attribute_based' | 'view_based' | 'hybrid'` - Type of similarity algorithm to use (default: 'hybrid')
- `limit?: number` - Maximum number of products to display (default: 4)
- `title?: string` - Section title (default: 'You may also like')

#### Features

- **Multiple Similarity Types**: Supports attribute-based, view-based, and hybrid similarity algorithms
- **Loading State**: Displays skeleton loaders during data fetching
- **Error Handling**: Gracefully handles API errors
- **Empty State**: Shows appropriate message when no similar products are found
- **Impression & Click Tracking**: Automatically tracks impressions and clicks for analytics

### PersonalizedRecommendations

Displays personalized product recommendations based on user behavior and preferences.

```tsx
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';

<PersonalizedRecommendations 
  limit={6}
  title="Recommended for you"
  fallbackTitle="Trending now"
  showRefreshButton={true}
/>
```

#### Props

- `limit?: number` - Maximum number of products to display (default: 6)
- `title?: string` - Section title for personalized recommendations (default: 'Recommended for you')
- `fallbackTitle?: string` - Section title for fallback recommendations (default: 'Trending now')
- `showRefreshButton?: boolean` - Whether to show a refresh button (default: false)

#### Features

- **Personalization**: Shows products tailored to the user's preferences and behavior
- **Fallback**: Automatically falls back to trending products if personalized recommendations are not available
- **Refresh**: Allows users to refresh recommendations on demand
- **Authentication Awareness**: Adapts based on whether the user is authenticated
- **Impression & Click Tracking**: Automatically tracks impressions and clicks for analytics

### RecentlyViewedProducts

Displays products that the user has recently viewed.

```tsx
import RecentlyViewedProducts from '../components/recommendations/RecentlyViewedProducts';

<RecentlyViewedProducts 
  limit={4}
  title="Recently viewed"
  excludeProductId="current-product-id"
/>
```

#### Props

- `limit?: number` - Maximum number of products to display (default: 4)
- `title?: string` - Section title (default: 'Recently viewed')
- `excludeProductId?: string` - ID of a product to exclude from the list (typically the current product)

#### Features

- **User History**: Displays products from the user's browsing history
- **Order Preservation**: Maintains the chronological order of viewed products
- **Exclusion**: Can exclude the current product to avoid redundancy
- **Persistence**: Uses local storage and/or user account data for persistence
- **Impression & Click Tracking**: Automatically tracks impressions and clicks for analytics

## Usage Guidelines

### Basic Usage

```tsx
import SimilarProducts from '../components/recommendations/SimilarProducts';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import RecentlyViewedProducts from '../components/recommendations/RecentlyViewedProducts';

const ProductDetailPage = ({ product }) => {
  return (
    <div>
      {/* Product details */}
      
      {/* Similar Products */}
      <div className="mt-16">
        <SimilarProducts
          productId={product.id}
          similarityType="hybrid"
          limit={4}
          title="You May Also Like"
        />
      </div>
      
      {/* Recently Viewed Products */}
      <div className="mt-16">
        <RecentlyViewedProducts
          limit={4}
          excludeProductId={product.id}
        />
      </div>
      
      {/* Personalized Recommendations */}
      <div className="mt-16">
        <PersonalizedRecommendations
          limit={4}
          title="Recommended For You"
          fallbackTitle="You Might Be Interested In"
        />
      </div>
    </div>
  );
};
```

### Loading States

All recommendation components handle their own loading states internally, displaying skeletons during data fetching:

```tsx
// The component handles loading state internally
<SimilarProducts productId={product.id} />
```

### Error Handling

All recommendation components handle errors gracefully, displaying appropriate messages:

```tsx
// The component handles errors internally
<PersonalizedRecommendations />
```

## Integration with Tracking

The recommendation components integrate with the session tracking system to record impressions and clicks:

```tsx
// In the component implementation
const { trackInteraction } = useSession();

// Track impression when products are displayed
useEffect(() => {
  if (products.length > 0) {
    trackInteraction('RECOMMENDATION_IMPRESSION', {
      recommendationType: 'similar_products',
      recommendedProducts: products.map(p => p.id),
    });
  }
}, [products, trackInteraction]);

// Track click when a product is clicked
const handleProductClick = (product: Product) => {
  trackInteraction('RECOMMENDATION_CLICK', {
    recommendationType: 'similar_products',
    recommendedProductId: product.id,
  });
};
```

## Design Decisions

1. **Consistent UI**: All recommendation components use the same ProductCard component for visual consistency
2. **Loading Skeletons**: All components display skeleton loaders that match the exact dimensions of product cards
3. **Error States**: Components handle errors gracefully, showing appropriate messages
4. **Empty States**: Components display meaningful messages when no recommendations are available
5. **Fallback Logic**: PersonalizedRecommendations falls back to trending products when personalized recommendations are not available
6. **Tracking Integration**: All components automatically track impressions and clicks for analytics

## Technical Implementation

The recommendation components use:

- **React Hooks**: For state management and side effects
- **Axios**: For API requests
- **Session Tracking**: For recording user interactions
- **ProductCard**: For consistent product display
- **ProductCardSkeleton**: For consistent loading states
- **Responsive Design**: For optimal display across device sizes

## Personalization Engine Integration

The recommendation components integrate with the backend personalization engine through the following services:

- **RecommendationService**: Fetches personalized recommendations, similar products, and trending products
- **ProductService**: Fetches product details by ID, category, or search query
- **UserPreferencesService**: Manages user preferences and recently viewed products

## Analytics

The recommendation components track the following events:

- **RECOMMENDATION_IMPRESSION**: When recommendations are displayed to the user
- **RECOMMENDATION_CLICK**: When a user clicks on a recommended product
- **RECOMMENDATION_CONVERSION**: When a user adds a recommended product to cart or purchases it
