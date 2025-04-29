# Accessibility Module

## Overview

The Accessibility Module provides comprehensive accessibility features for the Avnu Marketplace platform, including:

1. **Keyboard Navigation**: Server-side section mapping, focus state persistence, and customizable keyboard shortcuts
2. **Alt Text Generation**: Automatic generation of alt text for product images (implemented in the Products module)
3. **ARIA Metadata**: Generation of ARIA attributes for better screen reader support
4. **Structured Data**: Schema.org-compliant structured data for improved SEO and accessibility

## Module Structure

```
accessibility/
├── accessibility.module.ts        # Main module definition
├── keyboard-navigation/           # Keyboard navigation sub-module
│   ├── keyboard-navigation.module.ts
│   ├── entities/                  # Database entities
│   │   ├── navigation-section.entity.ts
│   │   ├── focus-state.entity.ts
│   │   └── keyboard-shortcut.entity.ts
│   ├── services/                  # Business logic
│   │   ├── keyboard-navigation.service.ts
│   │   ├── section-mapping.service.ts
│   │   ├── focus-state.service.ts
│   │   └── keyboard-shortcut.service.ts
│   ├── controllers/               # REST API endpoints
│   │   └── keyboard-navigation.controller.ts
│   └── resolvers/                 # GraphQL API endpoints
│       └── keyboard-navigation.resolver.ts
└── README.md                      # This file
```

## Getting Started

### Installation

The Accessibility Module is already included in the main application. To use it in your code:

```typescript
import { AccessibilityModule } from './modules/accessibility/accessibility.module';

@Module({
  imports: [
    // ...other modules
    AccessibilityModule,
  ],
})
export class AppModule {}
```

### Configuration

The module uses the following environment variables:

- `ENABLE_ALT_TEXT_GENERATION` (boolean): Enables/disables AI-based alt text generation
- `AI_VISION_API_KEY`: API key for the external vision API
- `AI_VISION_ENDPOINT`: Endpoint URL for the external vision API
- `PUBLIC_BASE_URL`: Used for generating structured data URLs

## Usage

### Keyboard Navigation

#### Server-Side Section Mapping

```typescript
import { SectionMappingService } from './modules/accessibility/keyboard-navigation/services/section-mapping.service';

@Injectable()
export class YourService {
  constructor(private readonly sectionMappingService: SectionMappingService) {}

  async definePageSections() {
    // Create a new navigation section
    await this.sectionMappingService.createSection({
      name: 'Main Content',
      route: '/products',
      selector: '#main-content',
      priority: 30,
      description: 'Main content area',
      ariaLabel: 'Main content',
      isActive: true,
    });
  }
}
```

#### Focus State Management

```typescript
import { FocusStateService } from './modules/accessibility/keyboard-navigation/services/focus-state.service';

@Injectable()
export class YourService {
  constructor(private readonly focusStateService: FocusStateService) {}

  async saveFocus(userId: string, sessionId: string, route: string) {
    // Save focus state
    await this.focusStateService.saveFocusState({
      userId,
      sessionId,
      route,
      sectionId: 'section-123',
      elementId: 'product-456',
      elementSelector: '#product-456',
      context: JSON.stringify({ scrollY: 200 }),
      isActive: true,
    });
  }
}
```

#### Keyboard Shortcut Management

```typescript
import { KeyboardShortcutService } from './modules/accessibility/keyboard-navigation/services/keyboard-shortcut.service';

@Injectable()
export class YourService {
  constructor(private readonly keyboardShortcutService: KeyboardShortcutService) {}

  async createShortcut() {
    // Create a new keyboard shortcut
    await this.keyboardShortcutService.createShortcut({
      name: 'Skip to Main Content',
      description: 'Focuses the main content area',
      shortcutKey: {
        key: 'm',
        altKey: true,
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
      },
      action: 'focusSection:main-content',
      isGlobal: true,
      isActive: true,
    });
  }
}
```

### Accessibility Service (in Products Module)

The `AccessibilityService` is implemented in the Products module and provides alt text generation, ARIA metadata, and structured data for products.

```typescript
import { AccessibilityService } from './modules/products/services/accessibility.service';

@Injectable()
export class YourService {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  async generateAltText(productId: string) {
    // Generate alt text for a product's images
    const result = await this.accessibilityService.generateAltTextForProduct(productId);
    return result;
  }

  async getAriaAttributes(productId: string) {
    // Get ARIA attributes for a product
    const ariaAttributes = await this.accessibilityService.getProductAriaAttributes(productId);
    return ariaAttributes;
  }

  async getStructuredData(productId: string) {
    // Get structured data for a product
    const structuredData = await this.accessibilityService.getProductStructuredData(productId);
    return structuredData;
  }
}
```

## API Reference

For a complete API reference, see the [Accessibility Documentation](/docs/accessibility.md).

## Testing

### Unit Tests

Run unit tests for the Accessibility Module:

```bash
npm run test -- --testPathPattern=src/modules/accessibility
```

### E2E Tests

Run end-to-end tests for the Accessibility API:

```bash
npm run test:e2e -- --testPathPattern=accessibility
```

## Contributing

When contributing to the Accessibility Module, please follow these guidelines:

1. **Code Style**: Follow the project's TypeScript and ESLint rules
2. **Documentation**: Update documentation when adding or modifying features
3. **Testing**: Add tests for new features or bug fixes
4. **Accessibility Standards**: Ensure changes comply with WCAG 2.1 AA standards

## Resources

- [Accessibility Documentation](/docs/accessibility.md)
- [Keyboard Navigation Documentation](/docs/keyboard-navigation.md)
- [Alt Text Generation Documentation](/docs/accessibility-services.md)
