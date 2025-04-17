# av | nu Marketplace - Component Documentation

## Component Library Overview

The av | nu Marketplace uses a comprehensive component library built with React, TypeScript, and Tailwind CSS. This document provides detailed information about each component, its props, usage examples, and design considerations.

## Layout Components

### Layout

The main layout wrapper that provides consistent structure across all pages.

**File:** `/src/components/layout/Layout.tsx`

**Props:**
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Layout>
  <HomePage />
</Layout>
```

### Header

The main navigation header with logo, navigation links, search, cart, and user menu.

**File:** `/src/components/layout/Header.tsx`

**Features:**
- Logo and brand identity
- Navigation menu
- Search icon
- Shopping cart dropdown
- User profile dropdown
- Favorites link
- Mobile responsive design

**Usage:**
```tsx
// Automatically included in Layout component
<Header />
```

### Navigation

Main navigation menu with active state indicators.

**File:** `/src/components/layout/Navigation.tsx`

**Props:**
```typescript
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Navigation>
  <NavLink href="/">Home</NavLink>
  <NavLink href="/shop">Shop</NavLink>
  <NavLink href="/brand">Brands</NavLink>
  <NavLink href="/about">About</NavLink>
</Navigation>
```

## Product Components

### ProductCard

Displays a product preview with image, title, price, and interactive elements.

**File:** `/src/components/products/ProductCard.tsx`

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
}
```

**Features:**
- Product image with hover effect
- Title and price
- Vendor information
- Rating display
- New product badge
- Free shipping indicator
- Favorite button toggle
- Cause/value icons

**Usage:**
```tsx
<ProductCard product={product} />
```

### ProductGrid

Arranges products in a responsive grid layout.

**File:** `/src/components/products/ProductGrid.tsx`

**Props:**
```typescript
interface ProductGridProps {
  products: Product[];
}
```

**Usage:**
```tsx
<ProductGrid products={products} />
```

## Brand Components

### BrandCard

Displays a brand preview with logo, name, and key information.

**File:** `/src/components/brands/BrandCard.tsx`

**Props:**
```typescript
interface BrandCardProps {
  brand: Brand;
}
```

**Features:**
- Brand cover image
- Logo overlay
- Brand name and description
- Location indicator
- Rating display
- Value/cause tags

**Usage:**
```tsx
<BrandCard brand={brand} />
```

## Cart Components

### CartDropdown

Interactive shopping cart dropdown with brand grouping and shipping progress.

**File:** `/src/components/cart/CartDropdown.tsx`

**Props:**
```typescript
interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Animated entrance/exit
- Products grouped by brand
- Quantity controls
- Free shipping progress bars
- Subtotal and total calculation
- Proceed to checkout button
- Empty cart state

**Usage:**
```tsx
<CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
```

### FreeShippingProgressBar

Displays progress toward free shipping threshold for a brand.

**File:** `/src/components/cart/CartDropdown.tsx` (nested component)

**Props:**
```typescript
interface FreeShippingProgressBarProps {
  brandName: string;
  currentAmount: number;
  threshold: number;
}
```

**Usage:**
```tsx
<FreeShippingProgressBar 
  brandName="Terra & Clay"
  currentAmount={35.00}
  threshold={50.00}
/>
```

## Search Components

### SearchBar

Search input with suggestions and recent searches.

**File:** `/src/components/search/SearchBar.tsx`

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
}
```

**Features:**
- Input field with clear button
- Search suggestions dropdown
- Recent searches display
- Search history management

**Usage:**
```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  suggestions={searchSuggestions}
  recentSearches={recentSearches}
/>
```

### FilterPanel

Product filtering sidebar with various filter options.

**File:** `/src/components/search/FilterPanel.tsx`

**Props:**
```typescript
interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}
```

**Features:**
- Category filters
- Price range slider
- Brand filters
- Cause/value filters
- Rating filters
- Clear filters button

**Usage:**
```tsx
<FilterPanel
  filters={filters}
  onChange={setFilters}
/>
```

## Home Components

### HeroMasonry

Hero section with masonry grid of product/brand images and call-to-action.

**File:** `/src/components/home/HeroMasonry.tsx`

