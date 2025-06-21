import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FlexProductCardProps {
  product: any;
  badges?: React.ReactNode;
}

/**
 * A flex-based product card with consistent height
 * Based on industry best practices for maintaining equal card heights
 */
const FlexProductCard: React.FC<FlexProductCardProps> = ({
  product,
  badges,
}) => {
  // Extract product data safely
  const title = product.title || "";
  const price = product.price || 0;
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "";
  const imageUrl = product.image || "/placeholder.jpg";

  return (
    <div
      data-testid="product-card"
      className="w-full h-[360px] rounded-xl shadow-sm overflow-hidden"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "360px",
        maxHeight: "360px",
        minHeight: "360px",
        backgroundColor: "white",
      }}
    >
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col h-full"
        style={{ height: "100%" }}
      >
        {/* Image section - fixed height */}
        <div
          className="relative w-full bg-gray-50"
          style={{ height: "200px", flexShrink: 0 }}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        {/* Content section - flex grow */}
        <div
          className="flex flex-col p-4 bg-white"
          style={{
            flexGrow: 1,
            flexShrink: 0,
            height: "160px",
            overflow: "hidden",
          }}
        >
          {/* Brand */}
          <div className="mb-1 overflow-hidden" style={{ height: "16px" }}>
            {brandName && (
              <p className="text-xs text-gray-500 truncate">{brandName}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-2 overflow-hidden" style={{ height: "40px" }}>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {title}
            </h3>
          </div>

          {/* Spacer to push price to bottom */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Price - always at bottom */}
          <div className="mt-auto overflow-hidden" style={{ height: "24px" }}>
            <p className="text-sm font-medium text-gray-900">
              ${price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Badges */}
        {badges && (
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {badges}
          </div>
        )}
      </Link>
    </div>
  );
};

export default FlexProductCard;
