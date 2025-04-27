# Responsive Product Cards - Technical Documentation

## Overview
This document provides technical details about the implementation of responsive product cards in the Avnu Marketplace platform. The solution ensures consistent card heights across all device sizes while optimizing images and content for different screen sizes.

## Architecture

### 1. Backend Image Processing

#### Image Processing Service
The `ImageProcessingService` handles downloading, processing, and storing product images in multiple sizes:

```typescript
// Key method in ImageProcessingService
async processImage(imageUrl: string): Promise<ProcessedImage> {
  // Download original image
  const originalImage = await this.downloadImage(imageUrl);
  
  // Process for different device sizes
  const desktopImage = await this.resizeImage(originalImage, 800, 800);
  const tabletImage = await this.resizeImage(originalImage, 600, 600);
  const mobileImage = await this.resizeImage(originalImage, 400, 400);
  
  // Save processed images
  const desktopUrl = await this.saveImage(desktopImage, 'desktop');
  const tabletUrl = await this.saveImage(tabletImage, 'tablet');
  const mobileUrl = await this.saveImage(mobileImage, 'mobile');
  
  // Return ProcessedImage object with URLs and metadata
  return {
    processedUrl: desktopUrl,
    mobileUrl,
    tabletUrl,
    thumbnailUrl: mobileUrl,
    metadata: {
      width: 800,
      height: 800,
      format: 'webp'
    }
  };
}
```

#### Data Normalization Service
The `DataNormalizationService` ensures product data includes responsive image URLs:

```typescript
// In DataNormalizationService
normalizeProductImages(product: Product): Product {
  // Build responsive image data
  const responsiveImageData = product.images.map(image => {
    return {
      desktop: image,
      tablet: image.replace('/products/', '/products/tablet/'),
      mobile: image.replace('/products/', '/products/mobile/')
    };
  });
  
  return {
    ...product,
    responsiveImageData,
    mobileImages: responsiveImageData.map(img => img.mobile),
    tabletImages: responsiveImageData.map(img => img.tablet)
  };
}
```

### 2. Frontend Implementation

#### Product Type Definition
```typescript
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  mobileImages?: string[]; // URLs for mobile-sized images (400x400)
  tabletImages?: string[]; // URLs for tablet-sized images (600x600)
  imageMetadata?: ImageMetadata[];
  // ... other properties
}
```

#### ResponsiveProductCard Component
The `ResponsiveProductCard` component uses device detection to select appropriate images and content:

```typescript
const ResponsiveProductCard: React.FC<ResponsiveProductCardProps> = ({ product, badges }) => {
  // State to track device size
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Set up device detection on client-side only
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDeviceType('mobile');
      } else if (window.innerWidth < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial detection
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get appropriate image based on screen size
  const getResponsiveImage = () => {
    if (deviceType === 'mobile' && product.mobileImages?.[0]) {
      return product.mobileImages[0];
    } else if (deviceType === 'tablet' && product.tabletImages?.[0]) {
      return product.tabletImages[0];
    }
    return product.images[0];
  };

  // Get appropriate text length based on screen size
  const getResponsiveDescription = () => {
    const maxLength = deviceType === 'mobile' ? 60 : deviceType === 'tablet' ? 100 : 150;
    return truncateText(product.description, maxLength);
  };

  // Component JSX with responsive styling
  // ...
}
```

#### Server-Side Rendering Compatibility
To avoid "window is not defined" errors in Next.js SSR, we use dynamic imports with SSR disabled:

```typescript
// In pages like ResponsiveTestPage.tsx
import dynamic from 'next/dynamic';

const ResponsiveProductGrid = dynamic(
  () => import('../components/product/ResponsiveProductGrid'),
  { ssr: false }
);
```

## CSS Techniques for Consistent Heights

### Fixed Container Heights
```css
.product-card {
  width: 100%;
  height: clamp(280px, 50vw, 360px); /* Responsive height */
  min-height: min(280px, 90vh);
  max-height: max(360px, 50vh);
  contain: strict; /* Important for layout containment */
}
```

### Image Container
```css
.product-image-container {
  position: relative;
  flex: 0 0 auto;
  height: clamp(160px, 30vw, 220px); /* Responsive image height */
  overflow: hidden;
}
```

### Text Truncation
```css
.product-title {
  margin: 0 0 4px 0;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 600;
  line-height: 1.2;
  height: calc(1.2em * 2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
```

## Device-Specific Dimensions

| Device Type | Card Height | Image Size | Description Length |
|-------------|-------------|------------|-------------------|
| Mobile      | 280px       | 400x400    | 60 characters     |
| Tablet      | ~320px      | 600x600    | 100 characters    |
| Desktop     | 360px       | 800x800    | 150 characters    |

## Performance Considerations

1. **Image Optimization**
   - All images are converted to WebP format
   - Images are resized server-side to avoid client-side scaling
   - Lazy loading is implemented for images below the fold

2. **Layout Stability**
   - Fixed height containers prevent layout shifts during loading
   - CSS containment is used to isolate layout impact
   - Text truncation prevents overflow issues

3. **Bundle Size**
   - Dynamic imports reduce initial load size
   - Component is designed for tree-shaking

## Browser Compatibility

The implementation is tested and compatible with:
- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

CSS features like `clamp()` and `calc()` have good browser support, with fallbacks for older browsers.

## Future Improvements

1. **Image Format Selection**
   - Implement AVIF format for browsers that support it
   - Add WebP detection and fallback to JPEG for older browsers

2. **Lazy Loading Enhancement**
   - Implement intersection observer for more efficient lazy loading
   - Add progressive image loading with blur-up technique

3. **Accessibility**
   - Enhance keyboard navigation for product cards
   - Improve screen reader compatibility
