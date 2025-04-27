import React, { useState } from 'react';
import { Product } from '@/data/products';
import { ConsistentProductCard } from '@/components/products';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

interface VerticalSectionProps {
  /**
   * Title of the section
   */
  title: string;
  
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  
  /**
   * Products to display in the section
   */
  products: Product[];
  
  /**
   * Whether to show the "See all" link
   */
  showSeeAll?: boolean;
  
  /**
   * URL for the "See all" link
   */
  seeAllUrl?: string;
  
  /**
   * Number of columns in the grid
   */
  columns?: number;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional function to call when a product is clicked
   */
  onProductClick?: (product: Product) => void;
}

/**
 * Vertically optimized content section component
 * Maintains consistent 360px card heights while providing
 * progressive loading and optimized rendering
 */
const VerticalSection: React.FC<VerticalSectionProps> = ({
  title,
  subtitle,
  products,
  showSeeAll = false,
  seeAllUrl = '#',
  columns = 4,
  className = '',
  onProductClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use intersection observer to detect when the section is visible
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px 0px',
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Load content when section becomes visible
  React.useEffect(() => {
    if (isIntersecting && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isIntersecting, isLoaded]);
  
  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (typeof window === 'undefined') return `repeat(${columns}, 1fr)`;
    
    const width = window.innerWidth;
    if (width < 640) return 'repeat(2, 1fr)';
    if (width < 768) return 'repeat(2, 1fr)';
    if (width < 1024) return 'repeat(3, 1fr)';
    return `repeat(${columns}, 1fr)`;
  };
  
  return (
    <div 
      ref={ref}
      className={`mb-12 ${className}`}
    >
      {/* Section header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {showSeeAll && (
          <a 
            href={seeAllUrl}
            className="text-sage hover:text-sage/80 font-medium flex items-center transition-colors"
          >
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        )}
      </div>
      
      {/* Vertical product grid */}
      {isLoaded ? (
        <div 
          className="grid gap-6"
          style={{ 
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            gridTemplateRows: 'repeat(auto-fill, 360px)',
            contain: 'layout',
            position: 'relative',
            zIndex: 1
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              style={{ 
                height: '360px',
                width: '100%',
                contain: 'strict',
                position: 'relative'
              }}
              onClick={() => onProductClick && onProductClick(product)}
            >
              <ConsistentProductCard 
                product={product}
                badges={
                  <>
                    {product.isNew && (
                      <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                    {product.vendor?.isLocal && (
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium rounded-full">
                        Local
                      </span>
                    )}
                  </>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <ProductGridSkeleton count={8} columns={columns} gap="1.5rem" />
      )}
    </div>
  );
};

export default VerticalSection;
