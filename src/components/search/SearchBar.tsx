import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  recentSearches: string[];
  suggestions?: string[];
}

export default function SearchBar({ value, onChange, onSearch, recentSearches, suggestions = [] }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setIsFocused(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search products, brands, or categories..."
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
              onClick={() => onChange('')}
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
        {isFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg 
                     border border-neutral-gray/10 overflow-hidden z-50"
          >
            <div className="p-2">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-neutral-gray px-3 py-2">Suggestions</h3>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => {
                        onChange(suggestion);
                        onSearch(suggestion);
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
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <span>
                        <span className="font-medium">{suggestion.slice(0, value.length)}</span>
                        {suggestion.slice(value.length)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-gray px-3 py-2">Recent Searches</h3>
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
