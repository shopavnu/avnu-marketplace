import React, { useEffect, useState } from "react";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { Product } from "../../types/product";
import axios from "axios";
import ProductViewTracker from "../tracking/ProductViewTracker";

interface PersonalizedRecommendationsProps {
  title?: string;
  limit?: number;
  renderProductCard: (product: Product) => React.ReactNode;
  gridClassName?: string;
  itemClassName?: string;
  showIfEmpty?: boolean;
}

/**
 * Component that displays personalized product recommendations based on user preferences
 */
const PersonalizedRecommendations: React.FC<
  PersonalizedRecommendationsProps
> = ({
  title = "Recommended for You",
  limit = 8,
  renderProductCard,
  gridClassName = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
  itemClassName = "",
  showIfEmpty = false,
}) => {
  const { userPreferences, loading: preferencesLoading } = useUserPreferences();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userPreferences || !userPreferences.hasEnoughData) {
        // If no preferences or not enough data, fetch featured products instead
        try {
          const response = await axios.get<Product[]>("/api/products/featured", {
            params: { limit },
          });
          setProducts(response.data);
        } catch (err) {
          console.error("Failed to fetch featured products:", err);
          setError("Failed to load recommendations");
          setProducts([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        // Get personalized product IDs
        const recommendationIds = await axios.get<string[]>(
          "/api/user-preference-profile/recommendations",
          {
            params: { limit },
          },
        );

        if (recommendationIds.data.length === 0) {
          // Fallback to featured products if no recommendations
          const response = await axios.get<Product[]>("/api/products/featured", {
            params: { limit },
          });
          setProducts(response.data);
        } else {
          // Fetch full product details for recommended products
          const response = await axios.post<Product[]>("/api/products/batch", {
            ids: recommendationIds.data,
          });
          setProducts(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch personalized recommendations:", err);
        setError("Failed to load recommendations");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!preferencesLoading) {
      fetchRecommendations();
    }
  }, [userPreferences, preferencesLoading, limit]);

  // Don't render anything if no products and showIfEmpty is false
  if (products.length === 0 && !showIfEmpty) {
    return null;
  }

  return (
    <div className="personalized-recommendations">
      {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No recommendations available
        </div>
      ) : (
        <div className={gridClassName}>
          {products.map((product) => (
            <div key={product.id} className={itemClassName}>
              <ProductViewTracker product={product}>
                {renderProductCard(product)}
              </ProductViewTracker>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
