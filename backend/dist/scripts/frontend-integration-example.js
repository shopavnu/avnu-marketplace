'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.BrandFilter =
  exports.CategoryBadge =
  exports.ProductCard =
  exports.PersonalizedSearch =
  exports.usePreferenceTracking =
    void 0;
const react_1 = __importStar(require('react'));
const client_1 = require('@apollo/client');
const useAuth_1 = require('../hooks/useAuth');
const TRACK_SEARCH = (0, client_1.gql)`
  mutation TrackSearch($query: String!, $filters: JSON, $resultCount: Int) {
    trackSearch(query: $query, filters: $filters, resultCount: $resultCount)
  }
`;
const TRACK_PRODUCT_VIEW = (0, client_1.gql)`
  mutation TrackProductView($productId: String!, $referrer: String) {
    trackProductView(productId: $productId, referrer: $referrer)
  }
`;
const TRACK_ADD_TO_CART = (0, client_1.gql)`
  mutation TrackAddToCart($productId: String!, $quantity: Int) {
    trackAddToCart(productId: $productId, quantity: $quantity)
  }
`;
const TRACK_CATEGORY_CLICK = (0, client_1.gql)`
  mutation TrackCategoryClick($category: String!) {
    trackCategoryClick(category: $category)
  }
`;
const TRACK_BRAND_CLICK = (0, client_1.gql)`
  mutation TrackBrandClick($brand: String!) {
    trackBrandClick(brand: $brand)
  }
`;
const SEARCH_PRODUCTS = (0, client_1.gql)`
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
const usePreferenceTracking = () => {
  const [trackSearch] = (0, client_1.useMutation)(TRACK_SEARCH);
  const [trackProductView] = (0, client_1.useMutation)(TRACK_PRODUCT_VIEW);
  const [trackAddToCart] = (0, client_1.useMutation)(TRACK_ADD_TO_CART);
  const [trackCategoryClick] = (0, client_1.useMutation)(TRACK_CATEGORY_CLICK);
  const [trackBrandClick] = (0, client_1.useMutation)(TRACK_BRAND_CLICK);
  return {
    trackSearch: (query, filters, resultCount) => {
      trackSearch({
        variables: { query, filters, resultCount },
        onError: error => console.error('Error tracking search:', error),
      });
    },
    trackProductView: (productId, referrer) => {
      trackProductView({
        variables: { productId, referrer },
        onError: error => console.error('Error tracking product view:', error),
      });
    },
    trackAddToCart: (productId, quantity = 1) => {
      trackAddToCart({
        variables: { productId, quantity },
        onError: error => console.error('Error tracking add to cart:', error),
      });
    },
    trackCategoryClick: category => {
      trackCategoryClick({
        variables: { category },
        onError: error => console.error('Error tracking category click:', error),
      });
    },
    trackBrandClick: brand => {
      trackBrandClick({
        variables: { brand },
        onError: error => console.error('Error tracking brand click:', error),
      });
    },
  };
};
exports.usePreferenceTracking = usePreferenceTracking;
const PersonalizedSearch = () => {
  const { isAuthenticated } = (0, useAuth_1.useAuth)();
  const [query, setQuery] = (0, react_1.useState)('');
  const [enablePersonalization, setEnablePersonalization] = (0, react_1.useState)(true);
  const [personalizationStrength, setPersonalizationStrength] = (0, react_1.useState)(1.0);
  const { trackSearch } = (0, exports.usePreferenceTracking)();
  const { loading, error, data } = (0, client_1.useQuery)(SEARCH_PRODUCTS, {
    variables: {
      query,
      page: 1,
      limit: 10,
      enablePersonalization: isAuthenticated && enablePersonalization,
      personalizationStrength,
    },
    skip: !query,
    fetchPolicy: 'network-only',
  });
  (0, react_1.useEffect)(() => {
    if (data && query) {
      trackSearch(query, {}, data.searchProducts.total);
    }
  }, [data, query, trackSearch]);
  const handleSearch = e => {
    e.preventDefault();
  };
  return (
    <div className="personalized-search">
      <h2>Personalized Search</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {isAuthenticated && (
        <div className="personalization-controls">
          <label>
            <input
              type="checkbox"
              checked={enablePersonalization}
              onChange={e => setEnablePersonalization(e.target.checked)}
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
                  onChange={e => setPersonalizationStrength(parseFloat(e.target.value))}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      {error && <div className="error">Error: {error.message}</div>}

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
            {data.searchProducts.items.map(product => (
              <exports.ProductCard key={product.id} product={product} />
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
exports.PersonalizedSearch = PersonalizedSearch;
const ProductCard = ({ product }) => {
  const { trackProductView, trackAddToCart } = (0, exports.usePreferenceTracking)();
  (0, react_1.useEffect)(() => {
    trackProductView(product.id, 'search');
  }, [product.id, trackProductView]);
  const handleAddToCart = () => {
    trackAddToCart(product.id, 1);
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
          {product.categories.map(category => (
            <exports.CategoryBadge key={category} category={category} />
          ))}
        </div>

        <button className="add-to-cart-button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};
exports.ProductCard = ProductCard;
const CategoryBadge = ({ category }) => {
  const { trackCategoryClick } = (0, exports.usePreferenceTracking)();
  const handleClick = () => {
    trackCategoryClick(category);
  };
  return (
    <span className="category-badge" onClick={handleClick}>
      {category}
    </span>
  );
};
exports.CategoryBadge = CategoryBadge;
const BrandFilter = ({ brands }) => {
  const { trackBrandClick } = (0, exports.usePreferenceTracking)();
  const handleBrandClick = brand => {
    trackBrandClick(brand);
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
exports.BrandFilter = BrandFilter;
exports.default = exports.PersonalizedSearch;
//# sourceMappingURL=frontend-integration-example.js.map
