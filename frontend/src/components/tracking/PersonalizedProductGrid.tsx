import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../hooks/useSession';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { Product } from '../../types/product';
import ScrollTracker from './ScrollTracker';
import ProductViewTracker from './ProductViewTracker';

interface PersonalizedProductGridProps {
  products: Product[];
  pageType: string;
  gridClassName?: string;
  itemClassName?: string;
  renderProductCard: (product: Product) => React.ReactNode;
}

/**
 * A grid component that tracks user interactions with products for personalization
 * Wraps products with tracking components and updates user preferences
 */
const PersonalizedProductGrid: React.FC<PersonalizedProductGridProps> = ({
  products,
  pageType,
  gridClassName = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
  itemClassName = "",
  renderProductCard
}) => {
  const { sessionId } = useSession();
  const { updateFromCurrentSession } = useUserPreferences();
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const productRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Update user preferences when component unmounts
  useEffect(() => {
    return () => {
      // Only update if we have a session and products were viewed
      if (sessionId && visibleProducts.length > 0) {
        updateFromCurrentSession();
      }
    };
  }, [sessionId, visibleProducts, updateFromCurrentSession]);
  
  // Set up intersection observer to track visible products
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const productId = entry.target.getAttribute('data-product-id');
          
          if (productId) {
            if (entry.isIntersecting) {
              // Add to visible products if not already there
              setVisibleProducts(prev => {
                if (!prev.some(p => p.id === productId)) {
                  const product = products.find(p => p.id === productId);
                  return product ? [...prev, product] : prev;
                }
                return prev;
              });
            }
          }
        });
      },
      { threshold: 0.5 } // Consider visible when 50% in view
    );
    
    // Observe all product elements
    productRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [products]);
  
  // Get visible product IDs for scroll tracking
  const visibleProductIds = visibleProducts.map(product => product.id);
  
  return (
    <ScrollTracker pageType={pageType} visibleProductIds={visibleProductIds}>
      <div className={gridClassName}>
        {products.map(product => (
          <div
            key={product.id}
            className={itemClassName}
            ref={ref => {
              if (ref) {
                productRefs.current.set(product.id, ref);
                ref.setAttribute('data-product-id', product.id);
                
                // Observe if we have an observer
                if (observerRef.current) {
                  observerRef.current.observe(ref);
                }
              }
            }}
          >
            <ProductViewTracker product={product}>
              {renderProductCard(product)}
            </ProductViewTracker>
          </div>
        ))}
      </div>
    </ScrollTracker>
  );
};

export default PersonalizedProductGrid;
