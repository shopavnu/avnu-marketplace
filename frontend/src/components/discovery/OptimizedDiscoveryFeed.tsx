import React, { useState, useEffect, useCallback, useRef } from "react";
import { Section, SectionType } from "@/data/sections";
import { Product } from "@/data/products";
import VirtualizedProductGrid from "./VirtualizedProductGrid";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import PersonalizedGrid from "./PersonalizedGrid";

interface OptimizedDiscoveryFeedProps {
  sections: Section[];
  className?: string;
}

/**
 * An optimized version of the discovery feed that uses virtualization and lazy loading
 * for improved performance with long vertical scrolling
 */
const OptimizedDiscoveryFeed: React.FC<OptimizedDiscoveryFeedProps> = ({
  sections,
  className = "",
}) => {
  // Track which sections have been loaded
  const [loadedSections, setLoadedSections] = useState<Record<string, boolean>>(
    {},
  );

  // Load more products for a specific section
  const [sectionProducts, setSectionProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({});
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({});

  // Initialize section states
  useEffect(() => {
    const initialSectionProducts: Record<string, Product[]> = {};
    const initialHasMore: Record<string, boolean> = {};

    sections.forEach((section) => {
      // Start with a small subset of products for each section
      initialSectionProducts[section.id] = section.items?.slice(0, 8) || [];
      // Assume there are more products if the section has more than the initial batch
      initialHasMore[section.id] = (section.items?.length || 0) > 8;
    });

    setSectionProducts(initialSectionProducts);
    setHasMore(initialHasMore);
  }, [sections]);

  // Load more products for a specific section
  const loadMoreProducts = useCallback(
    (sectionId: string) => {
      setLoadingMore((prev) => ({ ...prev, [sectionId]: true }));

      // Simulate API call with setTimeout
      setTimeout(() => {
        setSectionProducts((prev) => {
          const section = sections.find((s) => s.id === sectionId);
          if (!section) return prev;

          const currentProducts = prev[sectionId] || [];
          const nextBatch =
            section.items?.slice(
              currentProducts.length,
              currentProducts.length + 8,
            ) || [];

          // Check if there are more products to load
          const updatedHasMore =
            (section.items?.length || 0) >
            currentProducts.length + nextBatch.length;
          setHasMore((prev) => ({ ...prev, [sectionId]: updatedHasMore }));

          // Update loading state
          setLoadingMore((prev) => ({ ...prev, [sectionId]: false }));

          return {
            ...prev,
            [sectionId]: [...currentProducts, ...nextBatch],
          };
        });
      }, 800); // Simulate network delay
    },
    [sections],
  );

  // Render a section based on its type
  const renderSection = (section: Section) => {
    // Skip rendering if section hasn't been loaded yet
    if (!loadedSections[section.id]) return null;

    // Special handling for personalized section
    if (section.type === SectionType.FOR_YOU) {
      return (
        <div key={section.id} className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">{section.title}</h2>
          <PersonalizedGrid products={section.items || []} />
        </div>
      );
    }

    // Regular product grid with virtualization
    return (
      <div key={section.id} className="mb-16">
        <VirtualizedProductGrid
          products={sectionProducts[section.id] || []}
          title={section.title}
          hasMore={hasMore[section.id]}
          onLoadMore={() => loadMoreProducts(section.id)}
          isLoading={loadingMore[section.id]}
          columns={4}
          gap={24}
        />
      </div>
    );
  };

  // Create refs for each section
  const [sectionRefs, setSectionRefs] = useState<
    Record<string, React.RefObject<HTMLDivElement>>
  >({});

  // Initialize refs for all sections
  useEffect(() => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {};
    sections.forEach((section) => {
      refs[section.id] = React.createRef<HTMLDivElement>();
    });
    setSectionRefs(refs);
  }, [sections]);

  // Set up intersection observers for all sections
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      if (!sectionRefs[section.id]?.current || loadedSections[section.id])
        return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setLoadedSections((prev) => ({ ...prev, [section.id]: true }));
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
  }, [sections, sectionRefs, loadedSections]);

  return (
    <div className={`w-full ${className}`}>
      {sections.map((section) => (
        <div key={section.id} ref={sectionRefs[section.id]}>
          {loadedSections[section.id] ? (
            renderSection(section)
          ) : (
            <div className="mb-16">
              <h2 className="text-2xl font-semibold mb-6">{section.title}</h2>
              <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OptimizedDiscoveryFeed;
