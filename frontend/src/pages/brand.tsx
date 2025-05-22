import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import { BrandCard } from "@/components/brands";
import { brands as allBrands } from "@/data/brands";
import { Brand } from "@/types/brand";
import { SearchFilters } from "@/types/search";

const BrandPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [displayedBrands, setDisplayedBrands] = useState<Brand[]>(allBrands);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let filtered = allBrands;

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (brand) =>
          brand.name.toLowerCase().includes(queryLower) ||
          (brand.description &&
            brand.description.toLowerCase().includes(queryLower)),
      );
    }

    setDisplayedBrands(filtered);

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const suggestions = Array.from(
        new Set([
          ...allBrands
            .map((b) => b.name)
            .filter(
              (name) =>
                name.toLowerCase().includes(query) &&
                name.toLowerCase() !== query,
            )
            .slice(0, 4),
        ]),
      );
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, filters]);

  const handleSearch = (query: string, newFilters: SearchFilters = filters) => {
    setSearchQuery(query);
    setFilters(newFilters);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev].slice(0, 5)); // Keep last 5
    }
    // In a real app, might trigger refetch or more complex filtering
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Sticky Search Bar */}
      <div className="sticky top-[var(--header-height,64px)] z-40 bg-warm-white/80 backdrop-blur-lg safe-top">
        <div className="container mx-auto px-4 py-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => handleSearch(query)}
            suggestions={searchSuggestions}
            recentSearches={recentSearches}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 safe-left safe-right safe-bottom">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <FilterPanel
              filters={filters}
              onChange={(newFilters: SearchFilters) => {
                setFilters(newFilters);
                // Optionally trigger handleSearch if filters should immediately update results
                // handleSearch(searchQuery, newFilters);
              }}
              // suggestedFilters={[]}
            />
          </div>

          <div className="flex-1">
            <AnimatePresence>
              {displayedBrands.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 },
                    },
                  }}
                >
                  {displayedBrands.map((brand) => (
                    <motion.div
                      key={brand.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <BrandCard brand={brand} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 text-gray-500"
                >
                  No brands found matching your criteria.
                </motion.div>
              )}
            </AnimatePresence>
            {/* TODO: Add pagination or infinite scroll if needed */}
          </div>
        </div>
      </main>

      {/* Basic Footer structure from index.tsx */}
      <footer className="bg-charcoal text-warm-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            {/* Add footer links */}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            {/* Add footer links */}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            {/* Add social links */}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            {/* Add newsletter signup */}
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-neutral-700 text-sm text-neutral-400">
          {new Date().getFullYear()} Avnu Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BrandPage;
