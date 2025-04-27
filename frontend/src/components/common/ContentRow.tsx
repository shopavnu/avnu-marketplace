import React, { useRef, useState } from 'react';
import { Product } from '@/data/products';
import { ConsistentProductCard } from '@/components/products';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

interface ContentRowProps {
  /**
   * Title of the row
   */
  title: string;
  
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  
  /**
   * Products to display in the row
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
   * Whether the row should be scrollable horizontally
   */
  scrollable?: boolean;
  
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
 * Netflix-inspired horizontal content row component
 * Maintains consistent 360px card heights while providing
 * horizontal scrolling and progressive loading
 */
const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  products,
  showSeeAll = false,
  seeAllUrl = '#',
  scrollable = true,
  className = '',
  onProductClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use intersection observer to detect when the row is visible
  const { ref: rowRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px 0px',
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Load content when row becomes visible
  React.useEffect(() => {
    if (isIntersecting && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isIntersecting, isLoaded]);
  
  return (
    <div 
      ref={rowRef}
      className={`mb-12 ${className}`}
    >
      {/* Row header with Netflix-inspired design */}
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
      
      {/* Scrollable product row with Netflix-inspired design */}
      {isLoaded ? (
        <div className="relative">
          {/* Scrollable container */}
          <div 
            className={`${scrollable ? 'overflow-x-auto' : ''} pb-4 -mx-4 px-4`}
            style={{ 
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE/Edge
            }}
          >
            {/* Hide scrollbar for Chrome/Safari/Opera */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {/* Product row */}
            <div 
              className="flex space-x-6"
              style={{
                contain: 'layout',
                position: 'relative'
              }}
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`${scrollable ? 'flex-shrink-0' : ''}`}
                  style={{ 
                    width: '280px',
                    height: '360px',
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
          </div>
          
          {/* Gradient fade on the right side for scrollable rows */}
          {scrollable && (
            <div 
              className="absolute top-0 right-0 bottom-4 w-16 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
              }}
            />
          )}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex space-x-6">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i}
                className="flex-shrink-0"
                style={{ 
                  width: '280px',
                  height: '360px'
                }}
              >
                <div className="h-full w-full bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentRow;
