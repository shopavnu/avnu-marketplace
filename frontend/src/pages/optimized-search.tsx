import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { analyticsService } from "../services/analytics.service";
import sessionService from "../services/session.service";
import SearchBarWithSuggestions from "../components/search/SearchBarWithSuggestions";
import { EnhancedFilterPanel } from "../components/search/EnhancedFilterPanel";
import CursorPagination from "../components/search/CursorPagination";
import { FacetType, SearchFilters } from "../types/search";
import useSessionTracking from "../hooks/useSessionTracking";
import useImpressionTracking from "../hooks/useImpressionTracking";

// Define the GraphQL query for optimized search results with cursor-based pagination
const OPTIMIZED_SEARCH_QUERY = gql`
  query OptimizedSearch(
    $query: String
    $pagination: CursorPaginationInput
    $filters: SearchFiltersInput
    $sessionId: String
  ) {
    optimizedSearch(
      query: $query
      pagination: $pagination
      filters: $filters
      sessionId: $sessionId
    ) {
      query
      pagination {
        total
        nextCursor
        hasMore
      }
      results {
        id
        type
        name
        description
        price
        compareAtPrice
        images
        categories
        values
        brandName
        merchantId
        score
        isSponsored
        inStock
      }
      facets {
        name
        displayName
        values {
          value
          count
          min
          max
        }
      }
      isPersonalized
      experimentId
      appliedFilters
    }
  }
`;

