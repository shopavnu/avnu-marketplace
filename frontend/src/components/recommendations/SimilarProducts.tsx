import React, { useEffect, useState } from "react";
import { Product } from "../../types/product";
import { RecommendationService } from "../../services/recommendation.service";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";
import { useSession } from "../../hooks/useSession";

interface SimilarProductsProps {
  productId: string;
  similarityType?: "attribute_based" | "view_based" | "hybrid";
  limit?: number;
  title?: string;
}

/**
 * Component to display similar products based on the current product
 */
const SimilarProducts: React.FC<SimilarProductsProps> = ({
  productId,
  similarityType = "hybrid",
  limit = 4,
  title = "You may also like",
}) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { trackInteraction } = useSession();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const products = await RecommendationService.getSimilarProducts(
          productId,
          similarityType,
          limit,
        );

        // Filter out suppressed products
        const filteredProducts = products.filter(
          (product) => !product.isSuppressed,
        );
        setSimilarProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching similar products:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [productId, similarityType, limit]);

  // Track impression when products are displayed
  useEffect(() => {
    if (similarProducts.length > 0) {
      trackInteraction("RECOMMENDATION_IMPRESSION", {
        productId,
        recommendationType: "similar_products",
        similarityType,
        recommendedProducts: similarProducts.map((p) => p.id),
      });
    }
  }, [similarProducts, productId, similarityType, trackInteraction]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    trackInteraction("RECOMMENDATION_CLICK", {
      sourceProductId: productId,
      targetProductId: product.id,
      recommendationType: "similar_products",
      similarityType,
    });
  };

  if (loading) {
    return (
      <div
        className="similar-products-container"
        data-testid="similar-products-loading"
      >
        <h2 className="similar-products-title">{title}</h2>
        <div className="similar-products-grid">
          {Array(limit)
            .fill(0)
            .map((_, index) => (
              <div key={`skeleton-${index}`} className="similar-product-item">
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
        className="similar-products-error"
        data-testid="similar-products-error"
      >
        <p>Unable to load similar products</p>
      </div>
    );
  }

  if (similarProducts.length === 0) {
    return (
      <div
        className="similar-products-empty"
        data-testid="similar-products-empty"
      >
        <p>No similar products found</p>
      </div>
    );
  }

  return (
    <div
      className="similar-products-container"
      data-testid="similar-products-container"
    >
      <h2 className="similar-products-title">{title}</h2>
      <div className="similar-products-grid">
        {similarProducts.map((product) => (
          <div key={product.id} className="similar-product-item">
            <ProductCard
              product={product}
              onClick={handleProductClick}
              trackImpression={() =>
                trackInteraction("RECOMMENDATION_IMPRESSION", {
                  productId,
                  recommendationType: "similar_products",
                  similarityType,
                  recommendedProductId: product.id,
                })
              }
              testId={`similar-product-${product.id}`}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .similar-products-container {
          margin: 2rem 0;
          padding: 1rem 0;
        }

        .similar-products-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .similar-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .similar-product-item {
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        .similar-product-item:hover {
          transform: translateY(-5px);
        }

        .similar-products-loading {
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
      `}</style>
    </div>
  );
};

export default SimilarProducts;
