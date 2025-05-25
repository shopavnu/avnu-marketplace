import React, { useState, useEffect, useCallback, useRef } from "react";
import { Section, SectionType } from "@/data/sections";
import { Product } from "@/data/products";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import ConsistentProductCard from "@/components/products/ConsistentProductCard";
import personalizationService from "@/services/personalization";

interface ProgressiveDiscoveryFeedProps {
  sections: Section[];
  className?: string;
  priorityThreshold?: number;
}

/**
 * A discovery feed component that progressively loads sections and products
 * as the user scrolls down the page
 */
const ProgressiveDiscoveryFeed: React.FC<ProgressiveDiscoveryFeedProps> = ({
  sections,
  className = "",
  priorityThreshold = 2, // Number of sections to prioritize loading
}) => {
  // Track which sections have been loaded
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [sectionProducts, setSectionProducts] = useState<
    Record<string, Product[]>
  >({});

  // Initialize with priority sections
  useEffect(() => {
    const initialVisibleSections: Record<string, boolean> = {};

    // Mark priority sections as visible by default
    sections.slice(0, priorityThreshold).forEach((section) => {
      initialVisibleSections[section.id] = true;
    });

    setVisibleSections(initialVisibleSections);
  }, [sections, priorityThreshold]);

  // Load products for a section
  const loadSectionProducts = useCallback(
    async (section: Section, page: number, pageSize: number) => {
      // Simulate API call with a delay for demonstration
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter products based on section type
      let sectionItems = section.items || [];

      // If it's the For You section, get personalized recommendations
      if (section.type === SectionType.FOR_YOU) {
        // Pass empty array as first param since we're loading initial recommendations
        sectionItems = personalizationService.loadMoreRecommendations(
          [],
          pageSize,
          page,
        );
      }

      // Return a slice of products for the current page
      const startIndex = (page - 1) * pageSize;
      return sectionItems.slice(startIndex, startIndex + pageSize);
    },
    [],
  );

  // Track section visibility and loading state
  const [sectionRefs, setSectionRefs] = useState<
    Record<string, React.RefObject<HTMLDivElement>>
  >({});
  const [sectionIntersecting, setSectionIntersecting] = useState<
    Record<string, boolean>
  >({});
  const [sectionLoadingState, setSectionLoadingState] = useState<
    Record<
      string,
      {
        products: Product[];
        isLoading: boolean;
        hasMore: boolean;
        loadMoreRef: React.RefObject<HTMLDivElement>;
        isInitialLoading: boolean;
      }
    >
  >({});

  // Initialize refs for all sections
  useEffect(() => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {};
    sections.forEach((section) => {
      refs[section.id] = React.createRef<HTMLDivElement>() as unknown as React.RefObject<HTMLDivElement>;
    });
    setSectionRefs(refs);
  }, [sections]);

  // Set up intersection observers for all sections
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      if (!sectionRefs[section.id]?.current || visibleSections[section.id])
        return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !visibleSections[section.id]) {
            setSectionIntersecting((prev) => ({
              ...prev,
              [section.id]: true,
            }));

            setVisibleSections((prev) => ({
              ...prev,
              [section.id]: true,
            }));
          }
        },
        {
          rootMargin: "400px 0px",
          threshold: 0,
        },
      );

      const currentRef = sectionRefs[section.id].current;
      if (currentRef) {
        observer.observe(currentRef);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sections, sectionRefs, visibleSections]);

  // Load products for visible sections
  useEffect(() => {
    sections.forEach((section) => {
      if (!visibleSections[section.id] || sectionLoadingState[section.id])
        return;

      // Initialize loading state for this section
      const loadMoreRef = React.createRef<HTMLDivElement>();

      // Function to load more products for this section
      const loadProductsForSection = async (page: number, pageSize: number) => {
        return loadSectionProducts(section, page, pageSize);
      };

      // Track loading state for this section
      setSectionLoadingState((prev) => ({
        ...prev,
        [section.id]: {
          products: [],
          isLoading: true,
          hasMore: true,
          loadMoreRef,
          isInitialLoading: true,
        },
      }));

      // Initial load
      loadProductsForSection(1, 8).then((products) => {
        setSectionLoadingState((prev) => ({
          ...prev,
          [section.id]: {
            ...prev[section.id],
            products,
            isLoading: false,
            hasMore: products.length === 8,
            isInitialLoading: false,
          },
        }));

        setSectionProducts((prev) => ({
          ...prev,
          [section.id]: products,
        }));
      });
    });
  }, [visibleSections, sections, loadSectionProducts, sectionLoadingState]);

  // Function to load more products for a section
  const loadMoreProducts = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const currentState = sectionLoadingState[sectionId];
      if (!currentState || currentState.isLoading || !currentState.hasMore)
        return;

      // Set loading state
      setSectionLoadingState((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          isLoading: true,
        },
      }));

      // Calculate next page
      const currentPage = Math.ceil(currentState.products.length / 8);
      const nextPage = currentPage + 1;

      // Load more products
      loadSectionProducts(section, nextPage, 8).then((newProducts) => {
        setSectionLoadingState((prev) => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            products: [...prev[sectionId].products, ...newProducts],
            isLoading: false,
            hasMore: newProducts.length === 8,
          },
        }));

        setSectionProducts((prev) => ({
          ...prev,
          [sectionId]: [...(prev[sectionId] || []), ...newProducts],
        }));
      });
    },
    [sections, sectionLoadingState, loadSectionProducts],
  );

  // Set up intersection observers for load more refs
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    Object.entries(sectionLoadingState).forEach(([sectionId, state]) => {
      if (!state.loadMoreRef?.current || !state.hasMore || state.isLoading)
        return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreProducts(sectionId);
          }
        },
        {
          rootMargin: "200px 0px",
          threshold: 0,
        },
      );

      if (state.loadMoreRef.current) {
        observer.observe(state.loadMoreRef.current);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [loadMoreProducts, sectionLoadingState]);

  // Create section components
  const sectionComponents = sections.map((section) => {
    const state = sectionLoadingState[section.id] || {
      products: [],
      isLoading: false,
      hasMore: false,
      loadMoreRef: React.createRef<HTMLDivElement>(),
      isInitialLoading: true,
    };

    // Render section based on visibility and loading state
    return (
      <div
        key={section.id}
        ref={sectionRefs[section.id]}
        className={`mb-16 ${section.backgroundColor || ""}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            {section.description && (
              <p className="text-gray-500 mt-1">{section.description}</p>
            )}
          </div>

          {/* Section content */}
          {visibleSections[section.id] ? (
            <>
              {/* Product grid */}
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                style={{
                  display: "grid",
                  gridTemplateRows: "repeat(auto-fill, 360px)",
                  contain: "layout",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {state.products.map((product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    style={{
                      height: "360px",
                      width: "100%",
                      contain: "strict",
                      position: "relative",
                    }}
                  >
                    <ConsistentProductCard
                      product={product}
                      badges={
                        product.isNew ? (
                          <span className="bg-sage text-white text-xs font-medium px-2 py-1 rounded">
                            New
                          </span>
                        ) : product.isTrending ? (
                          <span className="bg-coral text-white text-xs font-medium px-2 py-1 rounded">
                            Trending
                          </span>
                        ) : null
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Loading indicator */}
              {state.isLoading && (
                <div className="mt-8">
                  <ProductGridSkeleton count={4} columns={4} gap="1.5rem" />
                </div>
              )}

              {/* Load more button */}
              {state.hasMore && !state.isLoading && (
                <div
                  ref={state.loadMoreRef}
                  className="w-full py-8 flex justify-center"
                >
                  <button
                    onClick={() => loadMoreProducts(section.id)}
                    className="px-6 py-2 bg-sage text-white rounded-md hover:bg-sage/90 transition-colors"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          ) : (
            // Skeleton loading state
            <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
          )}
        </div>
      </div>
    );
  });

  return <div className={className}>{sectionComponents}</div>;
};

export default ProgressiveDiscoveryFeed;
