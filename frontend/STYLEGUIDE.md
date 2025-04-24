# av | nu Marketplace - Style Guide

## Brand Identity

### Brand Name
- **Correct Usage**: av | nu
- **Capitalization**: Always lowercase with a vertical bar separator
- **Spacing**: No spaces between characters and the vertical bar

### Brand Values
- Minimalism
- Sustainability
- Independence
- Craftsmanship
- Authenticity
- Community

## Color Palette

### Primary Colors
- **Sage** `#7C9082` - Primary brand color, used for buttons, accents, and key UI elements
- **Warm White** `#F9F7F3` - Background color, provides a soft, warm canvas
- **Charcoal** `#333333` - Primary text color, provides strong contrast on light backgrounds

### Secondary Colors
- **Teal** `#4D7C8A` - Secondary accent color, used for highlights and secondary actions
- **Terracotta** `#C67D63` - Accent color for special elements and calls to action
- **Neutral Gray** `#9CA3AF` - Used for subtle elements, borders, and disabled states

### Functional Colors
- **Success** `#4F8A70` - Indicates successful actions or positive status
- **Warning** `#E9B949` - Indicates warnings or items needing attention
- **Error** `#B95C50` - Indicates errors or destructive actions

## Typography

### Font Families
- **Montserrat** - Used for headings, buttons, and navigation
- **Inter** - Used for body text, form elements, and smaller UI elements

### Font Weights
- **Light** (300) - Used for large display text
- **Regular** (400) - Default for body text
- **Medium** (500) - Used for emphasis and subheadings
- **Semibold** (600) - Used for buttons and important UI elements
- **Bold** (700) - Used for main headings and strong emphasis

### Font Sizes
- **xs** `0.75rem` (12px) - Very small text, footnotes
- **sm** `0.875rem` (14px) - Small text, captions
- **base** `1rem` (16px) - Default body text
- **lg** `1.125rem` (18px) - Larger body text
- **xl** `1.25rem` (20px) - Small headings
- **2xl** `1.5rem` (24px) - Medium headings
- **3xl** `1.875rem` (30px) - Large headings
- **4xl** `2.25rem` (36px) - Extra large headings
- **5xl** `3rem` (48px) - Display headings

### Line Heights
- **tight** `1.25` - Used for headings
- **normal** `1.5` - Used for body text
- **relaxed** `1.75` - Used for larger blocks of text

## Spacing System

The spacing system uses a 4px (0.25rem) base unit.

- **0** `0` - No spacing
- **1** `0.25rem` (4px) - Tiny spacing
- **2** `0.5rem` (8px) - Extra small spacing
- **3** `0.75rem` (12px) - Small spacing
- **4** `1rem` (16px) - Default spacing
- **5** `1.25rem` (20px) - Medium spacing
- **6** `1.5rem` (24px) - Large spacing
- **8** `2rem` (32px) - Extra large spacing
- **10** `2.5rem` (40px) - Huge spacing
- **12** `3rem` (48px) - Giant spacing
- **16** `4rem` (64px) - Massive spacing

## Border Radius

- **none** `0` - No rounding
- **sm** `0.125rem` (2px) - Slight rounding
- **DEFAULT** `0.25rem` (4px) - Default rounding
- **md** `0.375rem` (6px) - Medium rounding
- **lg** `0.5rem` (8px) - Large rounding
- **xl** `0.75rem` (12px) - Extra large rounding
- **2xl** `1rem` (16px) - Double extra large rounding
- **full** `9999px` - Fully rounded (circles or pills)

## Shadows

- **sm** `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Subtle shadow
- **DEFAULT** `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)` - Default shadow
- **md** `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` - Medium shadow
- **lg** `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` - Large shadow
- **xl** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` - Extra large shadow

## UI Components

### Buttons

#### Primary Button
```html
<button class="bg-sage text-white px-4 py-2 rounded-full font-montserrat hover:bg-sage/90 transition-colors">
  Primary Button
</button>
```

#### Secondary Button
```html
<button class="border-2 border-sage text-sage px-4 py-2 rounded-full font-montserrat hover:bg-sage hover:text-white transition-colors">
  Secondary Button
</button>
```

#### Text Button
```html
<button class="text-sage font-montserrat hover:underline transition-colors">
  Text Button
</button>
```

#### Disabled Button
```html
<button class="bg-neutral-gray text-white px-4 py-2 rounded-full font-montserrat cursor-not-allowed" disabled>
  Disabled Button
</button>
```

### Form Elements

#### Text Input
```html
<input 
  type="text" 
  class="w-full px-4 py-2 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
  placeholder="Enter text"
/>
```

#### Select Input
```html
<select class="w-full px-4 py-2 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent">
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

#### Checkbox
```html
<label class="flex items-center">
  <input type="checkbox" class="form-checkbox h-5 w-5 text-sage rounded focus:ring-sage" />
  <span class="ml-2">Checkbox Label</span>
</label>
```

#### Radio Button
```html
<label class="flex items-center">
  <input type="radio" class="form-radio h-5 w-5 text-sage focus:ring-sage" />
  <span class="ml-2">Radio Button Label</span>
