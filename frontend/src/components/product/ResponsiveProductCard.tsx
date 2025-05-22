import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import { formatCurrency, truncateText } from "../../utils/formatters";

interface ResponsiveProductCardProps {
  product: Product;
  badges?: React.ReactNode;
  isMerchantView?: boolean; // Flag to indicate if the merchant is viewing their own products
}

/**
 * ResponsiveProductCard component that maintains consistent height
 * across different device sizes while optimizing for mobile
 */
const ResponsiveProductCard: React.FC<ResponsiveProductCardProps> = ({
  product,
  badges,
  isMerchantView = false,
}) => {
  // State to track device size
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  // Set up device detection on client-side only
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDeviceType("mobile");
      } else if (window.innerWidth < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    // Initial detection
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get appropriate image based on screen size
  const getResponsiveImage = () => {
    // Use mobile image on small screens, tablet on medium, and desktop on large
    if (deviceType === "mobile" && product.mobileImages?.[0]) {
      return product.mobileImages[0];
    } else if (deviceType === "tablet" && product.tabletImages?.[0]) {
      return product.tabletImages[0];
    }
    // Fall back to first available image if primary image is missing
    return (
      product.images[0] ||
      product.mobileImages?.[0] ||
      product.tabletImages?.[0] ||
      "/images/placeholder-product.svg"
    ); // Fallback placeholder
  };

  // Using imported truncateText function from formatters.ts

  // Get appropriate text length based on screen size
  const getResponsiveDescription = () => {
    const maxLength =
      deviceType === "mobile" ? 60 : deviceType === "tablet" ? 100 : 150;
    return truncateText(product.description, maxLength);
  };

  // Define consistent dimensions based on device type
  // These exact dimensions are critical for maintaining consistent card heights
  const cardDimensions = {
    mobile: {
      height: "280px", // Total card height
      imageHeight: "160px", // Image section height
      titleLines: 2, // Number of lines for title
      titleLineHeight: 1.2, // Line height for title
      descriptionLines: 2, // Number of lines for description
      descriptionLineHeight: 1.4, // Line height for description
      padding: "12px", // Content padding
      fontSize: {
        brand: "0.75rem",
        title: "0.875rem",
        description: "0.75rem",
        price: "0.875rem",
      },
    },
    tablet: {
      height: "320px",
      imageHeight: "180px",
      titleLines: 2,
      titleLineHeight: 1.2,
      descriptionLines: 2, // Reduced from 3 to 2 for consistent height
      descriptionLineHeight: 1.4,
      padding: "12px",
      fontSize: {
        brand: "0.75rem",
        title: "0.9375rem",
        description: "0.8125rem",
        price: "0.9375rem",
      },
    },
    desktop: {
      height: "360px",
      imageHeight: "200px",
      titleLines: 2,
      titleLineHeight: 1.2,
      descriptionLines: 2, // Reduced from 3 to 2 for consistent height
      descriptionLineHeight: 1.4,
      padding: "16px",
      fontSize: {
        brand: "0.8125rem",
        title: "1rem",
        description: "0.875rem",
        price: "1rem",
      },
    },
  };

  // Get current dimensions based on device type
  const currentDimensions = cardDimensions[deviceType];

  // Check if product is suppressed
  const isProductSuppressed = product.isSuppressed || false;

  // Format suppression reasons for display
  const suppressionReasons =
    isProductSuppressed && isMerchantView
      ? (product.suppressedFrom || []).map((location) => {
          // Convert camelCase or snake_case to readable format
          return location
            .replace(/([A-Z])/g, " $1") // Convert camelCase
            .replace(/_/g, " ") // Convert snake_case
            .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
        })
      : [];

  return (
    <div
      className="product-card"
      style={{
        width: "100%",
        height: currentDimensions.height,
        minHeight: currentDimensions.height, // Enforce minimum height
        maxHeight: currentDimensions.height, // Enforce maximum height
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        contain: "strict", // CSS containment for better performance and layout isolation
      }}
      data-testid="product-card"
    >
      {/* Image container */}
      <div
        className="product-image-container"
        style={{
          position: "relative",
          width: "100%",
          height: currentDimensions.imageHeight,
          minHeight: currentDimensions.imageHeight, // Enforce minimum height
          maxHeight: currentDimensions.imageHeight, // Enforce maximum height
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          flexShrink: 0, // Prevent image from shrinking
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link to={`/product/${product.slug || product.id}`}>
          <img
            src={getResponsiveImage()}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              backgroundColor: "#f8f8f8", // Light gray background for images with transparency
            }}
            loading="lazy"
            onError={(e) => {
              // Replace broken images with placeholder
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = "/images/placeholder-product.svg";
            }}
          />
        </Link>

        {/* Badges (Sale, New, etc) */}
        {badges && (
          <div style={{ position: "absolute", top: "8px", left: "8px" }}>
            {badges}
          </div>
        )}
      </div>

      {/* Suppression Overlay (Only visible to merchants viewing their own products) */}
      {isProductSuppressed && isMerchantView && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              backgroundColor: "#d32f2f",
              padding: "6px 12px",
              borderRadius: "4px",
              marginBottom: "12px",
              fontWeight: "bold",
            }}
          >
            Product Suppressed
          </div>
          <p style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
            This product is not visible to customers due to missing or invalid
            data.
          </p>
          {suppressionReasons.length > 0 && (
            <div>
              <p
                style={{
                  fontWeight: "bold",
                  marginBottom: "4px",
                  fontSize: "0.8rem",
                }}
              >
                Suppressed from:
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "0.8rem",
                }}
              >
                {suppressionReasons.map((reason, index) => (
                  <li key={index} style={{ marginBottom: "2px" }}>
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            style={{
              marginTop: "12px",
              backgroundColor: "white",
              color: "#333",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.8rem",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/merchant/products/edit/${product.id}`;
            }}
          >
            Fix Issues
          </button>
        </div>
      )}

      {/* Product Info */}
      <div
        style={{
          padding: currentDimensions.padding,
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          overflow: "hidden",
          position: "relative", // For absolute positioning of elements if needed
          height: `calc(${currentDimensions.height} - ${currentDimensions.imageHeight})`,
          minHeight: `calc(${currentDimensions.height} - ${currentDimensions.imageHeight})`,
          maxHeight: `calc(${currentDimensions.height} - ${currentDimensions.imageHeight})`,
        }}
      >
        {/* Brand */}
        <div
          className="product-brand"
          style={{
            fontSize: currentDimensions.fontSize.brand,
            color: "#666",
            marginBottom: "4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            height: `${currentDimensions.fontSize.brand}`, // Fixed height
          }}
        >
          {product.brandName || "Brand"}
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.slug || product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <h3
            className="product-title"
            style={{
              margin: "0 0 4px 0",
              fontSize: currentDimensions.fontSize.title,
              fontWeight: 600,
              lineHeight: currentDimensions.titleLineHeight,
              height: `calc(${currentDimensions.titleLineHeight}em * ${currentDimensions.titleLines})`,
              minHeight: `calc(${currentDimensions.titleLineHeight}em * ${currentDimensions.titleLines})`, // Enforce minimum height
              maxHeight: `calc(${currentDimensions.titleLineHeight}em * ${currentDimensions.titleLines})`, // Enforce maximum height
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: currentDimensions.titleLines,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
              wordBreak: "break-word", // Prevent long words from overflowing
            }}
          >
            {product.title || "Untitled Product"}
          </h3>
        </Link>

        {/* Description - truncated and responsive */}
        <p
          className="product-description"
          style={{
            margin: "0 0 8px 0",
            fontSize: currentDimensions.fontSize.description,
            color: "#666",
            lineHeight: currentDimensions.descriptionLineHeight,
            height: `calc(${currentDimensions.descriptionLineHeight}em * ${currentDimensions.descriptionLines})`,
            minHeight: `calc(${currentDimensions.descriptionLineHeight}em * ${currentDimensions.descriptionLines})`, // Enforce minimum height
            maxHeight: `calc(${currentDimensions.descriptionLineHeight}em * ${currentDimensions.descriptionLines})`, // Enforce maximum height
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: currentDimensions.descriptionLines,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            wordBreak: "break-word", // Prevent long words from overflowing
          }}
        >
          {getResponsiveDescription() || "No description available"}
        </p>

        {/* Price */}
        <div
          style={{
            marginTop: "auto",
            height: "24px",
            minHeight: "24px",
            maxHeight: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: currentDimensions.fontSize.price,
              }}
            >
              {formatCurrency(product.price || 0)}
            </span>

            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "#999",
                    fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                  }}
                >
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}

            {product.discountPercentage && product.discountPercentage > 0 && (
              <span
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "clamp(0.625rem, 1.2vw, 0.75rem)",
                  fontWeight: 600,
                }}
              >
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveProductCard;
