import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';
import { useLazyQuery } from '@apollo/client';
import { GET_SEARCH_SUGGESTIONS, GetSearchSuggestionsData, GetSearchSuggestionsVars } from '@/graphql/queries/searchSuggestions';
import { debounce } from 'lodash';
import { analyticsService } from '@/services/analytics.service';

// Default filter pills for the search bar
const defaultFilterPills = [
  { id: 'sustainable', label: 'Sustainable', active: false },
  { id: 'local', label: 'Local Brands', active: false },
  { id: 'handmade', label: 'Handmade', active: false },
  { id: 'vegan', label: 'Vegan', active: false },
  { id: 'eco-friendly', label: 'Eco-Friendly', active: false },
  { id: 'fair-trade', label: 'Fair Trade', active: false },
];

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filterPills, setFilterPills] = useState(defaultFilterPills);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  
  const [getSuggestions, { data, loading }] = useLazyQuery<GetSearchSuggestionsData, GetSearchSuggestionsVars>(
    GET_SEARCH_SUGGESTIONS
  );

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, []);
  
  // Process suggestions from API response
  useEffect(() => {
    if (data?.getSuggestions?.suggestions) {
      const processedSuggestions = data.getSuggestions.suggestions.map(s => s.text);
      setSuggestions(processedSuggestions);
      
      // Track suggestion impressions
      if (processedSuggestions.length > 0) {
        analyticsService.trackSuggestionImpression(
          searchQuery,
          processedSuggestions.length
        );
      }
    }
  }, [data, searchQuery]);
  
  // Debounced function to fetch suggestions
  const debouncedGetSuggestions = debounce((query: string) => {
    if (query.length >= 2) {
      getSuggestions({
        variables: {
          input: {
            query,
            limit: 5,
            includePopular: true,
            includePersonalized: true,
            includeCategoryContext: true,
          },
        },
      });
    } else {
      setSuggestions([]);
    }
  }, 300);
  
  // Update suggestions when search query changes
  useEffect(() => {
    debouncedGetSuggestions(searchQuery);
    return () => debouncedGetSuggestions.cancel();
  }, [searchQuery, debouncedGetSuggestions]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Save to recent searches
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Track search query
    analyticsService.trackSearchQuery(query.trim());
    
    // Build query parameters including active filters
    const activeFilters = filterPills.filter(pill => pill.active).map(pill => pill.id);
    const queryParams = new URLSearchParams();
    queryParams.set('q', query);
    if (activeFilters.length > 0) {
      queryParams.set('filters', activeFilters.join(','));
    }
    
    // Navigate to search results page
    router.push(`/search?${queryParams.toString()}`);
  };
  
  // Handle filter pill clicks
  const handleFilterPillClick = (pillId: string) => {
    setFilterPills(pills => 
      pills.map(pill => 
        pill.id === pillId 
          ? { ...pill, active: !pill.active } 
          : pill
      )
    );
  };

  return (
    <section className="relative py-12 md:py-16 bg-warm-white">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Airbnb-style Search Bar with Filter Pills */}
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              recentSearches={recentSearches}
              suggestions={suggestions}
              filterPills={filterPills}
              onFilterPillClick={handleFilterPillClick}
              variant="prominent"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
          
          {/* Value Proposition */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-neutral-gray text-sm md:text-base">
              Discover <span className="text-sage font-medium">sustainable</span>, <span className="text-sage font-medium">ethical</span>, and <span className="text-sage font-medium">unique</span> products from independent brands
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
