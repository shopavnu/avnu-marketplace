import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/data/products';
import { ConsistentProductCard } from '@/components/products';
import personalizationService from '@/services/personalization';
import { SectionType } from '@/data/sections';

interface PersonalizedGridProps {
  title?: string;
  description?: string;
  products: Product[];
  maxProducts?: number;
  className?: string;
}

// Enhanced PersonalizedGrid with personalization and infinite scroll
const PersonalizedGrid: React.FC<PersonalizedGridProps> = ({
  title = 'For You',
  description = 'Products we think you\'ll love based on your preferences',
  products,
  maxProducts = 24,
  className = '',
}) => {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  
  // Initialize personalization service
  useEffect(() => {
    personalizationService.initialize();
    
    // Generate initial recommendations
    if (products.length > 0) {
      const recommendations = personalizationService.generateRecommendations(products, 12, 0);
      setDisplayProducts(recommendations);
      setInitialLoad(false);
      
      // Infer preferences from current behavior
      personalizationService.inferPreferences(products);
    }
  }, [products]);
  
  // Track product views when component mounts
  useEffect(() => {
    // Only track views for products that are specifically in the FOR_YOU section
    const forYouProducts = products.filter(p => 
      p.sectionTypes?.includes(SectionType.FOR_YOU)
    );
    
    // Track a sample of products to help with recommendations
    if (forYouProducts.length > 0) {
      const sampleSize = Math.min(5, forYouProducts.length);
      const randomSample = [...forYouProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, sampleSize);
      
      randomSample.forEach(product => {
        personalizationService.trackProductView(product.id);
      });
    }
  }, [products]);

  // Setup intersection observer for infinite scroll
  const loadMoreProducts = useCallback(() => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate network delay for smoother UX
    setTimeout(() => {
      const currentCount = displayProducts.length;
      const moreProducts = personalizationService.loadMoreRecommendations(
        products,
        currentCount,
        8 // Load 8 more products at a time
      );
      
      if (moreProducts.length === 0) {
        setHasMore(false);
      } else {
        setDisplayProducts(prev => [...prev, ...moreProducts]);
      }
      
      setLoading(false);
    }, 800);
  }, [loading, hasMore, displayProducts, products]);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading || initialLoad) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreProducts, loading, hasMore, initialLoad]);
  
  // Handle click on a product to track it
  const handleProductClick = (productId: string) => {
    personalizationService.trackProductView(productId);
  };
  
  return (
    <section className={`my-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h2 className="text-2xl font-medium text-charcoal mb-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-neutral-gray">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Product Grid with Personalization */}
        <div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          style={{ 
            display: 'grid',
            gridTemplateRows: 'repeat(auto-fill, 360px)',
            contain: 'layout',
            position: 'relative',
            zIndex: 1
          }}
          data-testid="for-you-grid"
        >
          {displayProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`}
              style={{ 
                height: '360px',
                width: '100%',
                contain: 'strict',
                position: 'relative'
              }}
              data-testid="for-you-item"
              onClick={() => handleProductClick(product.id)}
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
                    {personalizationService.isProductFavorited(product.id) && (
                      <span className="px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                        Favorite
                      </span>
                    )}
                  </>
                }
              />
            </div>
          ))}
        </div>
        
        {/* Loading indicator and infinite scroll trigger */}
        {!initialLoad && (
          <div 
            ref={loadingRef} 
            className="flex justify-center items-center py-8"
            style={{ height: hasMore ? '100px' : '0px', transition: 'height 0.3s ease' }}
          >
            {loading && (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin mb-2"></div>
                <p className="text-sm text-neutral-gray">Loading more recommendations...</p>
              </div>
            )}
            {!hasMore && displayProducts.length > 0 && (
              <p className="text-sm text-neutral-gray py-4">You've seen all recommendations for now</p>
            )}
          </div>
        )}
        
        {/* Empty state */}
        {displayProducts.length === 0 && !initialLoad && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-charcoal mb-2">We're still learning your preferences</p>
            <p className="text-neutral-gray mb-6">Browse more products to get personalized recommendations</p>
            <button 
              className="px-6 py-2 bg-sage text-white rounded-md hover:bg-sage/90 transition-colors"
              onClick={() => {
                // Reset and load initial recommendations with some randomness
                const randomizedProducts = [...products].sort(() => 0.5 - Math.random());
                setDisplayProducts(randomizedProducts.slice(0, 12));
              }}
            >
              Explore Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedGrid;
