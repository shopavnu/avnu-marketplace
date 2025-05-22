/*
  TEMPORARY: This file contains some unused imports and variables that are expected to be used
  in future development (e.g., when integrating real merchant data or new features).
  eslint-disable-next-line comments have been added to allow builds to pass during development.
  BEFORE PRODUCTION: Remove these disables and clean up all unused code.
*/
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/products';
import { getUserProfile } from '@/utils/user';
import { SearchFilters, SearchResult } from '@/types/search';
import SearchBar from '@/components/search/SearchBar';
import DiscoverFilterPanel, { DiscoverFilters } from '@/components/DiscoverFilterPanel';
import ActiveFilterPills from '@/components/ActiveFilterPills';
import ProductCard from '@/components/products/ProductCard';

// Product image URLs from Unsplash - exactly 20 verified images
const productImages = [
  'photo-1523275335684-37898b6baf30', // 1. Watch
  'photo-1505740420928-5e560c06d30e', // 2. Headphones
  'photo-1542291026-7eec264c27ff', // 3. Red shoe
  'photo-1600185365926-3a2ce3cdb9eb', // 4. Backpack
  'photo-1546938576-6e6a64f317cc', // 5. Shoes
  'photo-1585386959984-a4155224a1ad', // 6. Camera
  'photo-1592921870789-04563d55041c', // 7. Watch 2
  'photo-1625772452859-1c03d5bf1137', // 8. Headphones 2
  'photo-1611312449408-fcece27cdbb7', // 9. Shirt
  'photo-1607522370275-f14206abe5d3', // 10. Sneakers
  'photo-1553062407-98eeb64c6a62', // 11. Backpack 2
  'photo-1608667508764-33cf0726b13a', // 12. Sunglasses
  'photo-1560343090-f0409e92791a', // 13. Shoes 2
  'photo-1595950653106-6c9ebd614d3a', // 14. Handbag
  'photo-1491553895911-0055eca6402d', // 15. Sneakers 2
  'photo-1556906781-9a412961c28c', // 16. Backpack 3
  'photo-1542219550-37153d387c27', // 17. Glasses 2
  'photo-1576566588028-4147f3842f27', // 18. Headphones 3
  'photo-1594938298603-c8148c4dae35', // 19. Camera 2
  'photo-1434056886845-dac89ffe9b56', // 20. Watch 3
];

// Helper function to generate mock products
const generateMockProducts = (seed = 1) => Array.from({ length: 20 }, (_, i) => {
  // Use seed to create deterministic variation
  const variation = (i * seed) % 5;
  // Use deterministic values for server-side rendering
  const productIndex = i + 1;
  const vendorIndex = Math.floor(i / 5) + 1;
  const brandIndex = Math.floor(i / 3) + 1 + variation; // Add variation to brand index

  return {
    id: `product-${productIndex}`,
    title: `Product ${productIndex}`,
    description: 'A wonderful product description that showcases the unique features and benefits.',
    price: 20 + (productIndex * 10), // Deterministic price
    image: `https://images.unsplash.com/${productImages[i]}?auto=format&fit=crop&w=800&q=80`,
    images: [`https://images.unsplash.com/${productImages[i]}?auto=format&fit=crop&w=800&q=80`],
    brand: `Brand ${brandIndex}`,
    category: 'Apparel', // Fixed category for SSR
    subCategory: 'Mens',
    attributes: { size: 'M', color: 'Blue' },
    isNew: false, // Fixed for SSR
    rating: {
      shopifyRating: {
        average: 4.5,
        count: 50
      },
      avnuRating: {
        average: 4.5,
        count: 25
      }
    },
    vendor: {
      id: `vendor-${vendorIndex}`,
      name: `Vendor ${vendorIndex}`,
      causes: ['sustainable', 'eco-friendly'], // Using correct cause IDs
      isLocal: false, // Fixed for SSR
      shippingInfo: {
        isFree: true,
        minimumForFree: 50,
        baseRate: 5.99
      }
    },
    inStock: true, // Fixed for SSR
    tags: ['trending'], // Fixed for SSR
    createdAt: new Date(2025, 0, 1).toISOString() // Fixed date for SSR
  };
});

