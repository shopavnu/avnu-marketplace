# av | nu Marketplace - Architecture Documentation

## Architecture Overview

The av | nu Marketplace is built on a component-based architecture using Next.js, with a clear separation of concerns between data, presentation, and business logic.

![Architecture Diagram](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&q=80&fit=crop&w=1200)

## Core Architecture Principles

1. **Component-Based Design**: UI elements are broken down into reusable components
2. **Type Safety**: TypeScript is used throughout for type checking and code quality
3. **Responsive Design**: All components adapt to different screen sizes
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with JS
5. **Accessibility First**: Components are designed with accessibility in mind

## Directory Structure Explained

### `/src/components`

Components are organized by domain and functionality:

- **Layout Components**: Define the overall structure of the application
  - `Header.tsx`: Main navigation and user controls
  - `Layout.tsx`: Wraps all pages with common elements
  - `Navigation.tsx`: Main navigation menu

- **Feature Components**: Implement specific features
  - `CartDropdown.tsx`: Shopping cart functionality
  - `ProductCard.tsx`: Product display
  - `BrandCard.tsx`: Brand display

- **Common Components**: Shared across features
  - `ClientOnly.tsx`: Ensures components only render on the client

### `/src/pages`

Pages follow Next.js conventions:

- **Static Pages**: About, Home
- **Dynamic Pages**: 
  - `[productId].tsx`: Product detail pages
  - `[brandId].tsx`: Brand detail pages
- **Functional Pages**:
  - `checkout.tsx`: Checkout process
  - `account/index.tsx`: User account management
  - `for-brands.tsx`: Brand application

### `/src/types`

Type definitions are centralized and organized by domain:

- `brand.ts`: Brand-related types
- `products/index.ts`: Product-related types
- `home/index.ts`: Homepage-specific types

### `/src/data`

Mock data for development:

- `brands/index.ts`: Brand data
- `products/index.ts`: Product data
- `interests/index.ts`: User interest data

## Data Flow

### Component Data Flow

1. **Props Down**: Data flows from parent to child components via props
2. **Events Up**: Child components communicate with parents via callbacks
3. **Context When Needed**: Shared state is managed via React Context

### Page Data Flow

1. **Static Generation**: Product and brand pages use `getStaticProps` and `getStaticPaths`
2. **Client-Side Data**: User-specific data is fetched client-side
3. **Form Submissions**: Form data is validated client-side before submission

## State Management

### Local Component State

```tsx
// Example of local component state
const [isOpen, setIsOpen] = useState(false);
```

### Shared Application State

In a production environment, a more robust state management solution would be implemented:

```tsx
// Example of a context provider
export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Cart operations
  const addToCart = (product: Product, quantity: number) => {
    // Implementation
  };
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
```

## Component Patterns

### Presentational Components

Focus on UI with minimal logic:

```tsx
// Example of a presentational component
const ProductImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="relative aspect-square overflow-hidden rounded-lg">
    <Image src={src} alt={alt} fill className="object-cover" />
  </div>
);
```

### Container Components

Manage data and state:

```tsx
// Example of a container component
const ProductListContainer: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch products
    setProducts(/* data */);
    setIsLoading(false);
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  
  return <ProductGrid products={products} />;
};
```

### Compound Components

Used for complex UI elements:

```tsx
// Example of compound components
const Tabs = {
  Container: ({ children }: PropsWithChildren) => (
    <div className="tabs-container">{children}</div>
  ),
  Tab: ({ label, isActive, onClick }: TabProps) => (
    <button 
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  ),
  Content: ({ children }: PropsWithChildren) => (
    <div className="tab-content">{children}</div>
  )
};
```

## Styling Architecture

### Tailwind CSS

The project uses Tailwind CSS for utility-first styling:

```tsx
// Example of Tailwind styling
<button className="bg-sage text-white px-4 py-2 rounded-full hover:bg-sage/90 transition-colors">
  Add to Cart
</button>
```

### Component-Specific Styles

For complex components, styles are organized using Tailwind's component classes:

```tsx
// Example of component-specific styling
const buttonClasses = {
  base: "px-4 py-2 rounded-full transition-colors",
  primary: "bg-sage text-white hover:bg-sage/90",
  secondary: "border-2 border-sage text-sage hover:bg-sage hover:text-white",
  disabled: "bg-gray-300 text-gray-500 cursor-not-allowed"
};

const Button: React.FC<ButtonProps> = ({ variant = "primary", disabled, children }) => (
  <button 
    className={`${buttonClasses.base} ${buttonClasses[variant]} ${disabled ? buttonClasses.disabled : ''}`}
    disabled={disabled}
  >
    {children}
  </button>
);
```

