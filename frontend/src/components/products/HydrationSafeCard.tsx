import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

interface HydrationSafeCardProps {
  product: any;
  badges?: React.ReactNode;
}

/**
 * A hydration-safe product card that ensures consistent heights
 * by avoiding server/client rendering mismatches
 */
const HydrationSafeCard: React.FC<HydrationSafeCardProps> = ({
  product,
  badges,
}) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Extract product data safely
  const title = product.title || "";
  const price = product.price || 0;
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "";
  const imageUrl = product.image || "/placeholder.jpg";

  // Only render dynamic content after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className="w-full h-[360px] bg-white rounded-xl shadow-sm overflow-hidden"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "360px",
        maxHeight: "360px",
        minHeight: "360px",
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

          {/* Price - always at bottom - with hydration safety */}
          <div className="mt-auto overflow-hidden" style={{ height: "24px" }}>
            {isClient ? (
              <p className="text-sm font-medium text-gray-900">
                ${price.toFixed(2)}
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {/* Static placeholder during SSR to avoid hydration mismatch */}
                <span className="opacity-0">$0.00</span>
              </p>
            )}
          </div>
        </div>

        {/* Badges - only render on client side to avoid hydration mismatches */}
        {isClient && badges && (
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {badges}
          </div>
        )}
      </Link>
    </div>
  );
};

export default HydrationSafeCard;
