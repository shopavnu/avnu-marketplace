import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeartIcon, StarIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import useLazyImage from "@/hooks/useLazyImage";

interface OptimizedProductCardProps {
  product: any; // Using any to accommodate both Product and discovery product types
  badges?: React.ReactNode;
  priority?: boolean; // Whether to prioritize image loading
}

/**
 * An optimized product card component that uses virtualization and lazy loading
 * for improved performance in long vertical layouts
 */
const OptimizedProductCard: React.FC<OptimizedProductCardProps> = ({
  product,
  badges,
  priority = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Use lazy loading for images unless priority is true
  const { isLoaded, isInView, currentSrc, ref } = useLazyImage({
    src: product.image,
    placeholderSrc:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4=",
    rootMargin: "200px 0px",
    threshold: 0.1,
  });

  // Only render interactive elements on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle favorite action
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        height: "360px",
        minHeight: "360px",
        maxHeight: "360px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: isHovered
          ? "0 10px 20px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        contain: "strict",
        position: "relative",
        display: "block",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <Link
        href={`/product/${product.id}`}
        style={{
          display: "block",
          height: "100%",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {/* Image section - fixed 200px height with hover zoom effect */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          style={{
            position: "relative",
            height: "200px",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Image
            src={priority ? product.image : currentSrc}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: "cover",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              opacity: priority || isLoaded ? 1 : 0.5,
              filter: priority || isLoaded ? "none" : "blur(10px)",
            }}
          />
        </div>

        {/* Favorite button - Netflix/Airbnb style */}
        {mounted && (
          <button
            onClick={handleFavoriteClick}
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease, background-color 0.2s ease",
              transform: isHovered ? "scale(1)" : "scale(0.9)",
              opacity: isHovered ? 1 : 0.8,
            }}
          >
            <HeartIcon
              width={18}
              height={18}
              color={isFavorited ? "#FF385C" : "#484848"}
              fill={isFavorited ? "#FF385C" : "none"}
              style={{ transition: "all 0.2s ease" }}
            />
          </button>
        )}

        {/* Content section */}
        <div style={{ padding: "16px" }}>
          {/* Brand and verification badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "4px",
              height: "20px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#666",
                margin: 0,
                lineHeight: "1.4",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.brand}
              {product.vendor?.isVerified && (
                <CheckBadgeIcon
                  style={{
                    width: "14px",
                    height: "14px",
                    marginLeft: "4px",
                    color: "#FF385C",
                  }}
                />
              )}
            </p>
          </div>

          {/* Title - fixed 40px height, 2 lines max */}
          <div style={{ height: "40px", marginBottom: "8px" }}>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 500,
                margin: 0,
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                transition: "color 0.2s ease",
                color: isHovered ? "#FF385C" : "#333",
              }}
            >
              {product.title}
            </h3>
          </div>

          {/* Description - fixed 40px height */}
          <div
            style={{
              height: "40px",
              marginBottom: "8px",
              overflow: "hidden",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#666",
                margin: 0,
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </p>
          </div>

          {/* Price and rating */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Price */}
            <div>
              {mounted && product.salePrice ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      margin: 0,
                      color: "#FF385C",
                    }}
                  >
                    ${product.salePrice.toFixed(2)}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      textDecoration: "line-through",
                      margin: 0,
                      color: "#999",
                    }}
                  >
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    margin: 0,
                    color: "#333",
                  }}
                >
                  {mounted ? `$${product.price.toFixed(2)}` : ""}
                </p>
              )}
            </div>

            {/* Rating */}
            {product.rating && product.rating.average > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <StarIcon
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#FF385C",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  {product.rating.average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badges (e.g., "New", "Sale", etc.) */}
        {badges && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 10,
            }}
          >
            {badges}
          </div>
        )}
      </Link>
    </div>
  );
};

export default OptimizedProductCard;