## Animation Architecture

### Framer Motion Integration

Animations are implemented using Framer Motion:

```tsx
// Example of animation with Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### Animation Variants

For consistent animations across components:

```tsx
// Example of animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

## Routing Architecture

### Next.js Pages Router

The application uses Next.js Pages Router:

- **Static Routes**: `/about`, `/shop`
- **Dynamic Routes**: `/product/[productId]`, `/brand/[brandId]`
- **Nested Routes**: `/account/orders`, `/account/settings`

### Navigation Patterns

```tsx
// Example of navigation with Next.js Link
<Link href={`/product/${product.id}`} className="block">
  <ProductCard product={product} />
</Link>
```

## Form Handling

### Form State Management

```tsx
// Example of form state management
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

### Form Validation

```tsx
// Example of form validation
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name) newErrors.name = 'Name is required';
  if (!formData.email) newErrors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## Error Handling

### Component Error Boundaries

```tsx
// Example of error boundary
class ErrorBoundary extends React.Component<PropsWithChildren, { hasError: boolean }> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-fallback">Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### API Error Handling

```tsx
// Example of API error handling
const fetchData = async () => {
  try {
    setIsLoading(true);
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    setProducts(data);
  } catch (error) {
    setError('Failed to fetch products');
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
```

## Performance Considerations

### Code Splitting

Next.js handles code splitting automatically for pages. For components:

```tsx
// Example of dynamic import for components
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Memoization

```tsx
// Example of memoization
const MemoizedComponent = React.memo(({ data }) => {
  // Component implementation
});

// Example of useMemo
const expensiveCalculation = useMemo(() => {
  return data.map(item => complexOperation(item));
}, [data]);
```

### Image Optimization

```tsx
// Example of image optimization with Next.js
<Image
  src={product.image}
  alt={product.title}
  width={400}
  height={400}
  placeholder="blur"
  blurDataURL={product.blurDataUrl}
  priority={isPriority}
/>
```

## Testing Strategy

### Component Testing

```tsx
// Example of component test
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      title: 'Test Product',
      price: 99.99,
      // Other properties
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

### Integration Testing

```tsx
// Example of integration test
describe('Cart Functionality', () => {
  it('adds product to cart when Add to Cart button is clicked', async () => {
    render(<ProductPage product={mockProduct} />);
    
    await userEvent.click(screen.getByText('Add to Cart'));
    
    expect(screen.getByText('Item added to cart')).toBeInTheDocument();
  });
});
```

## Deployment Architecture

### Next.js Deployment

The application is designed to be deployed on Vercel or similar platforms that support Next.js:

- **Static Generation**: Most pages are statically generated at build time
- **Server-Side Rendering**: Some pages may use SSR for dynamic content
- **API Routes**: Future implementation will include Next.js API routes

### Environment Configuration

```
# Example .env.local file
NEXT_PUBLIC_API_URL=https://api.avnu.com
NEXT_PUBLIC_IMAGE_DOMAIN=images.avnu.com
```

## Future Architecture Considerations

### API Integration

The current prototype uses mock data. Future implementation will integrate with backend APIs:

```tsx
// Example of API integration
const fetchProducts = async () => {
  const response = await fetch('/api/products');
  const data = await response.json();
  return data;
};

export const getStaticProps: GetStaticProps = async () => {
  const products = await fetchProducts();
  
  return {
    props: {
      products
    },
    revalidate: 60 // Revalidate every minute
  };
};
```

### Authentication

```tsx
// Example of authentication context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    // Implementation
  };
  
  const logout = async () => {
    // Implementation
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Internationalization

```tsx
// Example of i18n implementation
import { useRouter } from 'next/router';
import en from '../locales/en';
import fr from '../locales/fr';

const useTranslation = () => {
  const router = useRouter();
  const { locale } = router;
  const translations = locale === 'fr' ? fr : en;
  
  return {
    t: (key: string) => {
      return translations[key] || key;
    },
    locale
  };
};
```

---

This architecture documentation provides a comprehensive overview of the av | nu Marketplace's technical implementation, design patterns, and future considerations. It serves as a guide for developers to understand the codebase structure and make consistent additions or modifications.
