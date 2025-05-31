# av | nu Marketplace - Developer Documentation

## Overview

av | nu Marketplace is a sophisticated e-commerce platform focused on independent brands, designed with a modern, minimalist aesthetic. The platform emphasizes brand storytelling, product discovery, and a seamless shopping experience.

![av | nu Marketplace](https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&q=80&fit=crop&w=1200)

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── brands/         # Brand-related components
│   ├── cart/           # Shopping cart components
│   ├── common/         # Shared utility components
│   ├── home/           # Homepage components
│   ├── layout/         # Layout components (header, footer)
│   ├── products/       # Product-related components
│   └── search/         # Search and filtering components
├── data/               # Mock data for development
│   ├── brands/         # Brand data
│   ├── interests/      # User interests data
│   └── products/       # Product data
├── pages/              # Next.js pages
│   ├── account/        # User account pages
│   ├── brand/          # Brand pages
│   ├── product/        # Product pages
│   └── ...             # Other pages
└── types/              # TypeScript type definitions
```

## Key Features

### 1. Brand Showcase

The platform highlights independent brands with dedicated brand pages that tell their story, showcase their values, and display their products.

**Key Components:**
- `BrandCard.tsx`: Displays brand preview cards
- `[brandId].tsx`: Dynamic brand detail page

### 2. Product Discovery

Users can discover products through various entry points: browsing, search, filtering, and recommendations.

**Key Components:**
- `ProductCard.tsx`: Displays product preview cards
- `ProductGrid.tsx`: Arranges products in a responsive grid
- `[productId].tsx`: Dynamic product detail page
- `FilterPanel.tsx`: Provides filtering options

### 3. Shopping Experience

The platform offers a seamless shopping experience with an interactive cart and streamlined checkout process.

**Key Components:**
- `CartDropdown.tsx`: Animated cart dropdown with brand grouping
- `checkout.tsx`: Multi-step checkout process
- `order-confirmation.tsx`: Order confirmation page

### 4. User Account Management

Users can manage their profile, favorites, orders, and settings.

**Key Components:**
- `account/index.tsx`: User profile management
- `favorites.tsx`: User's favorited products
- `Header.tsx`: Contains user dropdown menu

### 5. Brand Application

Brands can apply to join the marketplace through a comprehensive application form.

## Development Tools

### Cart Testing

The marketplace includes built-in tools for testing cart and checkout functionality during development, eliminating the need for actual product data.

**Key Components:**
- `CartTester.tsx`: A development-only component that provides buttons to add mock products to the cart
- `mockData.ts`: Contains mock product data for testing the cart and checkout flow

**Usage:**
1. The CartTester component is automatically available on the checkout page in development mode (`process.env.NODE_ENV !== 'production'`).
2. Use the buttons to add random products or specific mock products to test the cart functionality.
3. Navigate through the checkout process to test the full flow with mock data.

**Implementation Details:**
- Mock products include all necessary fields to satisfy TypeScript requirements
- The CartTester integrates with the real `useCart` hook, providing a realistic testing experience
- Shipping calculations work with mock data just as they would with real products

**Key Components:**
- `for-brands.tsx`: Brand application page

## Design System

### Colors

- **Primary**: Sage (`#7C9082`)
- **Text**: Charcoal (`#333333`)
- **Background**: Warm White (`#F9F7F3`)
- **Accents**: Teal (`#4D7C8A`), Neutral Gray (`#9CA3AF`)

### Typography

- **Headings**: Montserrat (font-montserrat)
- **Body**: Inter (font-inter)

### Components

The design system includes consistent styling for:
- Buttons (primary, secondary, text)
- Cards (product, brand)
- Form elements
- Navigation
- Modals and dropdowns

## State Management

The application uses React's Context API and hooks for state management:

- **Local Component State**: useState for component-specific state
- **Shared State**: useContext for cart, user preferences, etc.
- **Side Effects**: useEffect for data fetching, animations, etc.

## Data Flow

1. **Mock Data**: The prototype uses mock data stored in `/src/data/`
2. **Data Fetching**: In a production environment, data would be fetched from APIs
3. **Static Generation**: Product and brand pages use Next.js static generation
4. **Client-side Updates**: Cart and user preferences are managed client-side

## Animation System

Animations are implemented using Framer Motion:

- Page transitions
- Element animations (hover, tap)
- Loading states
- Micro-interactions

## Future Development

### API Integration

Replace mock data with actual API endpoints:
- Product catalog API
- User authentication API
- Order management API
- Brand management API

### Authentication

Implement a complete authentication system:
- User registration and login
- Social authentication
- Password reset
- Session management

### Payment Processing

Integrate payment gateways:
- Stripe
- PayPal
- Apple Pay / Google Pay

## Best Practices

### Code Style

- Use TypeScript for type safety
- Follow component-based architecture
- Maintain consistent naming conventions
- Document complex functions and components

### Performance

- Optimize images with Next.js Image component
- Use code splitting and lazy loading
- Implement proper caching strategies
- Minimize unnecessary re-renders

### Accessibility

- Use semantic HTML
- Ensure proper keyboard navigation
- Maintain sufficient color contrast
- Provide alternative text for images

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check for TypeScript errors
   - Verify file paths are correct

2. **Styling Issues**
   - Confirm Tailwind classes are correct
   - Check for CSS conflicts
   - Verify responsive design breakpoints

3. **State Management**
   - Check for state initialization
   - Verify state updates are triggering re-renders
   - Look for race conditions in async operations

## Contributing

1. Follow the established code style and architecture
2. Create descriptive commit messages
3. Document new features and components
4. Test across different devices and browsers

---

© 2025 av | nu Marketplace. All rights reserved.
