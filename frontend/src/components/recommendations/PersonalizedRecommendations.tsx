import React, { useEffect, useState } from "react";
import { Product } from "../../types/product";
import { RecommendationService } from "../../services/recommendation.service";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";
import { useSession } from "../../hooks/useSession";
import { useAuth } from "../../hooks/useAuth";

interface PersonalizedRecommendationsProps {
  limit?: number;
  title?: string;
  fallbackTitle?: string;
  showRefreshButton?: boolean;
  excludePurchased?: boolean;
  freshness?: number;
}

/**
 * Component to display personalized product recommendations
 */
const PersonalizedRecommendations: React.FC<
  PersonalizedRecommendationsProps
> = ({
  limit = 6,
  title = "Recommended for you",
  fallbackTitle = "Trending now",
  showRefreshButton = false,
  excludePurchased = true,
  freshness = 0.7,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isPersonalized, setIsPersonalized] = useState<boolean>(false);
  const { trackInteraction } = useSession();
  const { isAuthenticated } = useAuth();

  const fetchRecommendations = async (refresh: boolean = false) => {
    setLoading(true);
    setError(false); // Reset error state
    let productsToSet: Product[] = [];
    let personalized = false;

    try {
      if (isAuthenticated) {
        // Authenticated user: try personalized first
        let rawFetched = await RecommendationService.getPersonalizedRecommendations(
          limit, refresh, excludePurchased, freshness
        );
        productsToSet = (Array.isArray(rawFetched) ? rawFetched : []).filter(p => !p.isSuppressed);
        if (productsToSet.length > 0) {
          personalized = true;
        }
      } else {
        // Not authenticated: try "general" personalized recommendations (e.g., based on site-wide popularity if hasEnoughData)
        // This assumes getPersonalizedRecommendations can return general recs for non-auth users
        let rawFetched = await RecommendationService.getPersonalizedRecommendations(
          limit, refresh, excludePurchased, freshness
        );
        productsToSet = (Array.isArray(rawFetched) ? rawFetched : []).filter(p => !p.isSuppressed);
        if (productsToSet.length > 0) {
          personalized = true;
        }
      }

      // Fallback to trending if no products found yet (either auth or non-auth path)
      if (productsToSet.length === 0) {
        personalized = false; // Explicitly set to false as we are now fetching trending
        let rawTrending = await RecommendationService.getTrendingProducts(limit, excludePurchased);
        productsToSet = (Array.isArray(rawTrending) ? rawTrending : []).filter(p => !p.isSuppressed);
      }

      // Fill with more trending if still under limit and trending was the source
      if (productsToSet.length < limit) {
        const additionalCount = limit - productsToSet.length;
        // Only fetch more trending if we are already in a trending context or personalized failed to fill
        // This prevents adding trending products if personalized partially filled the list but was less than limit.
        // If personalized is true here, it means the initial personalized fetch (auth or non-auth) got some results but less than limit.
        // The original logic would then top up with trending. We need to decide if that's desired.
        // For now, let's assume if personalized got *any* results, we stick with those, even if < limit.
        // If personalized is false, it means we fell back to trending, so topping up trending is fine.
        if (!personalized || productsToSet.length === 0) { // If personalized is false, or if it was true but yielded zero (should not happen if personalized is true due to above logic)
          const rawAdditionalTrending = await RecommendationService.getTrendingProducts(additionalCount + 5); // Fetch extra
          const filteredAdditional = (Array.isArray(rawAdditionalTrending) ? rawAdditionalTrending : [])
            .filter(p => !p.isSuppressed)
            .filter(p => !productsToSet.some(existing => existing.id === p.id));
          productsToSet = [...productsToSet, ...filteredAdditional.slice(0, additionalCount)];
        }
      }
      
      setIsPersonalized(personalized);
      setProducts(productsToSet);

    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(true);
      setProducts([]); // Clear products on error
      setIsPersonalized(false); // Reset on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, isAuthenticated, excludePurchased, freshness]);

  // Track impression when products are displayed
  useEffect(() => {
    if (products.length > 0) {
      trackInteraction("RECOMMENDATION_IMPRESSION", {
        recommendationType: isPersonalized ? "personalized" : "trending",
        recommendedProducts: products.map((p) => p.id),
      });
    }
  }, [products, isPersonalized, trackInteraction]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    trackInteraction("RECOMMENDATION_CLICK", {
      targetProductId: product.id,
      recommendationType: isPersonalized ? "personalized" : "trending",
    });
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  if (loading) {
    return (
      <div
        className="recommendations-container"
        data-testid="personalized-recommendations-loading"
      >
        <div className="recommendations-header">
          <h2 className="recommendations-title">
            {isPersonalized ? title : fallbackTitle}
          </h2>
          {showRefreshButton && (
            <button
              className="refresh-button"
              onClick={handleRefresh}
              data-testid="refresh-recommendations"
              disabled
            >
              Refresh
            </button>
          )}
        </div>
        <div className="recommendations-grid">
          {Array(limit)
            .fill(0)
            .map((_, index) => (
              <div key={`skeleton-${index}`} className="recommendation-item">
                <ProductCardSkeleton />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="recommendations-error"
        data-testid="personalized-recommendations-error"
      >
        <p>Unable to load recommendations</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="recommendations-empty"
        data-testid="personalized-recommendations-empty"
      >
        <p>No recommendations available</p>
      </div>
    );
  }

  return (
    <div
      className="recommendations-container"
      data-testid="personalized-recommendations-container"
    >
      <div className="recommendations-header">
        <h2 className="recommendations-title">
          {isPersonalized ? title : fallbackTitle}
        </h2>
        {showRefreshButton && (
          <button
            className="refresh-button"
            onClick={handleRefresh}
            data-testid="refresh-recommendations"
          >
            Refresh
          </button>
        )}
      </div>
      <div className="recommendations-grid">
        {products.map((product) => (
          <div key={product.id} className="personalized-recommendation-item">
            <ProductCard
              product={product}
              onClick={handleProductClick}
              trackImpression={() =>
                trackInteraction("RECOMMENDATION_IMPRESSION", {
                  recommendationType: isPersonalized
                    ? "personalized"
                    : "trending",
                  recommendedProductId: product.id,
                })
              }
              testId={`${isPersonalized ? "personalized" : "trending"}-recommendation-${product.id}`}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .recommendations-container {
          margin: 2rem 0;
          padding: 1rem 0;
        }

        .recommendations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .recommendations-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .refresh-button {
          background-color: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .refresh-button:hover {
          background-color: #e0e0e0;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .recommendation-item {
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        .recommendation-item:hover {
          transform: translateY(-5px);
        }

        .recommendations-loading {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-skeleton {
          width: 100%;
          height: 200px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
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
          .recommendations-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalizedRecommendations;
