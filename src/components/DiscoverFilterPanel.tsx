import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <aside className="w-full lg:w-64 xl:w-72 p-4 border-r border-gray-200 h-full bg-white">
      <div className="space-y-8">
        {/* Category */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Category</h3>
          <div className="flex flex-col gap-1">
            {availableCategories.map(cat => (
              <button
                key={cat}
                className={`text-left px-2 py-1 rounded ${filters.category === cat ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={() => onChange({ category: filters.category === cat ? undefined : cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Brand</h3>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brand?.includes(brand) || false}
                  onChange={() => {
                    const current = filters.brand || [];
                    onChange({ brand: current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand] });
                  }}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Price Range</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={0}
              placeholder="Min"
              className="w-16 border rounded px-2 py-1"
              value={filters.minPrice ?? ''}
              onChange={e => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
            <span>-</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              className="w-16 border rounded px-2 py-1"
              value={filters.maxPrice ?? ''}
              onChange={e => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Avg. Customer Review</h3>
          <div className="flex flex-col gap-1">
            {ratings.map(r => (
              <button
                key={r}
                className={`flex items-center gap-1 px-2 py-1 rounded ${filters.rating === r ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={() => onChange({ rating: filters.rating === r ? undefined : r })}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
                & Up
              </button>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Shipping</h3>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="shipping"
                checked={filters.shipping === 'free'}
                onChange={() => onChange({ shipping: filters.shipping === 'free' ? undefined : 'free' })}
              />
              Free Shipping
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="shipping"
                checked={filters.shipping === 'local'}
                onChange={() => onChange({ shipping: filters.shipping === 'local' ? undefined : 'local' })}
              />
              Local
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="shipping"
                checked={filters.shipping === 'any' || !filters.shipping}
                onChange={() => onChange({ shipping: 'any' })}
              />
              Any
            </label>
          </div>
        </div>

        {/* In Stock */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={() => onChange({ inStock: !filters.inStock })}
            />
            In Stock Only
          </label>
        </div>

        {/* Attributes */}
        {Object.entries(availableAttributes).map(([attr, values]) => (
          <div key={attr}>
            <h3 className="text-lg font-semibold mb-2">{attr.charAt(0).toUpperCase() + attr.slice(1)}</h3>
            <div className="flex flex-wrap gap-1">
              {values.map(val => (
                <button
                  key={val}
                  className={`px-2 py-1 rounded text-sm ${filters.attributes?.[attr]?.includes(val) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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

        {/* Deals/Sustainability */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.dealsOnly || false}
              onChange={() => onChange({ dealsOnly: !filters.dealsOnly })}
            />
            Deals Only
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Sustainability</h3>
          <div className="flex flex-wrap gap-1">
            {['eco-friendly', 'handmade', 'organic', 'recycled'].map(option => (
              <button
                key={option}
                className={`px-2 py-1 rounded text-sm ${filters.sustainability?.includes(option) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
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
