import React, { useState, useEffect } from "react";

// Define dimensions based on device types, similar to ResponsiveProductCard
const SKELETON_DIMENSIONS = {
  desktop: { height: "360px", imageHeight: "200px" },
  tablet: { height: "320px", imageHeight: "180px" },
  mobile: { height: "280px", imageHeight: "160px" },
};

interface ProductCardSkeletonProps {}

/**
 * Skeleton loader for product cards that maintains consistent dimensions
 * by being responsive to screen size, preventing layout shifts.
 */
const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = () => {
  const [dimensions, setDimensions] = useState(SKELETON_DIMENSIONS.desktop);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDimensions(SKELETON_DIMENSIONS.mobile);
      } else if (width < 1024) {
        setDimensions(SKELETON_DIMENSIONS.tablet);
      } else {
        setDimensions(SKELETON_DIMENSIONS.desktop);
      }
    };

    handleResize(); // Set initial dimensions
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="product-card-skeleton"
      style={{
        width: "100%",
        height: dimensions.height,
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="product-card-skeleton"
    >
      {/* Image Skeleton */}
      <div
        className="skeleton-image"
        style={{
          height: dimensions.imageHeight,
          backgroundColor: "#f0f0f0",
          backgroundImage:
            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "loading 1.5s infinite",
          width: "100%",
        }}
      />

      {/* Content Skeleton */}
      <div style={{ padding: "12px", flex: "1" }}>
        {/* Brand Skeleton */}
        <div
          className="skeleton-brand"
          style={{
            height: "12px",
            width: "40%",
            backgroundColor: "#f0f0f0",
            marginBottom: "8px",
            borderRadius: "4px",
            backgroundImage:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
          }}
        />

        {/* Title Skeleton */}
        <div
          className="skeleton-title"
          style={{
            height: "20px",
            width: "90%",
            backgroundColor: "#f0f0f0",
            marginBottom: "8px",
            borderRadius: "4px",
            backgroundImage:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
          }}
        />

        {/* Description Skeleton */}
        <div
          className="skeleton-description"
          style={{
            height: "16px",
            width: "80%",
            backgroundColor: "#f0f0f0",
            marginBottom: "4px",
            borderRadius: "4px",
            backgroundImage:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
          }}
        />
        <div
          className="skeleton-description"
          style={{
            height: "16px",
            width: "60%",
            backgroundColor: "#f0f0f0",
            marginBottom: "16px",
            borderRadius: "4px",
            backgroundImage:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
          }}
        />

        {/* Price Skeleton */}
        <div
          className="skeleton-price"
          style={{
            height: "20px",
            width: "30%",
            backgroundColor: "#f0f0f0",
            marginTop: "auto",
            borderRadius: "4px",
            backgroundImage:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
          }}
        />
      </div>

      {/* Animation */}
      <style jsx>{`
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

export default ProductCardSkeleton;
