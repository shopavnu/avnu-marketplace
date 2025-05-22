import React, { useEffect } from 'react';
import { Product } from '@/data/products';
import { trackProductView, usePersonalizedRecommendations } from '@/utils/discovery-integration';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import FixedHeightProductCard from '@/components/products/FixedHeightProductCard';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface ProductDetailRecommendationsProps {
  currentProduct: Product;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  columns?: number;
  className?: string;
}

/**
 * A component for product detail pages that tracks product views
 * and displays personalized recommendations
 */
const ProductDetailRecommendations: React.FC<ProductDetailRecommendationsProps> = ({
  currentProduct,
  title = 'You May Also Like',
  subtitle = 'Based on your browsing history',
  maxItems = 4,
  columns = 4,
  className = '',
}) => {
  // Track the current product view
  useEffect(() => {
    // Only track if we have a valid product ID
    if (currentProduct?.id) {
      trackProductView(currentProduct.id);
    }
  }, [currentProduct?.id]);

  // Get personalized recommendations
  const { recommendations, isLoading } = usePersonalizedRecommendations(maxItems + 1);

  // Filter out the current product from recommendations
  const filteredRecommendations = recommendations.filter(
    product => product.id !== currentProduct?.id
  ).slice(0, maxItems);

  // Use intersection observer to lazy load the section
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  // Don't show if we don't have any recommendations
  if (!isLoading && filteredRecommendations.length === 0) {
    return null;
  }

  return (
    <section 
      ref={ref} 
      className={`py-12 ${className}`}
      aria-labelledby="product-recommendations-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 
            id="product-recommendations-heading" 
            className="text-2xl font-semibold"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </div>
        
        {(!isIntersecting || isLoading) ? (
          <ProductGridSkeleton count={maxItems} columns={columns} gap="1.5rem" />
        ) : (
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}
            aria-label="Recommended products"
          >
            {filteredRecommendations.map((product) => (
              <FixedHeightProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailRecommendations;