</label>
```

### Cards

#### Product Card
```html
<div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
  <div class="relative aspect-square">
    <img src="product-image.jpg" alt="Product Name" class="object-cover w-full h-full" />
  </div>
  <div class="p-4">
    <h3 class="font-montserrat font-medium text-lg text-charcoal">Product Name</h3>
    <p class="text-sage font-montserrat font-semibold mt-1">$99.00</p>
    <p class="text-neutral-gray text-sm mt-1">Brand Name</p>
  </div>
</div>
```

#### Brand Card
```html
<div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
  <div class="relative h-40">
    <img src="brand-cover.jpg" alt="Brand Name" class="object-cover w-full h-full" />
    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
      <h3 class="font-montserrat font-semibold text-xl text-white">Brand Name</h3>
    </div>
  </div>
  <div class="p-4">
    <p class="text-neutral-gray text-sm">Location</p>
    <p class="text-charcoal mt-2">Short brand description goes here.</p>
  </div>
</div>
```

## Icons

### Icon Usage
- Use Heroicons for consistency across the application
- Icons should be sized appropriately for their context
- Icons should have appropriate accessibility attributes

### Icon Examples
```html
<!-- Small Icon -->
<svg class="w-4 h-4 text-sage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <!-- Icon path -->
</svg>

<!-- Medium Icon -->
<svg class="w-6 h-6 text-sage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <!-- Icon path -->
</svg>

<!-- Large Icon -->
<svg class="w-8 h-8 text-sage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <!-- Icon path -->
</svg>
```

## Animation Guidelines

### Transition Durations
- **Fast** `150ms` - Quick interactions (hover, focus)
- **Default** `300ms` - Standard transitions (modals, dropdowns)
- **Slow** `500ms` - Elaborate animations (page transitions)

### Easing Functions
- **Default** `ease-in-out` - Smooth acceleration and deceleration
- **In** `ease-in` - Slow start, fast end
- **Out** `ease-out` - Fast start, slow end
- **Linear** `linear` - Constant speed

### Animation Examples with Framer Motion

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Slide In
```tsx
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Scale
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.15 }}
>
  Interactive Element
</motion.div>
```

## Layout Guidelines

### Container Widths
- **sm** `640px` - Small screens
- **md** `768px` - Medium screens
- **lg** `1024px` - Large screens
- **xl** `1280px` - Extra large screens
- **2xl** `1536px` - Double extra large screens

### Grid System
- Use Tailwind's grid system for layouts
- Default gap of `4` (1rem, 16px)
- Responsive columns based on screen size

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- Grid items -->
</div>
```

### Spacing Guidelines
- Use consistent spacing based on the spacing system
- Maintain vertical rhythm with consistent spacing between sections
- Use appropriate padding for containers based on screen size

```html
<section class="py-12 md:py-16 lg:py-20">
  <div class="container mx-auto px-4">
    <!-- Section content -->
  </div>
</section>
```

## Responsive Breakpoints

- **sm** `640px` - Small screens (mobile landscape)
- **md** `768px` - Medium screens (tablets)
- **lg** `1024px` - Large screens (desktops)
- **xl** `1280px` - Extra large screens (large desktops)
- **2xl** `1536px` - Double extra large screens (very large desktops)

## Accessibility Guidelines

### Color Contrast
- Maintain a minimum contrast ratio of 4.5:1 for normal text
- Maintain a minimum contrast ratio of 3:1 for large text
- Use the WebAIM contrast checker to verify contrast ratios

### Focus States
- All interactive elements should have visible focus states
- Do not remove outline without providing an alternative focus indicator

```html
<button class="focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2">
  Accessible Button
</button>
```

### Screen Reader Text
- Provide text alternatives for visual elements
- Use aria-label for elements without visible text

```html
<button aria-label="Close modal">
  <svg><!-- X icon --></svg>
</button>
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Maintain a logical tab order
- Provide skip links for main content

## Writing Style

### Voice and Tone
- **Voice**: Friendly, knowledgeable, and approachable
- **Tone**: Warm, inclusive, and conversational

### Headings
- Use sentence case for headings (capitalize first word only)
- Keep headings concise and descriptive
- Use appropriate heading levels (h1, h2, h3) for hierarchy

### Body Text
- Use clear, concise language
- Avoid jargon and technical terms when possible
- Use active voice rather than passive voice
- Keep paragraphs short and focused

### Button Text
- Use action verbs for button text
- Keep button text short and descriptive
- Use sentence case for button text

## Image Guidelines

### Product Images
- Use consistent aspect ratios (1:1 for product thumbnails)
- Ensure images are high quality and properly compressed
- Use descriptive alt text for accessibility

### Brand Images
- Use consistent aspect ratios for brand covers (16:9 recommended)
- Ensure logo images have transparent backgrounds
- Use appropriate image formats (SVG for logos, JPEG/WebP for photos)

## Implementation Notes

This style guide is implemented using Tailwind CSS. The custom theme configuration can be found in the `tailwind.config.js` file.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        sage: '#7C9082',
        'warm-white': '#F9F7F3',
        charcoal: '#333333',
        teal: '#4D7C8A',
        terracotta: '#C67D63',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  // Other Tailwind configuration
};
```

---

This style guide serves as a reference for maintaining consistent design and user experience across the av | nu Marketplace. It should be used in conjunction with the component library and design system to ensure a cohesive product.
