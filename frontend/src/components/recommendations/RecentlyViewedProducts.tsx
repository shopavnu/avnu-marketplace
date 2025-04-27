import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import ProductCard from '../product/ProductCard';
import ProductCardSkeleton from '../product/ProductCardSkeleton';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useSession } from '../../hooks/useSession';
// Import ProductService as a class
import { ProductService } from '../../services/product.service';

interface RecentlyViewedProductsProps {
  limit?: number;
  title?: string;
  excludeProductId?: string;
}

/**
 * Component to display recently viewed products
 */
const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({
  limit = 4,
  title = 'Recently viewed',
  excludeProductId,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { userPreferences } = useUserPreferences();
  const { trackInteraction } = useSession();

  useEffect(() => {
    const fetchRecentlyViewedProducts = async () => {
      if (!userPreferences?.recentlyViewedProducts?.length) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Filter out the current product if excludeProductId is provided
        const filteredProductIds = excludeProductId
          ? userPreferences.recentlyViewedProducts.filter(id => id !== excludeProductId)
          : userPreferences.recentlyViewedProducts;
        
        // Get the most recent products up to the limit
        const recentProductIds = filteredProductIds.slice(0, limit);
        
        if (recentProductIds.length === 0) {
          setProducts([]);
          return;
        }
        
        // Fetch product details for the IDs
        const fetchedProducts = await ProductService.getProductsByIds(recentProductIds);
        
        // Preserve the original order of recently viewed products
        const orderedProducts = recentProductIds
          .map(id => fetchedProducts.find((product: Product) => product.id === id))
          .filter((product): product is Product => !!product);
        
        setProducts(orderedProducts);
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewedProducts();
  }, [userPreferences?.recentlyViewedProducts, limit, excludeProductId]);

  // Track impression when products are displayed
  useEffect(() => {
    if (products.length > 0) {
      trackInteraction('RECOMMENDATION_IMPRESSION', {
        recommendationType: 'recently_viewed',
        recommendedProducts: products.map(p => p.id),
      });
    }
  }, [products, trackInteraction]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    trackInteraction('RECOMMENDATION_CLICK', {
      targetProductId: product.id,
      recommendationType: 'recently_viewed',
    });
  };

  if (loading) {
    return (
      <div className="recently-viewed-container" data-testid="recently-viewed-loading">
        <h2 className="recently-viewed-title">{title}</h2>
        <div className="recently-viewed-grid">
          {Array(limit).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="recently-viewed-item">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recently-viewed-error" data-testid="recently-viewed-error">
        <p>Unable to load recently viewed products</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="recently-viewed-empty" data-testid="recently-viewed-empty">
        <p>No recently viewed products</p>
      </div>
    );
  }

  return (
    <div className="recently-viewed-container" data-testid="recently-viewed-container">
      <h2 className="recently-viewed-title">{title}</h2>
      <div className="recently-viewed-grid">
        {products.map((product) => (
          <div key={product.id} className="recently-viewed-item">
            <ProductCard 
              product={product} 
              onClick={handleProductClick}
              trackImpression={() => trackInteraction('RECOMMENDATION_IMPRESSION', {
                recommendationType: 'recently_viewed',
                recommendedProductId: product.id,
              })}
              testId={`recently-viewed-${product.id}`}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .recently-viewed-container {
          margin: 2rem 0;
          padding: 1rem 0;
          border-top: 1px solid #f0f0f0;
        }
        
        .recently-viewed-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .recently-viewed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .recently-viewed-item {
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }
        
        .recently-viewed-item:hover {
          transform: translateY(-5px);
        }
        
        .recently-viewed-loading {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-skeleton {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .recently-viewed-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecentlyViewedProducts;
