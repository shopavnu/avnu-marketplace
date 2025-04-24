import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';

// GraphQL mutations for tracking user interactions
const TRACK_SEARCH = gql`
  mutation TrackSearch($query: String!, $filters: JSON, $resultCount: Int) {
    trackSearch(query: $query, filters: $filters, resultCount: $resultCount)
  }
`;

const TRACK_PRODUCT_VIEW = gql`
  mutation TrackProductView($productId: String!, $referrer: String) {
    trackProductView(productId: $productId, referrer: $referrer)
  }
`;

const TRACK_ADD_TO_CART = gql`
  mutation TrackAddToCart($productId: String!, $quantity: Int) {
    trackAddToCart(productId: $productId, quantity: $quantity)
  }
`;

const TRACK_CATEGORY_CLICK = gql`
  mutation TrackCategoryClick($category: String!) {
    trackCategoryClick(category: $category)
  }
`;

const TRACK_BRAND_CLICK = gql`
  mutation TrackBrandClick($brand: String!) {
    trackBrandClick(brand: $brand)
  }
`;

// GraphQL query for personalized search
const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $query: String!
    $page: Int
    $limit: Int
    $enablePersonalization: Boolean
    $personalizationStrength: Float
  ) {
    searchProducts(
      query: $query
      page: $page
      limit: $limit
      options: {
        enablePersonalization: $enablePersonalization
        personalizationStrength: $personalizationStrength
      }
    ) {
      items {
        id
        title
        description
        price
        imageUrl
        brandName
        categories
      }
      total
      metadata {
        searchDuration
        algorithm
        personalized
        personalizationStrength
      }
    }
  }
`;

/**
 * Custom hook for tracking user interactions
 */
export const usePreferenceTracking = () => {
  const [trackSearch] = useMutation(TRACK_SEARCH);
  const [trackProductView] = useMutation(TRACK_PRODUCT_VIEW);
  const [trackAddToCart] = useMutation(TRACK_ADD_TO_CART);
  const [trackCategoryClick] = useMutation(TRACK_CATEGORY_CLICK);
  const [trackBrandClick] = useMutation(TRACK_BRAND_CLICK);
  
  return {
    trackSearch: (query: string, filters?: any, resultCount?: number) => {
      trackSearch({
        variables: { query, filters, resultCount },
        onError: (error) => console.error('Error tracking search:', error)
      });
    },
    
    trackProductView: (productId: string, referrer?: string) => {
      trackProductView({
        variables: { productId, referrer },
        onError: (error) => console.error('Error tracking product view:', error)
      });
    },
    
    trackAddToCart: (productId: string, quantity: number = 1) => {
      trackAddToCart({
        variables: { productId, quantity },
        onError: (error) => console.error('Error tracking add to cart:', error)
      });
    },
    
    trackCategoryClick: (category: string) => {
      trackCategoryClick({
        variables: { category },
        onError: (error) => console.error('Error tracking category click:', error)
      });
    },
    
    trackBrandClick: (brand: string) => {
      trackBrandClick({
        variables: { brand },
        onError: (error) => console.error('Error tracking brand click:', error)
      });
    }
  };
};

/**
 * Search component with personalization
 */
export const PersonalizedSearch: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [enablePersonalization, setEnablePersonalization] = useState(true);
  const [personalizationStrength, setPersonalizationStrength] = useState(1.0);
  const { trackSearch } = usePreferenceTracking();
  
  const { loading, error, data } = useQuery(SEARCH_PRODUCTS, {
    variables: {
      query,
      page: 1,
      limit: 10,
      enablePersonalization: isAuthenticated && enablePersonalization,
      personalizationStrength
    },
    skip: !query,
    fetchPolicy: 'network-only'
  });
  
  // Track search when results are loaded
  useEffect(() => {
    if (data && query) {
      trackSearch(query, {}, data.searchProducts.total);
    }
  }, [data, query, trackSearch]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered by the useQuery hook
  };
  
  return (
    <div className="personalized-search">
      <h2>Personalized Search</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      
      {isAuthenticated && (
        <div className="personalization-controls">
          <label>
            <input
              type="checkbox"
              checked={enablePersonalization}
              onChange={(e) => setEnablePersonalization(e.target.checked)}
            />
            Enable personalization
          </label>
          
          {enablePersonalization && (
            <div className="strength-slider">
              <label>
                Personalization strength: {personalizationStrength.toFixed(1)}
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={personalizationStrength}
                  onChange={(e) => setPersonalizationStrength(parseFloat(e.target.value))}
                />
              </label>
            </div>
          )}
        </div>
      )}
      
      {loading && <div className="loading">Loading...</div>}
      
      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}
      
      {data && data.searchProducts && (
        <div className="search-results">
          <div className="results-header">
            <h3>Found {data.searchProducts.total} results</h3>
            {data.searchProducts.metadata && data.searchProducts.metadata.personalized && (
              <div className="personalization-badge">
                Personalized
                {data.searchProducts.metadata.personalizationStrength && (
                  <span> ({data.searchProducts.metadata.personalizationStrength.toFixed(1)})</span>
                )}
              </div>
            )}
          </div>
          
          <div className="products-grid">
            {data.searchProducts.items.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {data.searchProducts.metadata && (
            <div className="search-metadata">
              <p>Search completed in {data.searchProducts.metadata.searchDuration}ms</p>
              <p>Algorithm: {data.searchProducts.metadata.algorithm}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Product card component with interaction tracking
 */
export const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const { trackProductView, trackAddToCart } = usePreferenceTracking();
  
  useEffect(() => {
    // Track product view when component mounts
    trackProductView(product.id, 'search');
  }, [product.id, trackProductView]);
  
  const handleAddToCart = () => {
    trackAddToCart(product.id, 1);
    // Add your cart logic here
    alert(`Added ${product.title} to cart!`);
  };
  
  return (
    <div className="product-card">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.title} className="product-image" />
      )}
      
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-brand">{product.brandName}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        
        <div className="product-categories">
          {product.categories.map((category: string) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
        
        <button className="add-to-cart-button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

/**
 * Category badge component with interaction tracking
 */
export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const { trackCategoryClick } = usePreferenceTracking();
  
  const handleClick = () => {
    trackCategoryClick(category);
    // Navigate to category page or filter results
  };
  
  return (
    <span className="category-badge" onClick={handleClick}>
      {category}
    </span>
  );
};

/**
 * Brand filter component with interaction tracking
 */
export const BrandFilter: React.FC<{ brands: string[] }> = ({ brands }) => {
  const { trackBrandClick } = usePreferenceTracking();
  
  const handleBrandClick = (brand: string) => {
    trackBrandClick(brand);
    // Apply brand filter
  };
  
  return (
    <div className="brand-filter">
      <h4>Filter by Brand</h4>
      <ul>
        {brands.map(brand => (
          <li key={brand} onClick={() => handleBrandClick(brand)}>
            {brand}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalizedSearch;
