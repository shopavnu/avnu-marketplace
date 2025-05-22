/*
  TEMPORARY: This file contains some unused imports and variables that are expected to be used
  in future development (e.g., when integrating real merchant data or new features).
  eslint-disable-next-line comments have been added to allow builds to pass during development.
  BEFORE PRODUCTION: Remove these disables and clean up all unused code.
*/
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brand } from '@/types/brand';
import { SearchFilters, SearchResult } from '@/types/search';
import SearchBar from '@/components/search/SearchBar';
import DiscoverFilterPanel, { DiscoverFilters } from '@/components/DiscoverFilterPanel';
import ActiveFilterPills from '@/components/ActiveFilterPills';
import BrandCard from '@/components/brands/BrandCard';

import { generateMockBrands } from '@/utils/mockData';
import { getUserProfile } from '@/utils/user';

// Initial brands with deterministic values for SSR
const mockBrands: Brand[] = generateMockBrands();

// Personalization helper
function getPersonalizedBrands(brands: Brand[]): Brand[] {
  const profile = getUserProfile();
  if (!profile || (!profile.interests.length && !profile.favoriteBrands.length)) return brands;
  // Prioritize favorite brands, then brands matching interests
  const favs = brands.filter((b: Brand) => profile.favoriteBrands.includes(b.id));
  const interestMatches = brands.filter((b: Brand) =>
    b.categories && b.categories.some((cat: string) => profile.interests.includes(cat)) &&
    !profile.favoriteBrands.includes(b.id)
  );
  const rest = brands.filter((b: Brand) => !favs.includes(b) && !interestMatches.includes(b));
  return [...favs, ...interestMatches, ...rest];
}

