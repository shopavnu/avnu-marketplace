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
    
    // Track views for these products
    forYouProducts.forEach(product => {
      personalizationService.trackProductView(product.id);
    });
  }, [products]);
  
  // Load more products when reaching the threshold
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      // Get more personalized products
      const currentCount = displayProducts.length;
      const moreProducts = personalizationService.generateRecommendations(products, 8, currentCount);
      
      if (moreProducts.length === 0) {
        setHasMore(false);
      } else {
        setDisplayProducts(prev => [...prev, ...moreProducts]);
        setHasMore(moreProducts.length === 8 && displayProducts.length + moreProducts.length < maxProducts);
      }
    } catch (error) {
      console.error('Error loading more personalized products:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, displayProducts, products, maxProducts]);
  
  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && !initialLoad) {
          loadMoreProducts();
        }
      },
      { rootMargin: '200px 0px' }
    );
    
    observer.observe(loadingRef.current);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreProducts, loading, hasMore, initialLoad]);
  
  // Responsive columns based on screen width
  const getGridTemplateColumns = () => {
    if (typeof window === 'undefined') return 'repeat(4, 1fr)';
    
    const width = window.innerWidth;
    if (width < 640) return 'repeat(2, 1fr)';
    if (width < 768) return 'repeat(2, 1fr)';
    if (width < 1024) return 'repeat(3, 1fr)';
    return 'repeat(4, 1fr)';
  };
  
  // Empty state
  if (products.length === 0 && !loading) {
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
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      
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
      
      {/* Loading indicator and infinite scroll trigger */}
      <div 
        ref={loadingRef} 
        className="flex justify-center items-center py-8"
        style={{ height: hasMore ? '100px' : '0px', transition: 'height 0.3s ease' }}
      >
        {loading && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin mb-2"></div>
            <p className="text-sm text-gray-500">Loading more recommendations...</p>
          </div>
        )}
        {!hasMore && displayProducts.length > 0 && (
          <p className="text-sm text-gray-500 py-4">You've seen all recommendations for now</p>
        )}
      </div>
      
      {/* Empty state */}
      {displayProducts.length === 0 && !initialLoad && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-gray-800 mb-2">We're still learning your preferences</p>
          <p className="text-gray-500 mb-6">Browse more products to get personalized recommendations</p>
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
  );
};

export default PersonalizedGrid;