**Features:**
- Masonry grid layout
- Animated entrance
- Hover effects on items
- Call-to-action buttons
- Responsive design

**Usage:**
```tsx
<HeroMasonry />
```

### SearchSection

Featured search section on the homepage.

**File:** `/src/components/search/SearchSection.tsx`

**Features:**
- Search input
- Popular category chips
- Recent searches

**Usage:**
```tsx
<SearchSection />
```

## Account Components

### ProfileSection

User profile information and editing interface.

**File:** `/src/pages/account/index.tsx` (nested component)

**Props:**
```typescript
interface ProfileSectionProps {
  user: User;
  onUpdate: (userData: Partial<User>) => void;
}
```

**Features:**
- Profile picture upload
- Personal information display/edit
- Edit mode toggle
- Form validation

**Usage:**
```tsx
<ProfileSection user={user} onUpdate={handleUpdateUser} />
```

### AddressSection

User shipping addresses management.

**File:** `/src/pages/account/index.tsx` (nested component)

**Props:**
```typescript
interface AddressSectionProps {
  addresses: Address[];
  onAdd: (address: Address) => void;
  onUpdate: (id: string, address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}
```

**Features:**
- Address list display
- Add/edit/delete addresses
- Set default address
- Address form validation

**Usage:**
```tsx
<AddressSection
  addresses={addresses}
  onAdd={handleAddAddress}
  onUpdate={handleUpdateAddress}
  onDelete={handleDeleteAddress}
  onSetDefault={handleSetDefaultAddress}
/>
```

### PaymentMethodSection

User payment methods management.

**File:** `/src/pages/account/index.tsx` (nested component)

**Props:**
```typescript
interface PaymentMethodSectionProps {
  paymentMethods: PaymentMethod[];
  onAdd: (paymentMethod: PaymentMethod) => void;
  onUpdate: (id: string, paymentMethod: PaymentMethod) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}
```

**Features:**
- Payment method list display
- Add/edit/delete payment methods
- Set default payment method
- Secure display of card information

**Usage:**
```tsx
<PaymentMethodSection
  paymentMethods={paymentMethods}
  onAdd={handleAddPaymentMethod}
  onUpdate={handleUpdatePaymentMethod}
  onDelete={handleDeletePaymentMethod}
  onSetDefault={handleSetDefaultPaymentMethod}
/>
```

### OrderHistorySection

User order history display.

**File:** `/src/pages/account/index.tsx` (nested component)

**Props:**
```typescript
interface OrderHistorySectionProps {
  orders: Order[];
}
```

**Features:**
- Order list display
- Order status indicators
- Order details link
- Empty state

**Usage:**
```tsx
<OrderHistorySection orders={orders} />
```

## Utility Components

### ClientOnly

Component that only renders its children on the client-side, preventing hydration errors.

**File:** `/src/components/common/ClientOnly.tsx`

**Props:**
```typescript
interface ClientOnlyProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<ClientOnly>
  <ComponentWithClientSideLogic />
</ClientOnly>
```

## Form Components

### BrandApplicationForm

Form for brands to apply to join the marketplace.

**File:** `/src/pages/for-brands.tsx` (nested component)

**Features:**
- Business information fields
- Contact information fields
- Product category selection
- E-commerce platform selection
- Shipping options
- Brand values/causes selection
- Form validation
- Success confirmation

**Usage:**
```tsx
<BrandApplicationForm onSubmit={handleSubmitApplication} />
```

## Animation Patterns

### Fade In

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.div>
```

### Fade In Up

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.div>
```

### Stagger Children

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Scale On Hover

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {children}
</motion.div>
```

## Design Tokens

### Colors

```typescript
const colors = {
  sage: '#7C9082',
  charcoal: '#333333',
  warmWhite: '#F9F7F3',
  neutralGray: '#9CA3AF',
  teal: '#4D7C8A',
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    montserrat: 'Montserrat, sans-serif',
    inter: 'Inter, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
};
```

### Spacing

```typescript
const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  // ... and so on
};
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};
```

### Border Radius

```typescript
const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};
```

## Component Best Practices

### Composition Over Inheritance

Components are designed to be composed together rather than extended through inheritance.

**Example:**
```tsx
// Good: Composition
<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
  </CardHeader>
  <CardContent>
    <ProductDetails product={product} />
  </CardContent>
  <CardFooter>
    <AddToCartButton product={product} />
  </CardFooter>