export default function BrandsPage() {
  // Personalize brands for this user
  const personalizedBrands = getPersonalizedBrands(mockBrands);
  const initialSearchResults = {
    query: '',
    filters: {
      categories: [],
      causes: [],
      attributes: {} as { [categoryId: string]: { [attributeName: string]: string[] } },
      isLocal: false,
      isNew: false
    },
    totalResults: personalizedBrands.length,
    products: [],
    brands: personalizedBrands,
    suggestedFilters: []
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<DiscoverFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult>(initialSearchResults);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Trigger initial search to load brands on page mount
    handleSearch('', {});
    
    // Setup infinite scroll
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );
    
    if (loadingMoreRef.current) {
      observer.observe(loadingMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  // Update search suggestions based on query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const suggestions = Array.from(new Set([
      ...mockBrands
        .map(b => b.name)
        .filter(name => 
          name.toLowerCase().includes(query) && 
          name.toLowerCase() !== query
        ),
      // Add category suggestions
      ...Array.from(new Set(mockBrands.flatMap(b => b.categories || [])))
        .filter(cat => 
          cat.toLowerCase().includes(query) && 
          cat.toLowerCase() !== query
        )
        .map(cat => `Category: ${cat}`)
    ]));
    
    // Limit to top 5 suggestions
    setSearchSuggestions(suggestions.slice(0, 5));
  }, [searchQuery]);

  // Handle loading more products (infinite scroll)
  const handleLoadMore = () => {
    setLoading(true);
    // Simulate a delay
    setTimeout(() => {
      const newPage = page + 1;
      setPage(newPage);
      
      // Get current brands
      const currentBrands = searchResults.brands || [];
      
      // Simulate loading more brands
      const moreBrands = mockBrands.slice(0, 3); // Just add a few more for demo purposes
      
      setSearchResults(prev => ({
        ...prev,
        brands: [...currentBrands, ...moreBrands]
      }));
      
      // If we've reached the end of our mock data
      if (newPage > 3) { // Arbitrary limit for demonstration
        setHasMore(false);
      }
      
      setLoading(false);
    }, 800);
  };
  
  // Simulated search function
  const handleSearch = (query: string, discoverFilters: DiscoverFilters = {}) => {
    setLoading(true);
    const searchLower = query.toLowerCase();
    
    // Store the filters for later use
    setFilters(discoverFilters);
    
    // Reset pagination when searching
    setPage(1);
    setHasMore(true);
    
    // If no query and no filters, show personalized list
    if (!searchLower && Object.keys(discoverFilters).length === 0) {
      // Update recent searches if there was a query
      if (query) {
        setRecentSearches(prev => {
          const updated = [...prev.filter(s => s !== query), query];
          return updated.slice(-5); // Keep only last 5 searches
        });
      }
      
      setSearchResults({
        query,
        filters: {} as SearchFilters, // Type assertion to match SearchResult requirement
        totalResults: personalizedBrands.length,
        brands: personalizedBrands,
        products: [],
        suggestedFilters: []
      });
      
      setLoading(false);
      return;
    }

    const filteredBrands = mockBrands.filter(brand => {
      const matchesQuery = !query || 
        brand.name.toLowerCase().includes(query.toLowerCase()) ||
        (brand.categories && brand.categories.some(c => c.toLowerCase().includes(query.toLowerCase())));
      
      // Match category from DiscoverFilters
      const matchesCategory = !discoverFilters.category ||
        (brand.categories && brand.categories.includes(discoverFilters.category));
      
      // Match brand from DiscoverFilters
      const matchesBrand = !discoverFilters.brand?.length ||
        discoverFilters.brand.includes(brand.name);
      
      // Match against brand values (sustainability)
      const matchesSustainability = !discoverFilters.sustainability?.length ||
        (brand.values && brand.values.some(v => discoverFilters.sustainability?.includes(v)));
      
      return matchesQuery && matchesCategory && matchesBrand && matchesSustainability;
    });

    setSearchResults({
      query,
      filters: {} as SearchFilters, // Type assertion to satisfy SearchResult type
      totalResults: filteredBrands.length,
      brands: filteredBrands,
      products: [],
      suggestedFilters: []
    });
    
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev].slice(0, 5));
    }
    
    setLoading(false);
  };

  // Simple handler for DiscoverFilterPanel changes
  const handleFilterChange = (change: Partial<DiscoverFilters>) => {
    // Update filters and trigger search
    const newFilters = { ...filters, ...change };
    setFilters(newFilters);
    handleSearch(searchQuery, newFilters); // Trigger search with the new filters
  };

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
                onChange={handleFilterChange}
                availableBrands={Array.from(new Set(mockBrands.map(b => b.name))).sort()}
                availableCategories={Array.from(new Set(mockBrands.flatMap(b => b.categories || []))).sort()}
                availableAttributes={{}}
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
                    onChange={handleFilterChange}
                    availableBrands={Array.from(new Set(mockBrands.map(b => b.name))).sort()}
                    availableCategories={Array.from(new Set(mockBrands.flatMap(b => b.categories || []))).sort()}
                    availableAttributes={{}}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
            
            {/* Search Summary */}
            <div className="mb-6">
              <h1 className="text-2xl font-montserrat font-bold text-charcoal mb-2">
                {searchQuery ? `Brand Results for "${searchQuery}"` : 'Featured Brands'}
              </h1>
              <p className="text-neutral-gray">
                {searchResults.totalResults} brands found
              </p>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {searchResults.brands?.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <BrandCard brand={brand} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Infinite scroll sentinel */}
            <div ref={loadingMoreRef} style={{ height: 1 }} />

            {/* Loading State - Modern Skeleton Loaders */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-neutral-100 rounded-lg p-4 animate-pulse h-64 flex flex-col justify-between"
                  >
                    {/* Brand logo placeholder */}
                    <div className="bg-neutral-200 h-16 w-16 rounded mb-4" />
                    {/* Brand name placeholder */}
                    <div className="bg-neutral-200 h-6 w-3/4 rounded mb-2" />
                    {/* Description placeholder */}
                    <div className="space-y-2">
                      <div className="h-3 bg-neutral-200 rounded w-full" />
                      <div className="h-3 bg-neutral-200 rounded w-5/6" />
                    </div>
                    {/* Category pills placeholder */}
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 bg-neutral-200 rounded w-16" />
                      <div className="h-6 bg-neutral-200 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
