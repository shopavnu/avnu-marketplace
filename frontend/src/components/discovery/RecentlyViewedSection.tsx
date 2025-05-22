import React, { useEffect, useState } from 'react';
import { Product } from '@/data/products';
import { useRecentlyViewedProducts } from '@/utils/discovery-integration';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import FixedHeightProductCard from '@/components/products/FixedHeightProductCard';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface RecentlyViewedSectionProps {
  title?: string;
  maxItems?: number;
  columns?: number;
  className?: string;
  showWhenEmpty?: boolean;
}

/**
 * A component to display recently viewed products
 * Can be easily added to product detail pages, cart pages, or checkout flows
 */
const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  title = 'Recently Viewed',
  maxItems = 4,
  columns = 4,
  className = '',
  showWhenEmpty = false,
}) => {
  const { recentProducts, isLoading } = useRecentlyViewedProducts(maxItems);
  const [shouldShow, setShouldShow] = useState(false);

  // Use intersection observer to lazy load the component
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Determine if we should show the section
  useEffect(() => {
    if (!isLoading) {
      setShouldShow(showWhenEmpty || recentProducts.length > 0);
    }
  }, [isLoading, recentProducts, showWhenEmpty]);

  if (!shouldShow) {
    return null;
  }

  return (
    <section 
      ref={ref} 
      className={`py-8 ${className}`}
      aria-labelledby="recently-viewed-heading"
    >
      <h2 
        id="recently-viewed-heading" 
        className="text-2xl font-semibold mb-6"
      >
        {title}
      </h2>
      
      {isLoading || !isIntersecting ? (
        <ProductGridSkeleton count={maxItems} columns={columns} gap="1.5rem" />
      ) : recentProducts.length > 0 ? (
        <div 
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6`}
          role="list"
          aria-label="Recently viewed products"
        >
          {recentProducts.map((product) => (
            <FixedHeightProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No recently viewed products</p>
      )}
    </section>
  );
};

export default RecentlyViewedSection;
