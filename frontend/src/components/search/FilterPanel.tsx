import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchFilters } from "../../types/search";
import { analyticsService } from "../../services/analytics.service";
import { useRouter } from "next/router";

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

interface Cause {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
  subCategories: string[];
}

export const causes: Cause[] = [
  {
    id: "sustainable",
    name: "Sustainable",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    ),
  },
  {
    id: "minority-owned",
    name: "Minority Owned",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    id: "veteran-owned",
    name: "Veteran Owned",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
  },
  {
    id: "eco-friendly",
    name: "Eco Friendly",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525"
        />
      </svg>
    ),
  },
  {
    id: "local",
    name: "Local Business",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
        />
      </svg>
    ),
  },
];

const categories: Category[] = [
  { id: "apparel", name: "Apparel", subCategories: ["Men", "Women", "Kids"] },
  { id: "home", name: "Home", subCategories: ["Decor", "Kitchen", "Bath"] },
  {
    id: "outdoors",
    name: "Outdoors",
    subCategories: ["Camping", "Hiking", "Sports"],
  },
  {
    id: "pet-supplies",
    name: "Pet Supplies",
    subCategories: ["Dogs", "Cats", "Other"],
  },
];

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const { query } = router.query;
  const searchQuery = Array.isArray(query) ? query[0] : query;

  // Define additional filter state properties not in SearchFilters
  const [isNew, setIsNew] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Initialize local state based on props
  useEffect(() => {
    if (filters.categories?.length) {
      setSelectedCategory(filters.categories[0]);
      if (filters.categories.length > 1) {
        setSelectedSubCategory(filters.categories[1]);
      }
    }
    if (filters.values?.length) {
      setSelectedCauses(filters.values);
    }
  }, [filters.categories, filters.values]);

  // Custom filter functions
  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    onChange(newFilters);
    
    // Track filter application
    if (Object.keys(updates).length > 0) {
      // Using the proper trackFilterApply method
      Object.entries(updates).forEach(([filterType, filterValue]) => {
        analyticsService.trackFilterApply(filterType, filterValue, searchQuery as string);
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // If already selected, clear the category filter
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      
      // Update categories in the actual filters
      updateFilters({
        categories: [],
      });
      
      // Log analytics event for category deselection
      analyticsService.trackCategoryClick(categoryId, searchQuery as string);
    } else {
      // Set the new category
      setSelectedCategory(categoryId);
      setSelectedSubCategory(null);
      
      // Update categories in the actual filters
      updateFilters({
        categories: [categoryId],
      });
      
      // Log analytics event for category selection
      analyticsService.trackCategoryClick(categoryId, searchQuery as string);
    }
  };

  const FilterSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-montserrat font-bold text-charcoal mb-3">
          {title}
        </h3>
        {children}
      </div>
    );
  };

  const FilterButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${active ? "bg-sage/10 text-sage" : "bg-white hover:bg-sage/5 text-charcoal"}`}
      >
        {children}
      </button>
    );
  };

  const content = (
    <div className="space-y-6">
      <FilterSection title="Quick Filters">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={isNew}
            onClick={() => setIsNew(!isNew)}
          >
            New Arrivals
          </FilterButton>
          <FilterButton
            active={isLocal}
            onClick={() => setIsLocal(!isLocal)}
          >
            Local Shops
          </FilterButton>
          <FilterButton
            active={freeShipping}
            onClick={() => setFreeShipping(!freeShipping)}
          >
            Free Shipping
          </FilterButton>
        </div>
      </FilterSection>

      <FilterSection title="Supported Causes">
        <div className="grid grid-cols-2 gap-2">
          {causes.map((cause) => (
            <FilterButton
              key={cause.id}
              active={selectedCauses.includes(cause.id)}
              onClick={() => {
                // Toggle the cause in the local state
                const newCauses = selectedCauses.includes(cause.id)
                  ? selectedCauses.filter((id) => id !== cause.id)
                  : [...selectedCauses, cause.id];
                
                setSelectedCauses(newCauses);
                
                // Update the values in SearchFilters
                updateFilters({
                  values: newCauses.length > 0 ? newCauses : undefined
                });
                
                // Track cause click
                analyticsService.trackCauseClick(cause.id, searchQuery as string);
              }}
            >
              <div className="flex items-center gap-1.5">
                {cause.icon}
                <span>{cause.name}</span>
              </div>
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Categories">
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="space-y-1">
              <FilterButton
                active={selectedCategory === category.id}
                onClick={() => toggleCategory(category.id)}
              >
                {category.name}
              </FilterButton>

              {/* Show subcategories if this category is selected */}
              {selectedCategory === category.id && (
                <div className="pl-4 space-y-1">
                  {category.subCategories.map((subCat) => (
                    <FilterButton
                      key={subCat}
                      active={selectedSubCategory === subCat}
                      onClick={() => {
                        setSelectedSubCategory(subCat);
                        
                        // Update categories in the actual filters
                        updateFilters({
                          categories: [category.id, subCat],
                        });
                      }}
                    >
                      {subCat}
                    </FilterButton>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min || ""}
              onChange={(e) => {
                const min = Number(e.target.value);
                updateFilters({
                  priceRange: {
                    min: min || 0,
                    max: filters.priceRange?.max || undefined,
                  },
                });
              }}
              className="w-full px-3 py-2 rounded-lg border-2 border-sage/20 
                       focus:border-sage outline-none transition-colors duration-200"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max || ""}
              onChange={(e) => {
                const max = Number(e.target.value);
                updateFilters({
                  priceRange: {
                    min: filters.priceRange?.min || 0,
                    max: max || 0,
                  },
                });
              }}
              className="w-full px-3 py-2 rounded-lg border-2 border-sage/20 
                       focus:border-sage outline-none transition-colors duration-200"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden md:block">{content}</div>

      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full px-4 py-3 rounded-full border-2 border-sage/20 
                   text-charcoal font-medium flex items-center justify-center gap-2"
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
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
          Filters
        </button>

        {/* Mobile Filter Panel */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 
                         overflow-y-auto safe-top safe-bottom safe-right"
              >
                <div className="sticky top-0 bg-white/80 backdrop-blur-lg p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-montserrat font-bold text-charcoal">
                      Filters
                    </h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 text-neutral-gray hover:text-charcoal 
                               transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">{content}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