export default function OptimizedSearchPage() {
  const router = useRouter();
  const { q: queryParam } = router.query;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [facets, setFacets] = useState<FacetType[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);

  // Use our custom session tracking hooks
  const { sessionId, trackSearchQuery } = useSessionTracking();

  // Use impression tracking hook
  const { trackElement, resetTracking } = useImpressionTracking({
    searchQuery,
    threshold: 0.5,
    enabled: !!searchQuery,
  });

  const [executeSearch, { data, loading, error }] =
    useLazyQuery(OPTIMIZED_SEARCH_QUERY);

  // Handle updating search results when data changes
  useEffect(() => {
    if (data?.optimizedSearch) {
      const { results, pagination, facets: newFacets } = data.optimizedSearch;
      
      // If it's a new search or filter change (not pagination), replace results
      if (!nextCursor || isFilterActive) {
        setSearchResults(results);
        setIsFilterActive(false);
      } else {
        // Otherwise append results for pagination
        setSearchResults(prevResults => [...prevResults, ...results]);
      }
      
      setNextCursor(pagination.nextCursor);
      setHasMore(pagination.hasMore);
      setTotalResults(pagination.total);
      setFacets(newFacets);
    }
  }, [data, nextCursor, isFilterActive]);

  // Initialize search query from URL parameter
  useEffect(() => {
    if (queryParam && typeof queryParam === "string") {
      setSearchQuery(queryParam);
      setSearchResults([]);
      setNextCursor(null);
      setHasMore(true);

      // Track search query in session service
      trackSearchQuery(queryParam);

      // Reset impression tracking for new search
      resetTracking();

      // Initial search with no filters
      executeSearch({
        variables: {
          query: queryParam,
          pagination: { cursor: null, limit: 20 },
          filters: filters,
          sessionId, 
        },
      });

      // Track search in analytics service
      analyticsService.trackEvent({
        event: "search",
        properties: {
          query: queryParam,
          session_id: sessionId,
          search_type: "optimized",
        }
      });
    }
  }, [queryParam, executeSearch, trackSearchQuery, resetTracking, sessionId, filters]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Save to recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter((s) => s !== query),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    // Reset filters
    setFilters({});

    // Update URL without reloading page
    router.push({
      pathname: "/optimized-search",
      query: { q: query },
    }, undefined, { shallow: true });

    // Reset pagination state
    setSearchResults([]);
    setNextCursor(null);
    setHasMore(true);

    // Execute the search query
    executeSearch({
      variables: {
        query,
        pagination: { cursor: null, limit: 20 },
        filters: {},
        sessionId,
      },
    });

    // Track the search
    analyticsService.trackEvent({
      event: "search",
      properties: {
        query,
        session_id: sessionId,
        search_type: "optimized",
      }
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: SearchFilters) => {
    setIsFilterActive(true);
    setFilters(newFilters);
    
    // Reset pagination
    setNextCursor(null);
    setHasMore(true);
    
    // Execute search with new filters
    executeSearch({
      variables: {
        query: searchQuery,
        pagination: { cursor: null, limit: 20 },
        filters: newFilters,
        sessionId,
      },
    });
    
    // Track filter usage
    analyticsService.trackEvent({
      event: "filters_applied",
      properties: {
        query: searchQuery,
        filters: JSON.stringify(newFilters),
        filter_count: Object.keys(newFilters).length,
      }
    });
  };

  // Load more results (pagination)
  const loadMoreResults = useCallback(() => {
    if (loading || !hasMore) return;

    executeSearch({
      variables: {
        query: searchQuery,
        pagination: { cursor: nextCursor, limit: 20 },
        filters,
        sessionId,
      },
    });
  }, [loading, hasMore, executeSearch, searchQuery, nextCursor, filters, sessionId]);

  // Function to render a product card
  const renderProductCard = (product: any, index?: number) => {
    // We'll use a ref callback to track the element when it's rendered
    const productUrl = `/products/${product.id}`;
    
    return (
      <div 
        ref={(el) => { if (el) trackElement(el, product.id); }}
        className="group rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        <Link href={productUrl}>
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {product.images && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
            )}
            
            {!product.inStock && (
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
                </span>
              </div>
            )}
            
            {product.isSponsored && (
              <div className="absolute top-2 right-2">
                <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">
                  Sponsored
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          {product.brandName && (
            <p className="text-sage-dark text-sm font-medium mb-1">
              {product.brandName}
            </p>
          )}
          
          <Link href={productUrl}>
            <h3 className="text-charcoal font-medium mb-2 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center">
            <span className="text-charcoal font-bold">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-gray-500 line-through text-sm">
                ${parseFloat(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
          
          {product.categories && product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category: string) => (
                <span
                  key={category}
                  className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-800"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Search header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <SearchBarWithSuggestions
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={recentSearches}
            placeholder="Search for products, brands, or categories..."
          />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full md:w-1/4">
            {facets.length > 0 && (
              <EnhancedFilterPanel
                filters={filters}
                facets={facets}
                onChange={handleFilterChange}
                isLoading={loading && !nextCursor}
              />
            )}
          </div>

          {/* Results area */}
          <div className="w-full md:w-3/4">
            {loading && searchResults.length === 0 ? (
              // Initial loading state
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-sage/30 border-t-sage rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-gray">Searching...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <p>Error: {error.message}</p>
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              // No results state
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 text-gray-300 mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <h2 className="text-xl font-medium text-gray-800 mb-2">
                  No results found
                </h2>
                <p className="text-gray-500 max-w-md text-center">
                  We couldn&apos;t find any results matching &quot;{searchQuery}
                  &quot;. Try using different keywords or browse our categories.
                </p>
              </div>
            ) : (
              // Results
              <div>
                {/* Results summary */}
                {totalResults > 0 && (
                  <div className="mb-6 flex justify-between items-center">
                    <p className="text-neutral-gray">
                      Found {totalResults} results for &quot;{searchQuery}&quot;
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-gray">Sort by:</span>
                      <select 
                        className="border rounded-md p-2 text-sm"
                        onChange={(e) => {
                          const [field, direction] = e.target.value.split('-');
                          handleFilterChange({
                            ...filters,
                            sortBy: field,
                            sortDirection: direction as 'asc' | 'desc' | undefined
                          });
                        }}
                        value={`${filters.sortBy || 'relevance'}-${filters.sortDirection || 'desc'}`}
                      >
                        <option value="relevance-desc">Relevance</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="newest-desc">Newest</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Results grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((result, index) => (
                    <div key={result.id}>
                      {renderProductCard(result, index)}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <CursorPagination
                  hasMore={hasMore}
                  isLoading={loading && !!nextCursor}
                  onLoadMore={loadMoreResults}
                  totalResults={totalResults}
                  currentCount={searchResults.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
