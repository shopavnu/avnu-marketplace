# Avnu Marketplace Accessibility Documentation

## Overview

The Avnu Marketplace platform is committed to providing an accessible experience for all users, including those with disabilities. This documentation covers the accessibility features implemented in the platform, including:

1. **Accessibility Metadata & Alt Text Generation**: Automatic generation of alt text for product images, ARIA metadata, and structured data for better screen reader support.

2. **Keyboard Navigation System**: Server-side section mapping, focus state persistence, and customizable keyboard shortcuts for keyboard-only users.

## Table of Contents

- [Accessibility Metadata & Alt Text Generation](#accessibility-metadata--alt-text-generation)
  - [Features](#features)
  - [API Reference](#api-reference)
  - [Integration Guide](#integration-guide)
  - [Best Practices](#best-practices)
- [Keyboard Navigation System](#keyboard-navigation-system)
  - [Features](#features-1)
  - [Architecture](#architecture)
  - [API Reference](#api-reference-1)
  - [Client-Side Integration](#client-side-integration)
  - [Best Practices](#best-practices-1)
- [Testing & Compliance](#testing--compliance)
- [Future Enhancements](#future-enhancements)

## Accessibility Metadata & Alt Text Generation

### Features

The Accessibility Metadata service provides:

- **Alt Text Generation**: Automatically generates descriptive alt text for product images using AI vision APIs or product context as a fallback.
- **ARIA Metadata**: Generates ARIA attributes for product cards and details to enhance screen reader experiences.
- **Structured Data**: Provides Schema.org-compliant structured data for products to improve SEO and accessibility.
- **Batch Processing**: Supports batch processing of products without alt text to ensure comprehensive coverage.

### API Reference

#### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/:id/accessibility` | Get accessibility metadata for a product |
| GET | `/products/:id/structured-data` | Get structured data for a product |
| GET | `/products/:id/aria` | Get ARIA attributes for a product |
| POST | `/products/:id/generate-alt-text` | Generate alt text for a product's images |
| POST | `/products/batch/generate-alt-text` | Batch generate alt text for multiple products |
| GET | `/products/without-alt-text` | Get products without alt text |

#### GraphQL API

```graphql
# Get accessibility metadata for a product
query ProductAccessibility($id: ID!) {
  productAccessibility(id: $id) {
    structuredData
    imageAltTexts {
      imageUrl
      altText
    }
  }
}

# Get ARIA attributes for a product
query ProductAriaAttributes($id: ID!) {
  productAriaAttributes(id: $id) {
    labelledBy
    describedBy
    role
    additionalAttributes
  }
}

# Generate alt text for a product's images
mutation GenerateProductAltText($id: ID!) {
  generateProductAltText(id: $id) {
    success
    message
    imageAltTexts {
      imageUrl
      altText
    }
  }
}

# Batch generate alt text for multiple products
mutation BatchGenerateAltText($productIds: [ID!]!) {
  batchGenerateAltText(productIds: $productIds) {
    success
    message
    processedCount
    failedCount
  }
}
```

### Integration Guide

#### Frontend Integration

```typescript
// Example: Fetching accessibility metadata for a product
async function getProductAccessibility(productId: string) {
  const response = await fetch(`/products/${productId}/accessibility`);
  return await response.json();
}

// Example: Rendering a product card with accessibility features
function AccessibleProductCard({ product }) {
  const [accessibilityData, setAccessibilityData] = useState(null);
  
  useEffect(() => {
    async function fetchAccessibility() {
      const data = await getProductAccessibility(product.id);
      setAccessibilityData(data);
    }
    fetchAccessibility();
  }, [product.id]);
  
  // Get alt text for an image
  const getAltText = (imageUrl) => {
    if (!accessibilityData || !accessibilityData.imageAltTexts) {
      return product.name; // Fallback to product name
    }
    
    const altTextEntry = accessibilityData.imageAltTexts.find(
      entry => entry.imageUrl === imageUrl
    );
    
    return altTextEntry ? altTextEntry.altText : product.name;
  };
  
  return (
    <div className="product-card" role="article">
      <img 
        src={product.mainImage} 
        alt={getAltText(product.mainImage)} 
        loading="lazy"
      />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      {/* Additional product details */}
    </div>
  );
}
```

### Best Practices

1. **Always Include Alt Text**: Ensure all product images have descriptive alt text.
2. **Use Semantic HTML**: Use appropriate HTML elements (headings, lists, etc.) to structure content.
3. **Provide Context**: Include additional context in alt text when necessary (e.g., color, size, material).
4. **Test with Screen Readers**: Regularly test the platform with screen readers to ensure compatibility.
5. **Batch Process**: Regularly run batch processing to generate alt text for new products.

## Keyboard Navigation System

### Features

The Keyboard Navigation System provides:

- **Server-Side Section Mapping**: Pages are divided into logical sections with DOM selectors for client-side targeting.
- **Focus State Persistence**: User focus state is saved and restored across page loads and sessions.
- **Keyboard Shortcut Configuration**: Users can create and customize their own keyboard shortcuts.
- **Priority-Based Navigation**: Sections have priority values to determine tab order.
- **Route-Specific Navigation**: Different routes can have different section mappings and shortcuts.

### Architecture

The keyboard navigation system is built as a modular component within the Accessibility module:

```
accessibility/
├── keyboard-navigation/
│   ├── entities/
│   │   ├── navigation-section.entity.ts
│   │   ├── focus-state.entity.ts
│   │   └── keyboard-shortcut.entity.ts
│   ├── services/
│   │   ├── keyboard-navigation.service.ts
│   │   ├── section-mapping.service.ts
│   │   ├── focus-state.service.ts
│   │   └── keyboard-shortcut.service.ts
│   ├── controllers/
│   │   └── keyboard-navigation.controller.ts
│   ├── resolvers/
│   │   └── keyboard-navigation.resolver.ts
│   └── keyboard-navigation.module.ts
└── accessibility.module.ts
```

### API Reference

#### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accessibility/keyboard-navigation/sections?route=:route` | Get navigation sections for a route |
| GET | `/accessibility/keyboard-navigation/sections/:id` | Get a navigation section by ID |
| POST | `/accessibility/keyboard-navigation/sections` | Create a new navigation section |
| PUT | `/accessibility/keyboard-navigation/sections/:id` | Update a navigation section |
| DELETE | `/accessibility/keyboard-navigation/sections/:id` | Delete a navigation section |
| GET | `/accessibility/keyboard-navigation/shortcuts?userId=:userId&route=:route` | Get keyboard shortcuts for a user |
| GET | `/accessibility/keyboard-navigation/shortcuts/:id` | Get a keyboard shortcut by ID |
| POST | `/accessibility/keyboard-navigation/shortcuts` | Create a new keyboard shortcut |
| PUT | `/accessibility/keyboard-navigation/shortcuts/:id` | Update a keyboard shortcut |
| DELETE | `/accessibility/keyboard-navigation/shortcuts/:id` | Delete a keyboard shortcut |
| POST | `/accessibility/keyboard-navigation/shortcuts/user/:userId` | Save a user-specific keyboard shortcut |
| DELETE | `/accessibility/keyboard-navigation/shortcuts/user/:userId/reset` | Reset user keyboard shortcuts to default |
| GET | `/accessibility/keyboard-navigation/focus-state?userId=:userId&sessionId=:sessionId&route=:route` | Get focus state for a user |
| POST | `/accessibility/keyboard-navigation/focus-state` | Save focus state |
| DELETE | `/accessibility/keyboard-navigation/focus-state?userId=:userId&sessionId=:sessionId` | Clear focus states for a user |
| GET | `/accessibility/keyboard-navigation/navigation-state?route=:route&userId=:userId&sessionId=:sessionId` | Get complete navigation state for a route |
| POST | `/accessibility/keyboard-navigation/initialize` | Initialize the keyboard navigation system |

#### GraphQL API

```graphql
# Get navigation sections for a route
query NavigationSections($route: String!) {
  navigationSections(route: $route) {
    id
    name
    route
    selector
    childSelectors
    priority
    description
    ariaLabel
    parentSectionId
    isActive
  }
}

# Get keyboard shortcuts for a user
query KeyboardShortcuts($userId: String!, $route: String) {
  keyboardShortcuts(userId: $userId, route: $route) {
    id
    name
    description
    shortcutKey {
      key
      altKey
      ctrlKey
      shiftKey
      metaKey
    }
    action
    route
    sectionId
    isGlobal
    isActive
  }
}

# Get last focus state
query LastFocusState($userId: String!, $sessionId: String!, $route: String) {
  lastFocusState(userId: $userId, sessionId: $sessionId, route: $route) {
    id
    userId
    sessionId
    route
    sectionId
    elementId
    elementSelector
    context
    lastActive
    isActive
  }
}

# Save focus state
mutation SaveFocusState(
  $userId: String!
  $sessionId: String!
  $route: String!
  $sectionId: String!
  $elementId: String
  $elementSelector: String
  $context: String
) {
  saveFocusState(
    userId: $userId
    sessionId: $sessionId
    route: $route
    sectionId: $sectionId
    elementId: $elementId
    elementSelector: $elementSelector
    context: $context
  ) {
    id
    userId
    sessionId
    route
    sectionId
    elementId
    elementSelector
    context
    lastActive
    isActive
  }
}
```

### Client-Side Integration

```typescript
// Example: Initializing keyboard navigation
async function initializeKeyboardNavigation(route, userId, sessionId) {
  // Fetch navigation state from the server
  const response = await fetch(`/accessibility/keyboard-navigation/navigation-state?route=${route}&userId=${userId}&sessionId=${sessionId}`);
  const navigationState = await response.json();
  
  // Initialize keyboard navigation with the navigation state
  const { sections, shortcuts, currentFocus } = navigationState;
  
  // Set up keyboard event listeners
  setupKeyboardShortcuts(shortcuts);
  
  // Restore focus if available
  if (currentFocus) {
    restoreFocus(currentFocus);
  }
  
  return navigationState;
}

// Example: Managing focus
function restoreFocus(focusState) {
  const { sectionId, elementId, elementSelector } = focusState;
  
  // Try to focus on the specific element if available
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      return true;
    }
  }
  
  // Try to focus on the element using selector if available
  if (elementSelector) {
    const element = document.querySelector(elementSelector);
    if (element) {
      element.focus();
      return true;
    }
  }
  
  // Fall back to focusing on the section
  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (section) {
    const focusableElement = getFocusableElement(section);
    if (focusableElement) {
      focusableElement.focus();
      return true;
    }
  }
  
  return false;
}
```

### Best Practices

1. **Consistent Section Structure**: Maintain a consistent section structure across pages to provide a predictable navigation experience.
2. **Logical Tab Order**: Ensure that the priority values of sections create a logical tab order that follows the visual flow of the page.
3. **Meaningful Section Names**: Use descriptive names for sections to help users understand where they are in the page.
4. **ARIA Integration**: Use ARIA landmarks and labels to enhance the accessibility of sections.
5. **Keyboard Shortcut Discoverability**: Provide a keyboard shortcut help page or modal to help users discover available shortcuts.
6. **Focus Indicators**: Ensure that focused elements have a visible focus indicator.
7. **Avoid Keyboard Traps**: Ensure that users can navigate out of any section using the keyboard.
8. **Test with Screen Readers**: Regularly test the keyboard navigation system with screen readers to ensure compatibility.

## Testing & Compliance

### Automated Testing

The accessibility features include automated tests to ensure they function correctly:

- **Unit Tests**: Test individual components and services.
- **Integration Tests**: Test the integration between components.
- **End-to-End Tests**: Test the complete user flow.

### Manual Testing

Regular manual testing should be performed with:

- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Keyboard-Only Navigation**: Testing without a mouse
- **Browser Extensions**: axe, WAVE, Lighthouse

### Compliance Standards

The accessibility features are designed to meet the following standards:

- **WCAG 2.1 AA**: Web Content Accessibility Guidelines
- **Section 508**: US federal regulations
- **ADA**: Americans with Disabilities Act
- **EAA**: European Accessibility Act

## Future Enhancements

1. **Advanced Focus Management**: Implement more sophisticated focus management for complex UI components like modals and dropdown menus.
2. **User Preference Profiles**: Allow users to save and load different keyboard shortcut profiles.
3. **Keyboard Navigation Tutorial**: Create an interactive tutorial to help users learn keyboard navigation.
4. **Voice Command Integration**: Integrate with voice command systems for hands-free navigation.
5. **Accessibility Analytics**: Track keyboard navigation usage to identify areas for improvement.
6. **Expanded Alt Text Coverage**: Enhance alt text generation with more detailed descriptions and context awareness.
7. **ARIA Live Regions**: Implement ARIA live regions for dynamic content updates.
8. **Skip Links**: Add skip links to bypass repetitive navigation.

## Support

For questions or issues related to the accessibility features, please contact the development team or file an issue in the project repository.
