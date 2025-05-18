import React from 'react';
import { DiscoverFilters } from './DiscoverFilterPanel';

interface ActiveFilterPillsProps {
  filters: DiscoverFilters;
  onRemove: (key: keyof DiscoverFilters, value?: string) => void;
}

const labelMap: Record<string, string> = {
  category: 'Category',
  brand: 'Brand',
  minPrice: 'Min Price',
  maxPrice: 'Max Price',
  rating: 'Rating',
  shipping: 'Shipping',
  inStock: 'In Stock',
  dealsOnly: 'Deals',
  sustainability: 'Sustainability',
};

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({ filters, onRemove }) => {
  const pills: { key: keyof DiscoverFilters; value: string }[] = [];
  Object.entries(filters).forEach(([key, val]) => {
    if (val === undefined || val === false || (Array.isArray(val) && val.length === 0)) return;
    if (Array.isArray(val)) {
      val.forEach(v => pills.push({ key: key as keyof DiscoverFilters, value: v }));
    } else if (typeof val === 'object') {
      Object.entries(val).forEach(([attr, arr]) => {
        if (Array.isArray(arr)) {
          arr.forEach(v => pills.push({ key: key as keyof DiscoverFilters, value: `${attr}: ${v}` }));
        }
      });
    } else if (typeof val === 'boolean') {
      pills.push({ key: key as keyof DiscoverFilters, value: labelMap[key] || key });
    } else {
      pills.push({ key: key as keyof DiscoverFilters, value: val.toString() });
    }
  });
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {pills.map((pill, i) => (
        <span
          key={pill.key + pill.value + i}
          className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-xs font-medium"
        >
          {pill.value}
          <button
            className="ml-2 text-white hover:text-gray-200 focus:outline-none"
            aria-label={`Remove ${pill.value}`}
            onClick={() => onRemove(pill.key, pill.value)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilterPills;
