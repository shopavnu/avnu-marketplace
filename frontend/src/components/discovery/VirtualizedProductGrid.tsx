import React, { useState, useEffect } from "react";
import { Product } from "@/data/products";
import ConsistentProductCard from "@/components/products/ConsistentProductCard";
import useVirtualization from "@/hooks/useVirtualization";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

interface VirtualizedProductGridProps {
  products: Product[];
  title?: string;
  loadMoreThreshold?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  columns?: number;
  gap?: number;
  itemHeight?: number;
}

/**
 * A virtualized product grid that efficiently renders only the visible products
 * Supports infinite scrolling and lazy loading
 */
const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  title,
  loadMoreThreshold = 3,
  hasMore = false,
  onLoadMore,
  isLoading = false,
  emptyMessage = "No products found",
  className = "",
  columns = 4,
  gap = 24,
  itemHeight = 360,
}) => {
  const [containerHeight, setContainerHeight] = useState<number>(800); // Default height for SSR

  // Update container height on resize - only runs on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set initial height once on client side
      setContainerHeight(window.innerHeight);

      const handleResize = () => {
        setContainerHeight(window.innerHeight);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Set up virtualization
  const { virtualItems, totalHeight, containerRef, isScrolling } =
    useVirtualization({
      itemHeight,
      itemCount: products.length,
      overscan: 2,
      containerHeight,
    });

  // Set up intersection observer for infinite scroll
  const { ref: loadMoreRef, isIntersecting: shouldLoadMore } =
    useIntersectionObserver({
      rootMargin: "300px 0px",
      threshold: 0.1,
      triggerOnce: false,
    });

  // Load more products when reaching the threshold
  useEffect(() => {
    if (shouldLoadMore && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [shouldLoadMore, hasMore, isLoading, onLoadMore]);

  // Responsive columns based on screen width
  const getGridTemplateColumns = () => {
    if (typeof window === "undefined") return `repeat(${columns}, 1fr)`;

    const width = window.innerWidth;
    if (width < 640) return "repeat(2, 1fr)";
    if (width < 768) return "repeat(2, 1fr)";
    if (width < 1024) return "repeat(3, 1fr)";
    return `repeat(${columns}, 1fr)`;
  };

  // Handle empty state
  if (products.length === 0 && !isLoading) {
    return (
      <div className="w-full text-center py-16">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}

      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: containerHeight,
          position: "relative",
          contain: "strict",
        }}
      >
        {/* Total height container */}
        <div
          style={{
            height: totalHeight,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Grid container with absolute positioning for virtual items */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: getGridTemplateColumns(),
              gap: `${gap}px`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              contain: "layout",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const product = products[virtualItem.index];
              return (
                <div
                  key={product.id}
                  style={{
                    height: `${itemHeight}px`,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                    position: "absolute",
                    top: 0,
                    left: `calc((100% / ${columns}) * ${virtualItem.index % columns})`,
                    right: 0,
                    contain: "strict",
                    gridColumn: `${(virtualItem.index % columns) + 1}`,
                    padding: `0 ${gap / 2}px`,
                  }}
                >
                  <ConsistentProductCard
                    product={product}
                    priority={virtualItem.index < 4}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-8">
            <ProductGridSkeleton
              count={columns * 2}
              columns={columns}
              gap={`${gap}px`}
            />
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && !isLoading && (
          <div
            ref={loadMoreRef}
            className="w-full h-20"
            style={{ marginTop: `-${itemHeight}px` }}
          />
        )}
      </div>
    </div>
  );
};

export default VirtualizedProductGrid;
