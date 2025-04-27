import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/data/products';
import OptimizedProductCard from '@/components/products/OptimizedProductCard';
import personalizationService from '@/services/personalization';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import useVirtualization from '@/hooks/useVirtualization';

interface OptimizedPersonalizedGridProps {
  title?: string;
  maxItems?: number;
  columns?: number;
  gap?: number;
}

/**
 * An optimized version of the personalized grid that uses virtualization and lazy loading
 * for improved performance with long vertical scrolling
 */
const OptimizedPersonalizedGrid: React.FC<OptimizedPersonalizedGridProps> = ({ 
  title = 'For You',
  maxItems = 24,
  columns = 4,
  gap = 24
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [containerHeight, setContainerHeight] = useState<number>(window?.innerHeight || 800);
  
  // Update container height on resize
  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Set up virtualization
  const {
    virtualItems,
    totalHeight,
    containerRef,
    isScrolling
  } = useVirtualization({
    itemHeight: 360,
    itemCount: products.length,
    overscan: 2,
    containerHeight
  });
  
  // Set up intersection observer for infinite scroll
  const { ref: loadMoreRef, isIntersecting: shouldLoadMore } = useIntersectionObserver({
    rootMargin: '300px 0px',
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Load initial products
  useEffect(() => {
    const loadInitialProducts = async () => {
      setIsLoading(true);
      try {
        // Get personalized products from the service
        const personalizedProducts = personalizationService.loadMoreRecommendations([], 8, 1);
        setProducts(personalizedProducts);
        setHasMore(personalizedProducts.length === 8);
      } catch (error) {
        console.error('Error loading personalized products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialProducts();
  }, []);
  
  // Load more products when reaching the threshold
  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      // Get more personalized products from the service
      const moreProducts = personalizationService.loadMoreRecommendations(
        products,
        products.length,
        8
      );
      
      if (moreProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...moreProducts]);
        setPage(nextPage);
        setHasMore(moreProducts.length === 8 && products.length + moreProducts.length < maxItems);
      }
    } catch (error) {
      console.error('Error loading more personalized products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, products, maxItems]);
  
  // Load more products when intersection observer triggers
  useEffect(() => {
    if (shouldLoadMore && hasMore && !isLoading) {
      loadMoreProducts();
    }
  }, [shouldLoadMore, hasMore, isLoading, loadMoreProducts]);
  
  // Responsive columns based on screen width
  const getGridTemplateColumns = () => {
    if (typeof window === 'undefined') return `repeat(${columns}, 1fr)`;
    
    const width = window.innerWidth;
    if (width < 640) return 'repeat(2, 1fr)';
    if (width < 768) return 'repeat(2, 1fr)';
    if (width < 1024) return 'repeat(3, 1fr)';
    return `repeat(${columns}, 1fr)`;
  };
  
  // Empty state
  if (products.length === 0 && !isLoading) {
    return (
      <div className="w-full py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-500 mb-4">We're still learning your preferences.</p>
        <p className="text-gray-500">Browse more products to get personalized recommendations.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: Math.min(totalHeight + 100, containerHeight),
          position: 'relative',
          contain: 'strict'
        }}
        data-testid="for-you-grid"
      >
        {/* Total height container */}
        <div
          style={{
            height: totalHeight,
            width: '100%',
            position: 'relative'
          }}
        >
          {/* Grid container with absolute positioning for virtual items */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: getGridTemplateColumns(),
              gap: `${gap}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              contain: 'layout'
            }}
          >
            {virtualItems.map(virtualItem => {
              const product = products[virtualItem.index];
              return (
                <div
                  key={product.id}
                  style={{
                    height: `${virtualItem.size}px`,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                    position: 'absolute',
                    top: 0,
                    left: `calc((100% / ${columns}) * ${virtualItem.index % columns})`,
                    right: 0,
                    contain: 'strict',
                    gridColumn: `${(virtualItem.index % columns) + 1}`,
                    padding: `0 ${gap / 2}px`
                  }}
                  data-testid="for-you-item"
                >
                  <OptimizedProductCard 
                    product={product}
                    priority={virtualItem.index < 4}
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
              );
            })}
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-8">
            <ProductGridSkeleton count={columns * 2} columns={columns} gap={`${gap}px`} />
          </div>
        )}
        
        {/* Load more trigger */}
        {hasMore && !isLoading && (
          <div
            ref={loadMoreRef}
            className="w-full h-20"
            style={{ marginTop: `-${360}px` }}
          />
        )}
      </div>
    </div>
  );
};

export default OptimizedPersonalizedGrid;
