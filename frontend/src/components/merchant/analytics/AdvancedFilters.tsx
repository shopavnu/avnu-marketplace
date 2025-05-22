import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { format } from "date-fns";

// GraphQL query to fetch product categories
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

// GraphQL query to fetch products
const GET_PRODUCTS = gql`
  query GetProducts($categoryIds: [String!]) {
    products(categoryIds: $categoryIds) {
      id
      title
      price
      categories {
        id
        name
      }
    }
  }
`;

export interface FilterOptions {
  timeFrame: string;
  startDate: Date | null;
  endDate: Date | null;
  productIds: string[];
  categoryIds: string[];
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categoryIds || [],
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    filters.productIds || [],
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  // Fetch products based on selected categories
  const { data: productsData } = useQuery(GET_PRODUCTS, {
    variables: {
      categoryIds: selectedCategories.length > 0 ? selectedCategories : null,
    },
    skip: selectedCategories.length === 0 && !isExpanded,
  });

  const categories = categoriesData?.categories || [];
  const products = productsData?.products || [];

  // Time frame options
  const timeFrameOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  // Sort options
  const sortByOptions = [
    { value: "revenue", label: "Revenue" },
    { value: "orders", label: "Orders" },
    { value: "views", label: "Views" },
    { value: "conversionRate", label: "Conversion Rate" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "Descending" },
    { value: "asc", label: "Ascending" },
  ];

  // Handle time frame change
  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      timeFrame: e.target.value,
    });
  };

  // Handle date range change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      startDate: e.target.value ? new Date(e.target.value) : null,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      endDate: e.target.value ? new Date(e.target.value) : null,
    });
  };

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedCategories(selectedOptions);
    onFilterChange({
      ...filters,
      categoryIds: selectedOptions,
      // Reset product selection when categories change
      productIds: [],
    });
  };

  // Handle product selection
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedProducts(selectedOptions);
    onFilterChange({
      ...filters,
      productIds: selectedOptions,
    });
  };

  // Handle sort by change
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value,
    });
  };

  // Handle sort order change
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortOrder: e.target.value,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Filters</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sage-600 hover:text-sage-800 focus:outline-none"
        >
          {isExpanded ? "Hide Advanced Filters" : "Show Advanced Filters"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label
            htmlFor="timeFrame"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time Frame
          </label>
          <select
            id="timeFrame"
            value={filters.timeFrame}
            onChange={handleTimeFrameChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage"
          >
            {timeFrameOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={
              filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""
            }
            onChange={handleStartDateChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
            onChange={handleEndDateChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="categories"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categories
              </label>
              <select
                id="categories"
                multiple
                value={selectedCategories}
                onChange={handleCategoryChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage h-32"
              >
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>
            <div>
              <label
                htmlFor="products"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Products
              </label>
              <select
                id="products"
                multiple
                value={selectedProducts}
                onChange={handleProductChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage h-32"
                disabled={selectedCategories.length === 0}
              >
                {products.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedCategories.length === 0
                  ? "Select categories first"
                  : "Hold Ctrl/Cmd to select multiple"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort By
              </label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={handleSortByChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage"
              >
                {sortByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="sortOrder"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort Order
              </label>
              <select
                id="sortOrder"
                value={filters.sortOrder}
                onChange={handleSortOrderChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-sage focus:border-sage"
              >
                {sortOrderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
