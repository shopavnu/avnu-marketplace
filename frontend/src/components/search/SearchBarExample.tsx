import { useState } from "react";
import SearchBar from "./SearchBar";

// Example filter pills for demonstration
const defaultFilterPills = [
  { id: "sustainable", label: "Sustainable", active: false },
  { id: "local", label: "Local Brands", active: false },
  { id: "handmade", label: "Handmade", active: false },
  { id: "vegan", label: "Vegan", active: false },
  { id: "eco-friendly", label: "Eco-Friendly", active: false },
  { id: "fair-trade", label: "Fair Trade", active: false },
];

// Example recent searches
const exampleRecentSearches = [
  "organic cotton",
  "recycled materials",
  "sustainable home",
  "zero waste",
];

// Example suggestions based on current input
const getSuggestions = (input: string) => {
  if (!input) return [];

  const allSuggestions = [
    "sustainable products",
    "sustainable fashion",
    "sustainable home goods",
    "sustainable kitchen",
    "sustainable beauty",
    "eco-friendly products",
    "vegan products",
    "handmade items",
    "local artisans",
    "fair trade coffee",
    "organic clothing",
    "recycled materials",
  ];

  return allSuggestions
    .filter((suggestion) =>
      suggestion.toLowerCase().includes(input.toLowerCase()),
    )
    .slice(0, 5);
};

export default function SearchBarExample() {
  const [searchValue, setSearchValue] = useState("");
  const [filterPills, setFilterPills] = useState(defaultFilterPills);

  // Handle search submission
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // In a real implementation, this would trigger a search API call
  };

  // Handle filter pill click
  const handleFilterPillClick = (pillId: string) => {
    setFilterPills((pills) =>
      pills.map((pill) =>
        pill.id === pillId ? { ...pill, active: !pill.active } : pill,
      ),
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-montserrat font-medium text-charcoal mb-8 text-center">
        Discover Sustainable Products
      </h1>

      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        onSearch={handleSearch}
        recentSearches={exampleRecentSearches}
        suggestions={getSuggestions(searchValue)}
        filterPills={filterPills}
        onFilterPillClick={handleFilterPillClick}
        variant="prominent"
        className="mb-12"
      />

      {/* Example content showing active filters */}
      <div className="mt-8">
        {filterPills.some((pill) => pill.active) && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              Active Filters:
            </h2>
            <div className="flex flex-wrap gap-2">
              {filterPills
                .filter((pill) => pill.active)
                .map((pill) => (
                  <span
                    key={pill.id}
                    className="bg-sage/10 text-sage px-3 py-1 rounded-full text-sm"
                  >
                    {pill.label}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
