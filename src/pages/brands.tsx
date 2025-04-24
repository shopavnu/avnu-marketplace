import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { produce } from 'immer'; // Import Immer
import { Brand } from '@/types/brand';
import { SearchFilters, SearchResult } from '@/types/search';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import BrandCard from '@/components/brands/BrandCard';

import { generateMockBrands } from '@/utils/mockData';

// Initial brands with deterministic values for SSR
const mockBrands: Brand[] = generateMockBrands();

// Import the types defined in FilterPanel.tsx for the handler
import { SimpleFilterChange, AttributeChangeDetail } from '@/components/search/FilterPanel';

// Helper type guard to differentiate between change types
function isAttributeChange(change: SimpleFilterChange | AttributeChangeDetail): change is AttributeChangeDetail {
  // Check for a property unique to AttributeChangeDetail, like 'action'
  return (change as AttributeChangeDetail).action !== undefined;
}

export default function BrandsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    causes: [],
    attributes: {},
    isLocal: false,
    isNew: false
  });
  const [searchResults, setSearchResults] = useState<SearchResult>({
    query: '',
    filters: {
      categories: [],
      causes: [],
      attributes: {},
      isLocal: false,
      isNew: false
    },
    totalResults: mockBrands.length,
    products: [],
    brands: mockBrands,
    suggestedFilters: []
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      ...mockBrands
        .map(b => b.categories[0])
        .filter(category => 
          category.toLowerCase().includes(query) && 
          category.toLowerCase() !== query
        )
    ])).slice(0, 4);

    setSearchSuggestions(suggestions);
  }, [searchQuery]);

  // Simulated search function
  const handleSearch = async (query: string, newFilters: SearchFilters = {}) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filteredBrands = mockBrands.filter(brand => {
      const matchesQuery = !query || 
        brand.name.toLowerCase().includes(query.toLowerCase()) ||
        brand.description.toLowerCase().includes(query.toLowerCase()) ||
        brand.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()));

      return matchesQuery;
    });

    setSearchResults(prev => ({ 
      ...prev, 
      query, 
      filters: newFilters, 
      totalResults: filteredBrands.length, 
      brands: filteredBrands, 
      suggestedFilters: [] 
    }));
    
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev].slice(0, 5));
    }
    
    setLoading(false);
  };

  // New handler for filter changes from FilterPanel
  const handleFilterChange = (change: SimpleFilterChange | AttributeChangeDetail) => {
    let nextFilters: SearchFilters;

    if (isAttributeChange(change)) {
      // Handle attribute add/remove using Immer
      const { categoryId, attributeName, value, action } = change;
      nextFilters = produce(filters, draft => {
        // Ensure path exists
        if (!draft.attributes) draft.attributes = {};
        if (!draft.attributes[categoryId]) draft.attributes[categoryId] = {};
        if (!draft.attributes[categoryId][attributeName]) draft.attributes[categoryId][attributeName] = [];

        const currentValues = draft.attributes[categoryId]?.[attributeName];

        // Ensure we're working with an array
        if (Array.isArray(currentValues)) {
           if (action === 'addAttributeValue') {
             if (!currentValues.includes(value)) {
               currentValues.push(value); // Immer handles mutation safely
             }
           } else if (action === 'removeAttributeValue') {
             const index = currentValues.indexOf(value);
             if (index > -1) {
               currentValues.splice(index, 1); // Immer handles mutation safely
             }
             // Clean up empty attribute array
             if (currentValues.length === 0 && draft.attributes[categoryId]) {
               delete draft.attributes[categoryId][attributeName];
             }
             // Clean up empty category object
             if (draft.attributes[categoryId] && Object.keys(draft.attributes[categoryId]).length === 0) {
               delete draft.attributes[categoryId];
             }
           }
        } else {
          // This case should ideally not happen if types are correct, but good for robustness
          console.error(`Attribute values at [${categoryId}][${attributeName}] are not an array.`);
          // Initialize as array if attribute was intended but structure was wrong
          if (action === 'addAttributeValue') {
            draft.attributes[categoryId][attributeName] = [value];
          }
        }
         // Clean up empty top-level attributes object
         if (draft.attributes && Object.keys(draft.attributes).length === 0) {
           draft.attributes = undefined; // Set to undefined to match SearchFilters type
         }
      });

    } else {
      // Handle simple changes (categories, causes, isLocal, isNew)
      // Simple spread works fine here as these are top-level changes
      nextFilters = {
        ...filters,
        ...change,
      };
    }

    setFilters(nextFilters);
    handleSearch(searchQuery, nextFilters); // Trigger search with the new filters
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
            placeholder="Search brands by name or category..."
          />
        </div>
      </div>

      <div className="container mx-auto px-4 safe-left safe-right safe-bottom">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Panel */}
          <div className="w-full md:w-64 shrink-0">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange} // Use the new handler
              categories={[]} // Pass empty array for categories prop for now
            />
          </div>

          {/* Search Results */}
          <div className="flex-1">
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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