// Personalization helper
function getPersonalizedProducts(products: Product[]): Product[] {
  const profile = getUserProfile();
  if (!profile || (!profile.interests.length && !profile.favoriteProducts.length)) return products;
  // Prioritize favorite products, then products matching interests, then the rest
  const favs = products.filter((p: Product) => profile.favoriteProducts.includes(p.id));
  const interestMatches = products.filter((p: Product) =>
    profile.interests.some((interest: string) => p.category === interest || (p.tags && p.tags.includes(interest))) &&
    !profile.favoriteProducts.includes(p.id)
  );
  const rest = products.filter((p: Product) => !favs.includes(p) && !interestMatches.includes(p));
  return [...favs, ...interestMatches, ...rest];
}

// Initial products with deterministic values for SSR
const mockProducts: Product[] = generateMockProducts();

export default function ShopPage() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setMounted] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<DiscoverFilters>({});
  const personalizedProducts = getPersonalizedProducts(mockProducts);
  const [searchResults, setSearchResults] = useState<SearchResult>({
    query: '',
    filters: {
      categories: [],
      causes: [],
      attributes: {} as { [categoryId: string]: { [attributeName: string]: string[] } },
      isLocal: false,
      isNew: false
    },
    totalResults: personalizedProducts.length,
    products: personalizedProducts.slice(0, 16), // Start with 16 products
    brands: [],
    suggestedFilters: []
  });
  const [, setPage] = useState(1);
  const [, setHasMore] = useState(true);
  const loadingMoreRef = useRef<HTMLDivElement | null>(null);
  const [recentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Update with randomized data on client-side
    if (typeof window !== 'undefined') {
      const randomizedProducts = generateMockProducts(Date.now());
      setSearchResults(prev => ({
        ...prev,
        products: randomizedProducts
      }));
    }
  }, []);

  // Generate search suggestions based on product titles and brands
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const suggestions = Array.from(new Set([
        // Get matching product titles
        ...mockProducts
          .map(p => p.title)
          .filter(title => 
            title.toLowerCase().includes(query) && 
            title.toLowerCase() !== query
          )
          .slice(0, 3),
        // Get matching brands
        ...mockProducts
          .map(p => p.brand)
          .filter(brand => 
            brand.toLowerCase().includes(query) && 
            brand.toLowerCase() !== query
          )
          .slice(0, 2)
      ])).slice(0, 4); // Limit to 4 total suggestions
      
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  // Simulated search function
  const handleSearch = async (query: string, newFilters: SearchFilters = {}) => {
    setLoading(true);
    // In a real implementation, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSearchResults({
      query,
      filters: newFilters,
      totalResults: personalizedProducts.length,
      products: personalizedProducts.slice(0, 16),
      brands: [],
      suggestedFilters: []
    });
    setLoading(false);
    setPage(1);
    setHasMore(personalizedProducts.length > 16);
  };

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (!loading) {
          setPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="sticky top-0 z-50 bg-warm-white/80 backdrop-blur-lg safe-top">
        <div className="container mx-auto px-4 py-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={recentSearches}
            suggestions={searchSuggestions}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 safe-left safe-right safe-bottom">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Panel */}
          {/* Mobile filter button */}
          <div className="block md:hidden mb-4">
            <button
              className="px-4 py-2 rounded bg-sage text-white font-semibold w-full"
              onClick={() => setShowMobileFilters(true)}
            >
              Show Filters
            </button>
          </div>

          {/* Sticky sidebar for desktop, mobile hidden */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <DiscoverFilterPanel
                filters={filters}
                onChange={change => setFilters(prev => ({ ...prev, ...change }))}
                availableBrands={Array.from(new Set((searchResults.products ?? []).map(p => p.brand))).sort()}
                availableCategories={Array.from(new Set((searchResults.products ?? []).map(p => p.category))).sort()}
                availableAttributes={(() => {
                  const availableAttributes: { [key: string]: string[] } = {};
                  (searchResults.products ?? []).forEach(p => {
                    if (p.attributes) {
                      Object.entries(p.attributes).forEach(([k, v]) => {
                        if (!Array.isArray(availableAttributes[k])) availableAttributes[k] = [];
                        if (Array.isArray(v)) {
                          v.forEach(val => {
                            if (!availableAttributes[k].includes(val)) availableAttributes[k].push(val);
                          });
                        } else if (typeof v === 'string') {
                          if (!availableAttributes[k].includes(v)) availableAttributes[k].push(v);
                        }
                      });
                    }
                  });
                  return availableAttributes;
                })()}
              />
            </div>
          </div>

          {/* Mobile filter drawer/modal */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex justify-end bg-black bg-opacity-40 md:hidden"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-11/12 max-w-sm h-full bg-white shadow-xl p-4"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)} className="text-xl">&times;</button>
                  </div>
                  <DiscoverFilterPanel
                    filters={filters}
                    onChange={change => setFilters(prev => ({ ...prev, ...change }))}
                    availableBrands={Array.from(new Set((searchResults.products ?? []).map(p => p.brand))).sort()}
                    availableCategories={Array.from(new Set((searchResults.products ?? []).map(p => p.category))).sort()}
                    availableAttributes={(() => {
                      const availableAttributes: { [key: string]: string[] } = {};
                      (searchResults.products ?? []).forEach(p => {
                        if (p.attributes) {
                          Object.entries(p.attributes).forEach(([k, v]) => {
                            if (!Array.isArray(availableAttributes[k])) availableAttributes[k] = [];
                            if (Array.isArray(v)) {
                              v.forEach(val => {
                                if (!availableAttributes[k].includes(val)) availableAttributes[k].push(val);
                              });
                            } else if (typeof v === 'string') {
                              if (!availableAttributes[k].includes(v)) availableAttributes[k].push(v);
                            }
                          });
                        }
                      });
                      return availableAttributes;
                    })()}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results */}
        <div className="flex-1">
          {/* Active filter pills */}
          <ActiveFilterPills
            filters={filters}
            onRemove={(key, value) => {
              setFilters(prev => {
                const updated: DiscoverFilters = { ...prev };
                if (Array.isArray(updated[key])) {
                  const arr = (updated[key] as string[]).filter((v: string) => v !== value);
                  if (arr.length > 0) updated[key] = arr;
                  else delete updated[key];
                } else if (typeof updated[key] === 'object' && updated[key] !== null) {
                  const obj = { ...updated[key] } as Record<string, string[]>;
                  Object.keys(obj).forEach(attr => {
                    if (Array.isArray(obj[attr])) {
                      obj[attr] = obj[attr].filter((v: string) => value !== `${attr}: ${v}`);
                      if (obj[attr].length === 0) delete obj[attr];
                    }
                  });
                  if (Object.keys(obj).length > 0) {
                    updated[key] = obj;
                  } else {
                    delete updated[key];
                  }
                } else {
                  delete updated[key];
                }
                return updated;
              });
            }}
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1">
        {/* Search Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-charcoal mb-2">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-neutral-gray">
            {searchResults.totalResults} products found
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence>
            {(searchResults.products ?? []).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Infinite scroll sentinel */}
        <div ref={loadingMoreRef} style={{ height: 1 }} />

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 py-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-100 rounded-lg p-4 animate-pulse h-64 flex flex-col justify-between"
              >
                <div className="bg-neutral-200 h-32 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                  <div className="h-3 bg-neutral-200 rounded w-1/3" />
                </div>
                <div className="h-6 bg-neutral-200 rounded w-1/2 mt-4" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
