import React, { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSession } from "../../hooks/useSession";
import { Product } from "../../types/product";

interface ProductViewTrackerProps {
  product: Product;
  children: React.ReactNode;
  minViewTimeMs?: number;
}

/**
 * Component that tracks product view time and reports it to the backend
 * for personalization purposes
 */
const ProductViewTracker: React.FC<ProductViewTrackerProps> = ({
  product,
  children,
  minViewTimeMs = 1000, // Minimum time to consider a view (1 second)
}) => {
  const { isAuthenticated } = useAuth();
  const { sessionId, trackInteraction } = useSession();
  const viewStartTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset view start time when product changes
    viewStartTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    // Track view when component unmounts or product changes
    return () => {
      const viewTimeMs = Date.now() - viewStartTimeRef.current;

      // Only track if viewed for minimum time and not already tracked
      if (viewTimeMs >= minViewTimeMs && !hasTrackedRef.current && sessionId) {
        trackInteraction("product_view", {
          productId: product.id,
          categoryId: product.categoryId,
          brandId: product.brandName,
          price: product.price,
          viewTimeMs,
          timestamp: new Date().toISOString(),
          isAuthenticated,
        });

        hasTrackedRef.current = true;
      }
    };
  }, [
    product.id,
    sessionId,
    minViewTimeMs,
    isAuthenticated,
    trackInteraction,
    product,
  ]);

  // Function to track when user leaves the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        !hasTrackedRef.current &&
        sessionId
      ) {
        const viewTimeMs = Date.now() - viewStartTimeRef.current;

        if (viewTimeMs >= minViewTimeMs) {
          trackInteraction("product_view", {
            productId: product.id,
            categoryId: product.categoryId,
            brandId: product.brandName,
            price: product.price,
            viewTimeMs,
            timestamp: new Date().toISOString(),
            isAuthenticated,
          });

          hasTrackedRef.current = true;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [product, sessionId, minViewTimeMs, isAuthenticated, trackInteraction]);

  return <>{children}</>;
};

export default ProductViewTracker;
