import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/data/products";

interface UnifiedProductCardProps {
  product: any; // Using any to accommodate both Product and discovery product types
  badges?: React.ReactNode;
  showRating?: boolean;
}

const UnifiedProductCard: React.FC<UnifiedProductCardProps> = ({
  product,
  badges,
  showRating = true,
}) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={`/product/${product.id}`} className="block">
        {/* Fixed-height image container */}
        <div className="relative w-full h-64 bg-gray-50">
          <Image
            src={product.images?.[0] || "/images/placeholder-product.jpg"}
            alt={product.title}
            fill
            className="object-contain p-2"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          {badges && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {badges}
            </div>
          )}

          {/* Default badges based on product properties */}
          {!badges && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                  New
                </span>
              )}
              {product.isSustainable && (
                <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                  Sustainable
                </span>
              )}
              {product.isHandmade && (
                <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                  Handmade
                </span>
              )}
              {product.isLocal && (
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Local
                </span>
              )}
              {product.salePrice && product.salePrice < product.price && (
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  Sale
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product info - fixed height */}
        <div className="p-4 h-32">
          {/* Brand */}
          {product.brand && (
            <div className="mb-1">
              <span className="text-xs text-neutral-gray truncate block">
                {typeof product.brand === "string"
                  ? product.brand
                  : product.brand?.name || ""}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-montserrat font-medium text-charcoal text-sm sm:text-base mb-1 line-clamp-2">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline mt-1">
            <span className="font-inter font-medium text-charcoal">
              ${product.price?.toFixed(2)}
            </span>

            {product.salePrice && product.salePrice < product.price && (
              <span className="ml-2 text-xs text-red-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Rating */}
          {showRating && product.rating && product.rating.average > 0 && (
            <div className="mt-1 flex items-center">
              <div className="flex text-yellow-400">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating.average || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
              </div>
              <span className="ml-1 text-xs text-gray-500">
                ({product.rating.count})
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default UnifiedProductCard;
