import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Image from 'next/image';
import { analyticsService } from '@/services/analytics.service';
import sessionService from '@/services/session.service';
import SearchBarWithSuggestions from '@/components/search/SearchBarWithSuggestions';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import useSessionTracking from '@/hooks/useSessionTracking';
import useImpressionTracking from '@/hooks/useImpressionTracking';

// Define the GraphQL query for search results with cursor-based pagination
const CURSOR_SEARCH_QUERY = gql`
  query Search($query: String!, $cursor: String, $limit: Int, $sessionId: String) {
    search(query: $query, cursor: $cursor, limit: $limit, sessionId: $sessionId) {
      query
      pagination {
        total
        nextCursor
        hasMore
      }
      results {
        ... on ProductResultType {
          id
          title
          description
          price
          inStock
          thumbnailImage
          categories
          brandName
          sponsored
        }
        ... on MerchantResultType {
          id
          name
          description
          logo
          categories
          sponsored
        }
        ... on BrandResultType {
          id
          name
          description
          logo
          categories
          sponsored
        }
      }
      facets {
        name
        displayName
        values {
          value
          count
        }
      }
    }
  }
`;

export default function InfiniteSearchPage() {
  const router = useRouter();
  const { q: queryParam } = router.query;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [facets, setFacets] = useState<any[]>([]);
  
  // Use our custom session tracking hooks
  const { sessionId, trackSearchQuery } = useSessionTracking();
  
  // Use impression tracking hook
  const { trackElement, resetTracking } = useImpressionTracking({
    searchQuery,
    threshold: 0.5,
    enabled: !!searchQuery
  });
  
  // For legacy references
  const resultRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const [executeSearch, { data, loading, error }] = useLazyQuery(CURSOR_SEARCH_QUERY);

  // Initialize search query from URL parameter
  useEffect(() => {
    if (queryParam && typeof queryParam === 'string') {
      setSearchQuery(queryParam);
      setSearchResults([]);
      setNextCursor(null);
      setHasMore(true);
      
      // Track search query in session service
      trackSearchQuery(queryParam);
      
      // Reset impression tracking for new search
      resetTracking();
      
      executeSearch({
        variables: {
          query: queryParam,
          cursor: null,
          limit: 20,
          sessionId // Use sessionId from useSessionTracking hook
        }
      });
      
      // Track search in analytics service
      analyticsService.trackSearchQuery(queryParam);
    }
  }, [queryParam, executeSearch, trackSearchQuery, resetTracking, sessionId]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Save to recent searches
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Update URL and execute search
    router.push(`/infinite-search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    
    // Reset search results and load new results
    setSearchResults([]);
    setNextCursor(null);
    setHasMore(true);
    
    // Get the current session ID for personalized search
    const sessionId = sessionService.getSessionId();
    
    // Track the search query in the session service
    sessionService.trackSearchQuery(query);
    
    executeSearch({
      variables: {
        query,
        cursor: null,
        limit: 20,
        sessionId
      }
    });
  };

  // Update search results when data changes
  useEffect(() => {
    if (data?.search) {
      if (nextCursor === null) {
        // First page of results
        setSearchResults(data.search.results);
      } else {
        // Append new results to existing ones
        setSearchResults(prev => [...prev, ...data.search.results]);
      }
      setTotalResults(data.search.pagination.total);
      setNextCursor(data.search.pagination.nextCursor);
      setHasMore(data.search.pagination.hasMore);
      setFacets(data.search.facets || []);
    }
  }, [data, nextCursor]);
  
  // Reset impression tracking when search results change
  useEffect(() => {
    if (searchResults.length > 0) {
      // Reset tracking when results change
      resetTracking();
    }
  }, [searchResults, resetTracking]);
  
  // Load more results when user scrolls to the bottom
  const loadMoreResults = useCallback(async () => {
    if (hasMore && !loading && searchQuery && nextCursor) {
      // Get the current session ID for personalized search
      const sessionId = sessionService.getSessionId();
      
      await executeSearch({
        variables: {
          query: searchQuery,
          cursor: nextCursor,
          limit: 20,
          sessionId
        }
      });
    }
  }, [executeSearch, hasMore, loading, nextCursor, searchQuery]);

  // Function to render a product result
  const renderProductResult = (product: any, index: number) => {
    return (
      <div 
        key={product.id} 
        className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
        ref={(el) => {
          if (el) {
            resultRefs.current.set(product.id, el);
            // Use our new impression tracking hook
            trackElement(el, product.id);
          }
        }}
        onClick={() => {
          // Track click in analytics service
          analyticsService.trackSearchResultClick(product.id, index + 1, searchQuery);
          // Track click in session service with position information
          sessionService.trackResultClick(product.id, index + 1, searchQuery);
        }}
      >
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.thumbnailImage ? (
            <Image
              src={product.thumbnailImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {product.sponsored && (
            <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Sponsored
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">
            {product.categories?.[0] || 'Product'}
          </div>
          <h3 className="font-medium text-gray-800 mb-1 truncate">{product.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">{product.brandName}</span>
          </div>
        </div>
      </div>
    );
  };

  // Function to render a merchant or brand result
  const renderEntityResult = (entity: any, index: number) => {
    return (
      <div 
        key={entity.id} 
        className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
        ref={(el) => {
          if (el) {
            resultRefs.current.set(entity.id, el);
            // Use our new impression tracking hook
            trackElement(el, entity.id);
          }
        }}
        onClick={() => {
          // Track click in analytics service
          analyticsService.trackSearchResultClick(entity.id, index + 1, searchQuery);
          // Track click in session service with position information
          sessionService.trackResultClick(entity.id, index + 1, searchQuery);
          
          // Determine entity type
          const entityType = entity.productCount !== undefined ? 'merchant' : 'brand';
          
          // Navigate to entity page with search context for dwell time tracking
          router.push({
            pathname: `/${entityType}/${entity.id}`,
            query: {
              q: searchQuery,
              pos: (index + 1).toString()
            }
          });
        }}
      >
        <div className="p-4 flex items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 mr-4">
            {entity.logo ? (
              <Image
                src={entity.logo}
                alt={entity.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-xs">No Logo</span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-medium text-gray-800 mb-1">{entity.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{entity.description}</p>
            {entity.categories && entity.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap">
                {entity.categories.slice(0, 3).map((category: string) => (
                  <span 
                    key={category} 
                    className="mr-1 mb-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
          {entity.sponsored && (
            <div className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Sponsored
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render search result based on type
  const renderSearchResult = (result: any, index: number) => {
    if ('title' in result) {
      return renderProductResult(result, index);
    } else {
      return renderEntityResult(result, index);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Search</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBarWithSuggestions
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={recentSearches}
            placeholder="Search for products, brands, or merchants..."
          />
        </div>
        
        {/* Search Results */}
        {loading && nextCursor === null ? (
          // Initial loading state
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Searching...</p>
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
            <h2 className="text-xl font-medium text-gray-800 mb-2">No results found</h2>
            <p className="text-gray-500 max-w-md text-center">
              We couldn&apos;t find any results matching &quot;{searchQuery}&quot;. Try using different keywords or browse our categories.
            </p>
          </div>
        ) : (
          // Results
          <div>
            {/* Results summary */}
            {totalResults > 0 && (
              <p className="mb-4 text-gray-600">
                Found {totalResults} results for &quot;{searchQuery}&quot;
              </p>
            )}
            
            {/* Facets (if needed) */}
            {facets.length > 0 && (
              <div className="mb-6 hidden md:block">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Filter by</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {facets.map(facet => (
                    <div key={facet.name}>
                      <h4 className="font-medium mb-2">{facet.displayName}</h4>
                      <div>
                        {facet.values.slice(0, 5).map((value: any) => (
                          <div key={value.value} className="flex mb-1 text-sm">
                            <span>{value.value}</span>
                            <span className="ml-1 text-gray-500">({value.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Results grid with InfiniteScroll */}
            <InfiniteScroll
              loadMore={loadMoreResults}
              hasMore={hasMore}
              isLoading={loading && nextCursor !== null}
              threshold={300}
              loadingIndicator={
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                  <span className="text-gray-500">Loading more results...</span>
                </div>
              }
              endMessage={
                <div className="text-center py-8 text-gray-500">
                  <p>You&apos;ve reached the end of the results</p>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((result, index) => (
                  <div key={result.id}>
                    {renderSearchResult(result, index)}
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          </div>
        )}
      </div>
    </div>
  );
}
