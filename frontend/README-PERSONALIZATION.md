# Avnu Marketplace: Netflix-Style Personalization Implementation

## Overview
This document outlines the implementation of a robust, production-ready personalization system for the Avnu Marketplace. The system tracks user behavior (viewed products and categories) using localStorage, generates personalized product recommendations for vertical sections (especially "For You"), and supports infinite scroll loading—ultimately delivering a Netflix-like, vertically personalized shopping experience.

## Key Features Implemented

### 1. Personalization Service
- Created a comprehensive singleton service in `/src/services/personalization.ts`
- Tracks user interactions:
  - Product views with dwell time
  - Category views
  - Favorite products
  - Inferred preferences (recency, frequency, favorites, category/brand/attribute affinity)
- Stores all data in `localStorage` (with easy extension to backend)
- Provides methods to generate and paginate recommendations
- Supports infinite scroll loading

### 2. Product Card Consistency
- Achieved perfectly uniform product card heights across all vertical sections
- Removed animation wrappers that caused layout shifts
- Enforced strict CSS containment and explicit sizing (360px height)
- Used minimal DOM structure and client-side price rendering
- Added visual enhancements inspired by Netflix/Airbnb:
  - Subtle card hover elevation and image zoom
  - Interactive favorite (heart) button
  - Quick view button on hover
  - Trust indicators (verified badge, rating stars)
  - Improved typography and visual hierarchy

### 3. Color Palette Personalization
- Created a `ThemeContext` and `ThemeProvider` using React Context and CSS variables
- Built `/account/settings` page for palette selection and live preview
- Persisted palette choice in `localStorage` (with backend integration planned)
- Updated navigation to include a link to settings
- Designed system for easy extension to iOS/Android apps

### 4. Vertical Personalization Logic
- Integrated personalization service with `PersonalizedGrid` for the "For You" section
- Implemented infinite scroll for continuous discovery
- Added empty state handling for new users
- Integrated with product detail page to track views and favorites
- Created a system that adapts to user behavior over time

## Technical Implementation

### Files Modified/Created:
- **ConsistentProductCard.tsx**: Enhanced with hover, favorite, quick view, and trust indicators
- **PersonalizedGrid.tsx**: Uses personalization service for recommendations and infinite scroll
- **ThemeContext.tsx**: Provides palette switching and CSS variable injection
- **Account Settings Page**: Lets users preview and select color palettes
- **Navigation.tsx**: Updated to include a "Settings" link
- **personalization.ts**: Full logic for tracking, scoring, and recommending products
- **Product Detail Page**: Tracks product/category views, dwell time, and favoriting
- **globals.css/theme.css**: Updated to support CSS variable-based theming

### Design Decisions:
- **Strict Height Enforcement**: All product cards use explicit 360px height and CSS containment
- **No Animation Wrappers**: Removed framer-motion/ScrollItem wrappers from product grids
- **Client-Side Interactive Elements**: Prevents hydration mismatches
- **Personalization Data**: Stored in `localStorage` with easy extension to backend
- **Palette System**: Uses semantic color tokens for expansion and accessibility

## Next Steps
1. **Backend Integration**: Store theme and personalization data in user profile
2. **Mobile App Integration**: Implement theme and personalization in iOS/Android apps
3. **A/B Testing**: Test different card interaction patterns and color palettes
4. **Analytics**: Add analytics for palette selection and recommendation clicks
5. **Accessibility**: Test all palettes for color contrast and accessibility
6. **Performance**: Monitor infinite scroll and personalization for large datasets

## Technical Notes
- Built with Next.js 14, Tailwind CSS, Framer Motion, Heroicons
- All theming via CSS variables
- Personalization data in localStorage (browser only for now)
- All changes are compatible with future backend/mobile integrations
