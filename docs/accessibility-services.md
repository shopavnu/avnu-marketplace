# Accessibility Services Documentation

## Overview

The Avnu Marketplace Accessibility Services provide comprehensive tools for enhancing product accessibility through metadata generation, ARIA attributes, and structured data. These services help ensure that the marketplace is accessible to all users, including those using assistive technologies like screen readers.

## Features

### 1. Alt Text Generation

Automatically generates descriptive alt text for product images using AI vision services:

- **Context-aware**: Uses product information (title, description, category) to generate more relevant alt text
- **Fallback mechanism**: Provides sensible defaults when AI generation is unavailable
- **Batch processing**: Supports processing multiple products at once

### 2. ARIA Metadata API

Provides ARIA attributes for product cards and details to improve screen reader compatibility:

- **Dynamic generation**: Creates appropriate ARIA attributes based on product state (in stock, on sale)
- **Semantic roles**: Assigns proper roles to product elements
- **Custom descriptions**: Generates descriptive labels for complex product features

### 3. Structured Data Endpoints

Generates Schema.org-compliant structured data for products:

- **SEO optimization**: Improves search engine visibility with rich product data
- **Screen reader support**: Enhances accessibility by providing structured information
- **Compatibility**: Follows Schema.org Product standards for maximum compatibility

## API Reference

### GraphQL API

#### Queries

```graphql
# Get accessibility metadata for a product
query ProductAccessibility($productId: ID!) {
  productAccessibility(productId: $productId) {
    productId
    accessibilityMetadata {
      altText
      ariaLabel
      role
      longDescription
      structuredData {
        type
        context
        name
        description
        brand
      }
    }
    imageAltTexts {
      imageUrl
      altText
    }
  }
}

# Get ARIA attributes for a product
query ProductAriaAttributes($productId: ID!) {
  productAriaAttributes(productId: $productId) {
    productId
    attributes {
      name
      value
    }
  }
}
```

#### Mutations

```graphql
# Generate alt text for a product's images
mutation GenerateProductAltText($productId: ID!) {
  generateProductAltText(productId: $productId) {
    productId
    accessibilityMetadata {
      altText
      ariaLabel
      role
    }
    imageAltTexts {
      imageUrl
      altText
    }
  }
}
```

### REST API

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/accessibility/:productId/metadata` | Get accessibility metadata for a product |
| GET | `/products/accessibility/:productId/aria` | Get ARIA attributes for a product |
| GET | `/products/accessibility/:productId/structured-data` | Get structured data for a product |
| POST | `/products/accessibility/:productId/alt-text` | Generate alt text for a product's images |
| GET | `/products/accessibility/batch/alt-text?limit=10` | Process a batch of products without alt text |

## Implementation Examples

### Frontend Usage

#### React Component Example

```tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_ACCESSIBILITY } from '../graphql/queries';

const AccessibleProductCard = ({ productId }) => {
  const { data, loading } = useQuery(GET_PRODUCT_ACCESSIBILITY, {
    variables: { productId }
  });
  
  if (loading) return <div>Loading...</div>;
  
  const { accessibilityMetadata, imageAltTexts } = data.productAccessibility;
  const primaryImage = imageAltTexts?.[0];
  
  return (
    <div 
      role={accessibilityMetadata.role || 'article'}
      aria-label={accessibilityMetadata.ariaLabel}
    >
      <img 
        src={primaryImage?.imageUrl} 
        alt={primaryImage?.altText || accessibilityMetadata.altText || 'Product image'} 
      />
      {/* Product details */}
    </div>
  );
};
```

#### Adding Structured Data to Product Pages

```tsx
import React from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_STRUCTURED_DATA } from '../graphql/queries';

const ProductPage = ({ productId }) => {
  const { data } = useQuery(GET_PRODUCT_STRUCTURED_DATA, {
    variables: { productId }
  });
  
  return (
    <>
      <Head>
        {data && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(data.productAccessibility.accessibilityMetadata.structuredData)
            }}
          />
        )}
      </Head>
      {/* Product page content */}
    </>
  );
};
```

## Configuration

The Accessibility Services can be configured through environment variables:

```
# Enable/disable AI-based alt text generation
ENABLE_ALT_TEXT_GENERATION=true

# API key for vision AI service (if using)
AI_VISION_API_KEY=your_api_key_here

# Endpoint for vision AI service
AI_VISION_ENDPOINT=https://api.vision.ai/v1/analyze
```

## Best Practices

1. **Always provide alt text for images**: Use the alt text generation service to ensure all product images have descriptive alt text.

2. **Include ARIA attributes**: Apply the generated ARIA attributes to product cards and details pages.

3. **Add structured data to product pages**: Include the generated structured data on product pages to improve SEO and accessibility.

4. **Run batch processing regularly**: Schedule regular batch processing of products without alt text to maintain high accessibility standards.

5. **Test with screen readers**: Regularly test the marketplace with screen readers to ensure accessibility features work as expected.

## Future Enhancements

- **Advanced image recognition**: Enhanced AI capabilities for more detailed image descriptions
- **Accessibility scoring**: Automated scoring system to measure and improve product accessibility
- **User-specific adaptations**: Customized accessibility features based on user preferences and needs
- **Voice search integration**: Improved compatibility with voice search and voice assistants
- **Accessibility reports**: Detailed reports on marketplace accessibility compliance

## Support

For questions or issues related to the Accessibility Services, please contact the development team or file an issue in the project repository.
