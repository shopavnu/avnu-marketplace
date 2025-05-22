import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FixedHeightProductCardProps {
  product: any;
  badges?: React.ReactNode;
}

/**
 * A completely fixed-height product card with no dynamic elements
 * This is a last-resort approach to ensure consistent card heights
 */
const FixedHeightProductCard: React.FC<FixedHeightProductCardProps> = ({
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
      className="w-full h-[360px] bg-white rounded-xl shadow-sm overflow-hidden"
      style={{
        display: "block",
        height: "360px",
        maxHeight: "360px",
        minHeight: "360px",
      }}
    >
      <Link href={`/product/${product.id}`} className="block w-full h-full">
        {/* Fixed-height container with absolutely positioned elements */}
        <div className="relative w-full h-full">
          {/* Image section - fixed size */}
          <div
            className="absolute top-0 left-0 w-full bg-gray-50"
            style={{ height: "200px" }}
          >
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          </div>

          {/* Content section - fixed position and size */}
          <div
            className="absolute top-[200px] left-0 w-full p-4 bg-white"
            style={{ height: "160px" }}
          >
            {/* Brand - fixed height */}
            <div style={{ height: "16px", overflow: "hidden" }}>
              {brandName && (
                <p className="text-xs text-gray-500 truncate">{brandName}</p>
              )}
            </div>

            {/* Title - fixed height */}
            <div
              style={{ height: "40px", overflow: "hidden", marginTop: "8px" }}
            >
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {title}
              </h3>
            </div>

            {/* Price - fixed height */}
            <div
              style={{ height: "24px", overflow: "hidden", marginTop: "8px" }}
            >
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
        </div>
      </Link>
    </div>
  );
};

export default FixedHeightProductCard;
