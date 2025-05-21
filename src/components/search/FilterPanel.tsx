/*
  TEMPORARY: This file contains some unused imports and variables that are expected to be used
  in future development (e.g., when integrating real merchant data or new features).
  eslint-disable-next-line comments have been added to allow builds to pass during development.
  BEFORE PRODUCTION: Remove these disables and clean up all unused code.
*/
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters, Category, SubCategory, ProductAttribute } from '@/types/search';

// Define these types locally if needed
export type SimpleFilterChange =
  | { categories: string[] }
  | { causes: string[] }
  | { isLocal: boolean }
  | { isNew: boolean };

export type AttributeChangeDetail = {
  action: 'addAttributeValue' | 'removeAttributeValue';
  categoryId: string;
  attributeName: string;
  value: string;
};

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (change: SimpleFilterChange | AttributeChangeDetail) => void;
  categories: Category[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, categories }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleToggleFilter = (key: 'isLocal' | 'isNew') => {
    let update: SimpleFilterChange | null = null;
    if (key === 'isLocal') {
      update = { isLocal: !filters.isLocal };
    } else if (key === 'isNew') {
      update = { isNew: !filters.isNew };
    }
    if (update !== null) {
      onChange(update);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleCategoryClick = (subCategoryId: string) => {
    const currentCategories = (filters.categories ?? []) as string[];
    const isSelected = currentCategories.includes(subCategoryId);
    const update: SimpleFilterChange = {
      categories: isSelected
        ? currentCategories.filter((id: string) => id !== subCategoryId)
        : [...currentCategories, subCategoryId]
    };
    onChange(update);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCauseClick = (causeId: string) => {
    const currentCauses = (filters.causes ?? []) as string[];
    const isSelected = currentCauses.includes(causeId);
    const update: SimpleFilterChange = {
      causes: isSelected
        ? currentCauses.filter((id: string) => id !== causeId)
        : [...currentCauses, causeId]
    };
    onChange(update);
  };

  const handleAttributeValueClick = (categoryId: string, attributeName: string, value: string) => {
    const currentCategoryAttributes = filters.attributes?.[categoryId];
    const currentAttributeValues = currentCategoryAttributes?.[attributeName];
    const valueExists = Array.isArray(currentAttributeValues) && currentAttributeValues.includes(value);

    const changeDetail: AttributeChangeDetail = {
      action: valueExists ? 'removeAttributeValue' : 'addAttributeValue',
      categoryId,
      attributeName,
      value,
    };

    onChange(changeDetail);
  };

  const renderToggleButton = (label: string, key: 'isLocal' | 'isNew') => {
    return (
      <button
        type="button"
        onClick={() => handleToggleFilter(key)}
        className={`text-sm px-3 py-1.5 rounded mr-2 mb-2 transition-colors duration-150 ease-in-out ${filters[key] ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
        {label}
      </button>
    );
  };

  const content = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        {categories.map((category: Category) => (
          <div key={category.id} className="mb-2">
            <button
              type="button"
              className="w-full text-left flex justify-between items-center font-medium"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
              <motion.span
                animate={{ rotate: expandedCategories[category.id] ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                &#9660; {/* Down arrow */}
              </motion.span>
            </button>
            <AnimatePresence>
              {expandedCategories[category.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-4 mt-2"
                >
                  {category.subCategories.map((subCategory: SubCategory) => (
                    <div key={subCategory.id} className="mb-1">
                      <button
                        type="button"
                        className={`text-sm ${Array.isArray(filters.categories) && filters.categories.includes(subCategory.id) ? 'text-primary font-semibold' : 'text-gray-600'} hover:text-primary`}
                        onClick={() => handleCategoryClick(subCategory.id)}
                      >
                        {subCategory.name}
                      </button>
                      {/* Render Attributes if they exist */}
                      {subCategory.attributes && subCategory.attributes.length > 0 && (
                        <div className="ml-4 mt-1">
                          {subCategory.attributes.map((attribute: ProductAttribute) => (
                            <div key={attribute.name} className="mb-1">
                              <span className="text-xs font-medium text-gray-500 block">{attribute.name}</span>
                              {attribute.values.map((value: string) => (
                                <button
                                  key={value}
                                  type="button"
                                  className={`text-xs px-2 py-1 mr-1 mb-1 rounded ${
                                    Array.isArray(filters.attributes?.[category.id]?.[attribute.name]) &&
                                    filters.attributes?.[category.id]?.[attribute.name]?.includes(value)
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-600'
                                  } hover:bg-blue-50`}
                                  onClick={() => handleAttributeValueClick(category.id, attribute.name, value)}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        <h4 className="font-montserrat font-medium text-neutral-gray">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          {renderToggleButton('Local', 'isLocal')}
          {renderToggleButton('New', 'isNew')}
        </div>
      </div>

      {/* Causes */}
      <div className="space-y-4">
        <h4 className="font-montserrat font-medium text-neutral-gray">Causes</h4>
        {/* TODO: Implement Cause filter rendering logic based on available causes data */}
        {/* Example: renderFilterButtons('causes', availableCauses) */}
      </div>

      {/* Category-specific Attributes are rendered within the category expansion */}
    </div>
  );

  return (
    <div className="w-full lg:w-64 xl:w-72">
      {/* Desktop Filters */}
      <div className="hidden lg:block p-4 border-r border-gray-200 h-full">
        {content}
      </div>
    </div>
  );
};

export default FilterPanel;
