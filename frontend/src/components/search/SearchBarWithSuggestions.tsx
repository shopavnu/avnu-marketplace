import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLazyQuery } from "@apollo/client";
import {
  GET_SEARCH_SUGGESTIONS,
  GetSearchSuggestionsData,
  GetSearchSuggestionsVars,
  SearchSuggestionType,
} from "@/graphql/queries/searchSuggestions";
import { debounce } from "lodash";
import { analyticsService } from "@/services/analytics.service";

interface SearchBarWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  recentSearches: string[];
  placeholder?: string;
  className?: string;
}

export default function SearchBarWithSuggestions({
  value,
  onChange,
  onSearch,
  recentSearches,
  placeholder = "Search products, brands, or categories...",
  className = "",
}: SearchBarWithSuggestionsProps) {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [getSuggestions, { data, loading }] = useLazyQuery<
    GetSearchSuggestionsData,
    GetSearchSuggestionsVars
  >(GET_SEARCH_SUGGESTIONS);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetSuggestions = useCallback(
    debounce((query: string) => {
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
      }
    }, 300),
    [getSuggestions],
  );

  useEffect(() => {
    debouncedGetSuggestions(value);
  }, [value, debouncedGetSuggestions]);

  // Track suggestion impressions when they are displayed
  useEffect(() => {
    const suggestionsLength = data?.getSuggestions?.suggestions?.length || 0;
    if (suggestionsLength > 0 && isFocused) {
      analyticsService.trackSuggestionImpression(value, suggestionsLength);
    }
  }, [data?.getSuggestions?.suggestions, isFocused, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      // Track search query
      analyticsService.trackSearchQuery(value.trim());
      onSearch(value.trim());
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestionType) => {
    // Track suggestion click
    analyticsService.trackSuggestionClick(suggestion);
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setIsFocused(false);
  };

  const suggestions = data?.getSuggestions.suggestions || [];
  const showDropdown =
    isFocused && (suggestions.length > 0 || recentSearches.length > 0);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-4 rounded-full border-2 border-sage/20 focus:border-sage 
                     bg-white/80 backdrop-blur-sm focus:bg-white
                     text-charcoal placeholder-neutral-gray/60
                     transition-all duration-300 outline-none
                     font-inter text-base"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-gray/60"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray/60 hover:text-sage
                       transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions and Recent Searches Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg 
                     border border-neutral-gray/10 overflow-hidden z-50"
          >
            <div className="p-2">
              {/* Loading indicator */}
              {loading && value.length >= 2 && (
                <div className="px-3 py-2 text-sm text-neutral-gray flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-sage"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading suggestions...
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-neutral-gray px-3 py-2">
                    Suggestions
                  </h3>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg text-charcoal hover:bg-sage/5
                               flex items-center gap-3 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-neutral-gray/60"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <span>
                          <span className="font-medium">
                            {suggestion.text.slice(0, value.length)}
                          </span>
                          {suggestion.text.slice(value.length)}
                        </span>
                        {suggestion.category && (
                          <span className="text-xs text-neutral-gray">
                            in {suggestion.category}
                          </span>
                        )}
                      </div>
                      {suggestion.isPersonalized && (
                        <span className="ml-auto text-xs bg-sage/10 text-sage px-2 py-0.5 rounded-full">
                          For You
                        </span>
                      )}
                      {suggestion.isPopular && !suggestion.isPersonalized && (
                        <span className="ml-auto text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-gray px-3 py-2">
                    Recent Searches
                  </h3>
                  {recentSearches.map((search, index) => (
                    <button
                      key={`recent-${index}`}
                      onClick={() => {
                        onChange(search);
                        onSearch(search);
                        setIsFocused(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-charcoal hover:bg-sage/5
                               flex items-center gap-3 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-neutral-gray/60"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