</Card>

// Avoid: Inheritance
class ProductCard extends Card {
  render() {
    return (
      <>
        <div className="header">{this.props.product.title}</div>
        <div className="content">{this.props.product.description}</div>
        <div className="footer">
          <button>Add to Cart</button>
        </div>
      </>
    );
  }
}
```

### Props Destructuring

Props are destructured at the component level for clarity.

**Example:**
```tsx
// Good: Destructured props
const ProductCard = ({ product, onAddToCart, isFeatured }) => {
  // Component implementation
};

// Avoid: Using props object
const ProductCard = (props) => {
  const product = props.product;
  const onAddToCart = props.onAddToCart;
  // Component implementation
};
```

### Conditional Rendering

Conditional rendering is done using ternary operators or logical AND for simple cases.

**Example:**
```tsx
// Good: Ternary operator
{isLoading ? <LoadingSpinner /> : <ProductGrid products={products} />}

// Good: Logical AND for simple cases
{products.length === 0 && <EmptyState message="No products found" />}

// Avoid: Complex logic in JSX
{(() => {
  if (isLoading) return <LoadingSpinner />;
  if (products.length === 0) return <EmptyState />;
  return <ProductGrid products={products} />;
})()}
```

### Event Handling

Event handlers are defined outside of the JSX for clarity and performance.

**Example:**
```tsx
// Good: Defined outside JSX
const handleAddToCart = () => {
  // Implementation
};

return (
  <button onClick={handleAddToCart}>Add to Cart</button>
);

// Avoid: Inline arrow function
return (
  <button onClick={() => {
    // Complex implementation
  }}>Add to Cart</button>
);
```

### Memoization

Components and calculations are memoized when appropriate for performance.

**Example:**
```tsx
// Good: Memoized component
const MemoizedProductCard = React.memo(ProductCard);

// Good: Memoized calculation
const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => a.price - b.price);
}, [products]);
```

## Accessibility Guidelines

### Keyboard Navigation

All interactive elements are keyboard accessible.

**Example:**
```tsx
// Good: Keyboard accessible dropdown
const [isOpen, setIsOpen] = useState(false);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    setIsOpen(!isOpen);
  } else if (e.key === 'Escape' && isOpen) {
    setIsOpen(false);
  }
};

return (
  <div
    tabIndex={0}
    role="button"
    aria-expanded={isOpen}
    aria-haspopup="true"
    onClick={() => setIsOpen(!isOpen)}
    onKeyDown={handleKeyDown}
  >
    Dropdown
    {isOpen && <DropdownContent />}
  </div>
);
```

### ARIA Attributes

ARIA attributes are used to enhance accessibility.

**Example:**
```tsx
// Good: ARIA attributes
<button
  aria-label="Add to cart"
  aria-pressed={isInCart}
  onClick={handleAddToCart}
>
  <ShoppingCartIcon />
</button>
```

### Focus Management

Focus is managed appropriately, especially in modals and dialogs.

**Example:**
```tsx
// Good: Focus management in modal
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen && modalRef.current) {
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
}, [isOpen]);
```

### Color Contrast

All text and interactive elements have sufficient color contrast.

**Example:**
```tsx
// Good: High contrast text
<p className="text-charcoal">High contrast text</p>

// Avoid: Low contrast text
<p className="text-gray-300">Low contrast text</p>
```

## Responsive Design Patterns

### Mobile-First Approach

Components are designed with a mobile-first approach.

**Example:**
```tsx
// Good: Mobile-first design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### Responsive Typography

Typography scales appropriately across different screen sizes.

**Example:**
```tsx
// Good: Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Product Title
</h1>
```

### Flexible Layouts

Layouts adapt to different screen sizes using Flexbox and Grid.

**Example:**
```tsx
// Good: Flexible layout
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Main Content</div>
</div>
```

---

This component documentation provides a comprehensive reference for developers working with the av | nu Marketplace codebase. It covers all major components, their props, usage examples, and best practices for maintaining consistency and quality across the application.
