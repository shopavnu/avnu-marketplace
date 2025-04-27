import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface FilterPill {
  id: string;
  label: string;
  active?: boolean;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  recentSearches: string[];
  suggestions?: string[];
  filterPills?: FilterPill[];
  onFilterPillClick?: (pillId: string) => void;
  className?: string;
  variant?: 'default' | 'prominent';
}

export default function SearchBar({ 
  value, 
  onChange, 
  onSearch, 
  recentSearches, 
  suggestions = [],
  filterPills = [],
  onFilterPillClick = () => {},
  className = '',
  variant = 'default'
}: SearchBarProps) {
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

  const isProminent = variant === 'prominent';

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className={`${isProminent ? 'bg-white shadow-md rounded-xl p-6' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search products, brands, or values..."
              className={`w-full px-4 py-3 pl-12 pr-4 rounded-full border-2 ${isProminent ? 'border-sage/30 focus:border-sage shadow-sm' : 'border-sage/20 focus:border-sage'} 
                       bg-white/90 backdrop-blur-sm focus:bg-white
                       text-charcoal placeholder-neutral-gray/60
                       transition-all duration-300 outline-none
                       font-inter ${isProminent ? 'text-lg' : 'text-base'}`}
            />
            <MagnifyingGlassIcon
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-gray/60"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-neutral-gray/60 hover:text-sage
                           transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
              {isProminent && (
                <div className="h-6 w-px bg-neutral-gray/20 mx-1"></div>
              )}
              {isProminent && (
                <button 
                  type="button" 
                  className="text-neutral-gray/60 hover:text-sage transition-colors duration-200"
                  onClick={() => {}}
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
        
        {/* Filter Pills */}
        {filterPills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pb-1">
            {filterPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => onFilterPillClick(pill.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${pill.active 
                  ? 'bg-sage text-white' 
                  : 'bg-white border border-neutral-gray/20 text-charcoal hover:border-sage/30'}`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions and Recent Searches Dropdown */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg 
                     border border-neutral-gray/10 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
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
                      <MagnifyingGlassIcon className="w-4 h-4 text-neutral-gray/60" />
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
