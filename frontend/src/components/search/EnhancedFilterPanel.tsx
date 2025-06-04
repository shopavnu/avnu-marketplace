import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchFilters, FacetType, FacetValue, PartialPriceRange } from "../../types/search";
import { analyticsService } from "../../services/analytics.service";
import { useRouter } from "next/router";

interface EnhancedFilterPanelProps {
  filters: SearchFilters;
  facets: FacetType[];
  onChange: (filters: SearchFilters) => void;
  isLoading?: boolean;
}



interface FilterValues {
  [key: string]: string[];
}

interface FilterUpdates {
  categories?: string[];
  brandName?: string | undefined;
  priceRange?: PartialPriceRange;
  values?: string[] | undefined;
}

export const EnhancedFilterPanel = ({
  filters,
  facets,
  onChange,
  isLoading,
}: EnhancedFilterPanelProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    {}
  );
  const router = useRouter();

  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    facets.forEach((facet) => {
      initialExpandedState[facet.name] = true; // Start expanded by default
    });
    setExpandedSections(initialExpandedState);
  }, [facets]);

  const updateFilters = (updates: FilterUpdates) => {
    const newFilters: SearchFilters = { ...filters, ...updates };

    analyticsService.trackEvent({
      event: "filter_selected",
      properties: {
        filter_type: Object.keys(updates)[0],
        filter_value: JSON.stringify(Object.values(updates)[0]),
        page: router.pathname,
        query: router.query.q,
      },
    });

    onChange(newFilters);
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleFacetSelection = (
    facetName: string,
    value: string,
    checked: boolean
  ) => {
    switch (facetName) {
      case "category":
        const currentCategories = filters.categories || [];
        const newCategories = checked
          ? [...currentCategories, value]
          : currentCategories.filter((cat: string) => cat !== value);

        updateFilters({ categories: newCategories });
        break;

      case "brand":
        updateFilters({ brandName: checked ? value : undefined });
        break;

      case "price":
        const priceValues = value.replace(/\$/g, "").split("-");
        const min = parseFloat(priceValues[0]);
        const max = priceValues[1] === "∞" ? undefined : parseFloat(priceValues[1]);

        if (checked) {
          updateFilters({ priceRange: { min, max } });
        } else if (!checked && filters.priceRange?.min === min && filters.priceRange?.max === max) {
          updateFilters({ priceRange: undefined });
        }
        break;

      default:
        const currentValues = filters.values || [];
        const newValues = checked
          ? [...currentValues, value]
          : currentValues.filter((val: string) => val !== value);

        updateFilters({ values: newValues.length > 0 ? newValues : undefined });
        break;
    }
  };

  const isValueSelected = (facetName: string, value: string): boolean => {
    switch (facetName) {
      case "category":
        return (filters.categories || []).includes(value);
      case "brand":
        return filters.brandName === value;
      case "price":
        if (!filters.priceRange) return false;

        const priceValues = value.replace(/\$/g, "").split("-");
        const min = parseFloat(priceValues[0]);
        const max = priceValues[1] === "∞" ? undefined : parseFloat(priceValues[1]);

        return (
          filters.priceRange.min === min &&
          ((!max && !filters.priceRange.max) || (max === filters.priceRange.max))
        );
      default:
        return (filters.values || []).includes(value);
    }
  };

  const resetFilters = () => {
    onChange({});

    analyticsService.trackEvent({
      event: "filter_reset",
      properties: {
        page: router.pathname,
        query: router.query.q,
      },
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Clear Filters Button */}
      {Object.keys(filters).some((key) =>
        Array.isArray(filters[key as keyof SearchFilters])
          ? (filters[key as keyof SearchFilters] as any[]).length > 0
          : !!filters[key as keyof SearchFilters]
      ) && (
        <button
          onClick={resetFilters}
          className="text-sage hover:text-sage-dark font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
          Clear all filters
        </button>
      )}

      {/* Dynamic Facet Sections */}
      {facets.map((facet) => (
        <div key={facet.name} className="border-b border-neutral-200 pb-4">
          <button
            onClick={() => toggleSection(facet.name)}
            className="flex items-center justify-between w-full py-2 font-montserrat font-semibold text-charcoal"
          >
            <span>{facet.displayName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform ${
                expandedSections[facet.name] ? "transform rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          <AnimatePresence>
            {expandedSections[facet.name] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  {facet.values.map((option: FacetValue) => (
                    <label
                      key={`${facet.name}-${option.value}`}
                      className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-1 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isValueSelected(facet.name, option.value)}
                        onChange={(e) =>
                          handleFacetSelection(
                            facet.name,
                            option.value,
                            e.target.checked
                          )
                        }
                        className="rounded text-sage focus:ring-sage-light"
                      />
                      <span className="text-sm text-charcoal flex-1">
                        {option.value}
                      </span>
                      <span className="text-xs text-neutral-gray">
                        ({option.count})
                      </span>
                    </label>
                  ))}

                  {/* Show loading skeleton when loading */}
                  {isLoading && facet.values.length === 0 && (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  )}

                  {/* Show "No options available" when no values and not loading */}
                  {!isLoading && facet.values.length === 0 && (
                    <div className="text-sm text-neutral-gray italic p-1">
                      No options available
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Price Range Inputs (Custom Input) */}
      <div className="border-b border-neutral-200 pb-4">
        <button
          onClick={() => toggleSection("priceInput")}
          className="flex items-center justify-between w-full py-2 font-montserrat font-semibold text-charcoal"
        >
          <span>Custom Price Range</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4 h-4 transition-transform ${
              expandedSections["priceInput"] ? "transform rotate-180" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        <AnimatePresence>
          {expandedSections["priceInput"] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2 flex gap-2 items-center">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange?.min || ""}
                      onChange={(e) => {
                        const min = e.target.value
                          ? Number(e.target.value)
                          : undefined;
                        updateFilters({
                          priceRange: {
                            min,
                            max: filters.priceRange?.max,
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
                        const max = e.target.value ? Number(e.target.value) : undefined;
                        updateFilters({
                          priceRange: {
                            min: filters.priceRange?.min,
                            max,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border-2 border-sage/20 
                              focus:border-sage outline-none transition-colors duration-200"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (filters.priceRange?.min || filters.priceRange?.max) {
                        updateFilters({
                          priceRange: {
                            min: filters.priceRange?.min,
                            max: filters.priceRange?.max,
                          },
                        });
                      }
                    }}
                    disabled={!filters.priceRange?.min && !filters.priceRange?.max}
                    className="w-full py-2 bg-sage text-white rounded-lg font-medium 
                             disabled:bg-neutral-200 disabled:text-neutral-400 
                             transition-colors duration-200"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
          Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
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
                
                {/* Apply button for mobile */}
                <div className="sticky bottom-0 p-4 bg-white/80 backdrop-blur-lg border-t">
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 bg-sage text-white rounded-lg font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
