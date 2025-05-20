import React from 'react';


export type DiscoverFilters = {
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  shipping?: 'free' | 'local' | 'any';
  inStock?: boolean;
  attributes?: { [key: string]: string[] };
  dealsOnly?: boolean;
  sustainability?: string[];
  [key: string]: string | string[] | number | boolean | { [key: string]: string[] } | undefined;
};

interface DiscoverFilterPanelProps {
  filters: DiscoverFilters;
  onChange: (change: Partial<DiscoverFilters>) => void;
  availableBrands: string[];
  availableCategories: string[];
  availableAttributes: { [key: string]: string[] };
}

const ratings = [5, 4, 3, 2, 1];

const DiscoverFilterPanel: React.FC<DiscoverFilterPanelProps> = ({
  filters,
  onChange,
  availableBrands,
  availableCategories,
  availableAttributes,
}) => {
  return (
    <aside className="w-full lg:w-64 xl:w-72 h-full bg-neutral-900 border-r border-electric-teal/30">
      <div className="space-y-6 py-2">
        {/* Category */}
        <div className="px-4">
          <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
            <span>Category</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
          </h3>
          <div className="flex flex-col gap-1.5">
            {availableCategories.map(cat => (
              <button
                key={cat}
                className={`text-left px-3 py-2 rounded-md transition-all duration-200 ${filters.category === cat 
                  ? 'bg-gradient-to-r from-electric-teal/20 to-vivid-magenta/20 text-electric-teal border-l-2 border-electric-teal' 
                  : 'hover:bg-neutral-800 text-warm-tan-refresh hover:text-soft-ivory'}`}
                onClick={() => onChange({ category: filters.category === cat ? undefined : cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="px-4">
          <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
            <span>Brand</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
          </h3>
          <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-electric-teal/40 scrollbar-track-neutral-800">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative w-4 h-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={filters.brand?.includes(brand) || false}
                    onChange={() => {
                      const current = filters.brand || [];
                      onChange({ brand: current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand] });
                    }}
                    className="appearance-none w-4 h-4 border border-electric-teal/50 rounded-sm bg-neutral-800 checked:bg-electric-teal/20 focus:outline-none focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
                  />
                  {filters.brand?.includes(brand) && (
                    <svg className="absolute top-0 left-0 w-4 h-4 text-electric-teal pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-warm-tan-refresh group-hover:text-soft-ivory transition-colors duration-200">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="px-4">
          <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
            <span>Price Range</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
          </h3>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              min={0}
              placeholder="Min"
              className="w-full bg-neutral-800 border border-electric-teal/30 rounded-md px-3 py-1.5 text-soft-ivory placeholder-warm-tan-refresh/50 focus:outline-none focus:border-electric-teal focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
              value={filters.minPrice ?? ''}
              onChange={e => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
            <span className="text-electric-teal">—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              className="w-full bg-neutral-800 border border-electric-teal/30 rounded-md px-3 py-1.5 text-soft-ivory placeholder-warm-tan-refresh/50 focus:outline-none focus:border-electric-teal focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
              value={filters.maxPrice ?? ''}
              onChange={e => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="px-4">
          <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
            <span>Avg. Customer Review</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
          </h3>
          <div className="flex flex-col gap-2">
            {ratings.map(r => (
              <button
                key={r}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all duration-200 ${filters.rating === r 
                  ? 'bg-gradient-to-r from-electric-teal/20 to-vivid-magenta/20 border-l-2 border-electric-teal' 
                  : 'hover:bg-neutral-800'}`}
                onClick={() => onChange({ rating: filters.rating === r ? undefined : r })}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r ? 'text-electric-teal' : 'text-neutral-700'}>★</span>
                ))}
                <span className="ml-1 text-warm-tan-refresh">&amp; Up</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className="px-4">
          <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
            <span>Shipping</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative w-4 h-4 flex-shrink-0">
                <input
                  type="radio"
                  name="shipping"
                  checked={filters.shipping === 'free'}
                  onChange={() => onChange({ shipping: filters.shipping === 'free' ? undefined : 'free' })}
                  className="appearance-none w-4 h-4 border border-electric-teal/50 rounded-full bg-neutral-800 checked:border-electric-teal focus:outline-none focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
                />
                {filters.shipping === 'free' && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-electric-teal pointer-events-none"></div>
                )}
              </div>
              <span className="text-warm-tan-refresh group-hover:text-soft-ivory transition-colors duration-200">Free Shipping</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative w-4 h-4 flex-shrink-0">
                <input
                  type="radio"
                  name="shipping"
                  checked={filters.shipping === 'local'}
                  onChange={() => onChange({ shipping: filters.shipping === 'local' ? undefined : 'local' })}
                  className="appearance-none w-4 h-4 border border-electric-teal/50 rounded-full bg-neutral-800 checked:border-electric-teal focus:outline-none focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
                />
                {filters.shipping === 'local' && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-electric-teal pointer-events-none"></div>
                )}
              </div>
              <span className="text-warm-tan-refresh group-hover:text-soft-ivory transition-colors duration-200">Local</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative w-4 h-4 flex-shrink-0">
                <input
                  type="radio"
                  name="shipping"
                  checked={filters.shipping === 'any' || !filters.shipping}
                  onChange={() => onChange({ shipping: 'any' })}
                  className="appearance-none w-4 h-4 border border-electric-teal/50 rounded-full bg-neutral-800 checked:border-electric-teal focus:outline-none focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
                />
                {(filters.shipping === 'any' || !filters.shipping) && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-electric-teal pointer-events-none"></div>
                )}
              </div>
              <span className="text-warm-tan-refresh group-hover:text-soft-ivory transition-colors duration-200">Any</span>
            </label>
          </div>
        </div>

        {/* In Stock */}
        <div className="px-4">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative w-4 h-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={() => onChange({ inStock: !filters.inStock })}
                className="appearance-none w-4 h-4 border border-electric-teal/50 rounded-sm bg-neutral-800 checked:bg-electric-teal/20 focus:outline-none focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
              />
              {filters.inStock && (
                <svg className="absolute top-0 left-0 w-4 h-4 text-electric-teal pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-warm-tan-refresh group-hover:text-soft-ivory transition-colors duration-200">In Stock Only</span>
          </label>
        </div>

        {/* Attributes */}
        {Object.entries(availableAttributes).map(([attr, values]) => (
          <div key={attr} className="px-4">
            <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
              <span>{attr.charAt(0).toUpperCase() + attr.slice(1)}</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {values.map(val => (
                <button
                  key={val}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${filters.attributes?.[attr]?.includes(val) 
                    ? 'bg-gradient-to-r from-electric-teal/30 to-vivid-magenta/30 text-electric-teal border border-electric-teal/50' 
                    : 'bg-neutral-800 text-warm-tan-refresh hover:text-soft-ivory border border-neutral-700 hover:border-electric-teal/30'}`}
                  onClick={() => {
                    const current = filters.attributes?.[attr] || [];
                    onChange({ attributes: { ...filters.attributes, [attr]: current.includes(val) ? current.filter(v => v !== val) : [...current, val] } });
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Deals */}
        <div className="px-4">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative w-4 h-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={filters.dealsOnly || false}
                onChange={() => onChange({ dealsOnly: !filters.dealsOnly })}
                className="appearance-none w-4 h-4 border border-electric-teal/50 rounded-sm bg-neutral-800 checked:bg-electric-teal/20 focus:outline-none focus:ring-1 focus:ring-electric-teal transition-colors duration-200"
              />
              {filters.dealsOnly && (
                <svg className="absolute top-0 left-0 w-4 h-4 text-electric-teal pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-warm-tan-refresh group-hover:text-soft-ivory transition-colors duration-200">Deals Only</span>
          </label>
        </div>

        {/* Sustainability */}
        <div className="px-4">
          <h3 className="font-playfair text-lg font-semibold mb-3 text-soft-ivory relative pb-2">
            <span>Sustainability</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-electric-teal to-vivid-magenta"></span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {['eco-friendly', 'handmade', 'organic', 'recycled'].map(option => (
              <button
                key={option}
                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${filters.sustainability?.includes(option) 
                  ? 'bg-gradient-to-r from-electric-teal/30 to-vivid-magenta/30 text-electric-teal border border-electric-teal/50' 
                  : 'bg-neutral-800 text-warm-tan-refresh hover:text-soft-ivory border border-neutral-700 hover:border-electric-teal/30'}`}
                onClick={() => {
                  const current = filters.sustainability || [];
                  onChange({ sustainability: current.includes(option) ? current.filter(o => o !== option) : [...current, option] });
                }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DiscoverFilterPanel;
