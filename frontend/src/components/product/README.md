# Product Card Components

## Overview

The product card components provide a consistent, responsive display of product information across the Avnu Marketplace. These components ensure uniform card heights and proper vertical alignment regardless of content length or image dimensions, creating a visually stable experience for users.

## Components

### ResponsiveProductCard

The core component that displays product information with consistent dimensions across different device sizes.

```tsx
import ResponsiveProductCard from '../components/product/ResponsiveProductCard';

<ResponsiveProductCard product={product} badges={badgesElement} />
```

#### Props

- `product: Product` - The product object to display
- `badges?: React.ReactNode` - Optional badges to display on the product card (e.g., "Sale", "Featured")

#### Features

- **Consistent Heights**: Fixed dimensions for mobile, tablet, and desktop views
- **Responsive Images**: Uses device-specific images when available (mobile, tablet, desktop)
- **Fallback Handling**: Gracefully handles missing images, titles, or descriptions
- **Truncation**: Intelligently truncates long titles and descriptions to maintain consistent heights
- **Price Display**: Shows original price, sale price, and discount percentage when available

### ProductCard

A wrapper around ResponsiveProductCard that adds tracking and interactive features.

```tsx
import ProductCard from '../components/product/ProductCard';

<ProductCard 
  product={product} 
  onClick={handleProductClick}
  trackImpression={() => trackInteraction('IMPRESSION', { productId: product.id })}
  showBadges={true}
  testId="product-card-123"
/>
```

#### Props

- `product: Product` - The product object to display
- `onClick?: (product: Product) => void` - Optional click handler
- `trackImpression?: (product: Product) => void` - Optional function to track impression
- `showBadges?: boolean` - Whether to show badges (default: true)
- `className?: string` - Optional additional CSS classes
- `testId?: string` - Optional test ID for testing

#### Features

- **Impression Tracking**: Automatically tracks impressions when the component mounts
- **Click Handling**: Tracks clicks and navigates to product detail page
- **Badges**: Displays badges for sale items, featured products, and out-of-stock products
- **Consistent Styling**: Ensures all product cards have the same appearance and behavior

### ProductCardSkeleton

A loading skeleton that matches the exact dimensions of the product card.

```tsx
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

<ProductCardSkeleton />
```

#### Features

- **Matching Dimensions**: Exactly matches the dimensions of the actual product card
- **Responsive**: Adapts to different device sizes just like the real card
- **Prevents Layout Shifts**: Maintains the same layout during loading to prevent jarring visual changes

## Usage Guidelines

### Basic Usage

```tsx
import ProductCard from '../components/product/ProductCard';
import { Product } from '../types/product';

const MyComponent = () => {
  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product.id);
  };
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onClick={handleProductClick}
        />
      ))}
    </div>
  );
};
```

### Loading State

```tsx
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

const MyComponent = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  // ... fetch products logic
  
  if (loading) {
    return (
      <div className="product-grid">
        {Array(4).fill(0).map((_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### With Tracking

```tsx
import ProductCard from '../components/product/ProductCard';
import { useSession } from '../hooks/useSession';

const MyComponent = () => {
  const { trackInteraction } = useSession();
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onClick={(product) => trackInteraction('CLICK', { productId: product.id })}
          trackImpression={() => trackInteraction('IMPRESSION', { productId: product.id })}
        />
      ))}
    </div>
  );
};
```

## Design Decisions

1. **Fixed Heights**: All cards have fixed heights based on device size to ensure visual consistency
2. **Content Truncation**: Long titles and descriptions are truncated with ellipsis to maintain consistent card heights
3. **Image Handling**: Images have fixed heights and consistent aspect ratios with fallback for missing images
4. **Responsive Typography**: Font sizes are adjusted based on device size for optimal readability
5. **Skeleton Matching**: Loading skeletons match the exact dimensions of product cards to prevent layout shifts

## Technical Implementation

The product card components use a combination of:

- Fixed pixel heights for different device sizes
- CSS flexbox for vertical alignment
- CSS text truncation with `-webkit-line-clamp` for multi-line text
- Media queries for responsive design
- React hooks for device detection and responsive behavior
- Error boundaries for graceful fallback handling

## Accessibility

- All interactive elements are keyboard accessible
- Images have appropriate alt text
- Color contrast meets WCAG 2.1 AA standards
- Focus states are clearly visible
