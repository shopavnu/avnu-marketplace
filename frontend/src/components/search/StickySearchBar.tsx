import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScrollPosition } from "@/hooks/useScrollAnimation";
import SearchBar from "./SearchBar";

interface StickySearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

const StickySearchBar: React.FC<StickySearchBarProps> = ({
  onSearch,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { isScrolled, scrollDirection } = useScrollPosition();

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
        setRecentSearches([]);
      }
    }
  }, []);

  // Handle click outside to collapse search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Save to recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter((s) => s !== query),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    // Call the onSearch prop
    onSearch(query);

    // Collapse the search bar after search
    setIsExpanded(false);
  };

  // Default filter pills for demonstration
  const filterPills = [
    { id: "sustainable", label: "Sustainable", active: false },
    { id: "handmade", label: "Handmade", active: false },
    { id: "local", label: "Local", active: false },
  ];

  return (
    <motion.div
      ref={searchBarRef}
      className={`fixed top-0 right-0 z-50 transition-all duration-300 ${className}`}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isScrolled ? 0 : 0,
        opacity: 1,
      }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            className="p-4 bg-white/95 backdrop-blur-md shadow-lg rounded-lg m-4"
            initial={{ opacity: 0, width: "auto", height: "auto" }}
            animate={{ opacity: 1, width: "auto", height: "auto" }}
            exit={{ opacity: 0, width: "auto", height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full md:w-[500px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                recentSearches={recentSearches}
                suggestions={[]}
                filterPills={filterPills}
                onFilterPillClick={() => {}}
                variant="default"
              />
              <button
                onClick={() => setIsExpanded(false)}
                className="mt-4 text-neutral-gray hover:text-sage transition-colors text-sm flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Close
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            className={`p-3 bg-white shadow-md rounded-full m-4 flex items-center justify-center hover:bg-sage hover:text-white transition-all duration-300 ${isScrolled ? "opacity-90" : "opacity-0 pointer-events-none"}`}
            onClick={() => setIsExpanded(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: isScrolled ? 0.9 : 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StickySearchBar;
