import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ClientOnlyProductCardProps {
  product: any;
  badges?: React.ReactNode;
}

/**
 * A product card that only renders on the client side
 * to avoid hydration mismatches with price formatting
 */
const ClientOnlyProductCard: React.FC<ClientOnlyProductCardProps> = ({
  product,
  badges,
}) => {
  const [isClient, setIsClient] = useState(false);

  // Only render content after component has mounted on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extract product data safely
  const title = product.title || "";
  const price = product.price || 0;
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "";
  const imageUrl = product.image || "/placeholder.jpg";

  // Show a placeholder during server-side rendering
  if (!isClient) {
    return (
      <div
        className="w-full h-[360px] bg-white rounded-xl shadow-sm overflow-hidden"
        style={{
          height: "360px",
          maxHeight: "360px",
          minHeight: "360px",
        }}
      >
        {/* Empty placeholder to maintain layout during SSR */}
      </div>
    );
  }

  return (
    <div
      className="w-full h-[360px] bg-white rounded-xl shadow-sm overflow-hidden"
      style={{
        height: "360px",
        maxHeight: "360px",
        minHeight: "360px",
      }}
    >
      <Link href={`/product/${product.id}`} className="block h-full">
        <div className="flex flex-col h-full">
          {/* Image section - fixed height */}
          <div
            className="relative w-full bg-gray-50"
            style={{ height: "200px" }}
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>

          {/* Content section - fixed height */}
          <div
            className="flex flex-col p-4 bg-white"
            style={{ height: "160px" }}
          >
            {/* Brand */}
            <div style={{ height: "16px", overflow: "hidden" }}>
              {brandName && (
                <p className="text-xs text-gray-500 truncate">{brandName}</p>
              )}
            </div>

            {/* Title */}
            <div
              style={{ height: "40px", overflow: "hidden", marginTop: "8px" }}
            >
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {title}
              </h3>
            </div>

            {/* Price - always at bottom */}
            <div style={{ marginTop: "auto" }}>
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

export default ClientOnlyProductCard;
