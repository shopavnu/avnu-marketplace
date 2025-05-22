import React, { useEffect, useRef, useState } from "react";
import { useSession } from "../../hooks/useSession";
import { Product } from "../../types/product";

interface ProductDetailTrackerProps {
  product: Product;
  children: React.ReactNode;
}

/**
 * Component that tracks detailed product view interactions on product detail pages
 * Captures view time, scroll depth, and engagement with product details
 */
const ProductDetailTracker: React.FC<ProductDetailTrackerProps> = ({
  product,
  children,
}) => {
  const { trackInteraction } = useSession();
  const startTimeRef = useRef<number>(Date.now());
  const [maxScrollDepth, setMaxScrollDepth] = useState<number>(0);
  const [hasTrackedView, setHasTrackedView] = useState<boolean>(false);
  const [hasTrackedEngagement, setHasTrackedEngagement] =
    useState<boolean>(false);
  const engagementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track scroll depth on product detail page
  useEffect(() => {
    const trackScrollDepth = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
      );
      const clientHeight =
        window.innerHeight || document.documentElement.clientHeight;

      // Calculate scroll percentage (0-100)
      const scrollPercentage = Math.min(
        100,
        Math.round((scrollTop / (scrollHeight - clientHeight)) * 100),
      );

      // Update max scroll depth
      if (scrollPercentage > maxScrollDepth) {
        setMaxScrollDepth(scrollPercentage);
      }
    };

    window.addEventListener("scroll", trackScrollDepth);

    return () => {
      window.removeEventListener("scroll", trackScrollDepth);
    };
  }, [maxScrollDepth]);

  // Track engagement based on time spent on page
  useEffect(() => {
    // Consider user engaged after 10 seconds
    engagementTimeoutRef.current = setTimeout(() => {
      if (!hasTrackedEngagement) {
        trackInteraction("product_view", {
          productId: product.id,
          categoryId: product.categoryId || product.categories?.[0] || "",
          brandId: product.brandId || product.brandName,
          price: product.price,
          viewTimeMs: Date.now() - startTimeRef.current,
          scrollDepth: maxScrollDepth,
          engagement: true,
          timestamp: new Date().toISOString(),
        });

        setHasTrackedEngagement(true);
      }
    }, 10000);

    return () => {
      if (engagementTimeoutRef.current) {
        clearTimeout(engagementTimeoutRef.current);
      }
    };
  }, [product, maxScrollDepth, hasTrackedEngagement, trackInteraction]);

  // Track view when component unmounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Store the current value of startTimeRef to use in cleanup
    const startTime = startTimeRef.current;

    return () => {
      if (!hasTrackedView) {
        trackInteraction("product_view", {
          productId: product.id,
          categoryId: product.categoryId || product.categories?.[0] || "",
          brandId: product.brandId || product.brandName,
          price: product.price,
          viewTimeMs: Date.now() - startTime, // Use captured value
          scrollDepth: maxScrollDepth,
          timestamp: new Date().toISOString(),
        });

        setHasTrackedView(true);
      }
    };
  }, [product, maxScrollDepth, hasTrackedView, trackInteraction]);

  // Track when user leaves the page
  useEffect(() => {
    // Store the current value of startTimeRef to use in cleanup
    const startTime = startTimeRef.current;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !hasTrackedView) {
        trackInteraction("product_view", {
          productId: product.id,
          categoryId: product.categoryId || product.categories?.[0] || "",
          brandId: product.brandId || product.brandName,
          price: product.price,
          viewTimeMs: Date.now() - startTime, // Use the captured startTime
          scrollDepth: maxScrollDepth,
          timestamp: new Date().toISOString(),
        });

        setHasTrackedView(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [product, maxScrollDepth, hasTrackedView, trackInteraction]);

  return <>{children}</>;
};

export default ProductDetailTracker;
