import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types/products';
import { causes } from '@/components/search/FilterPanel';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [combinedRating, setCombinedRating] = useState({
    average: product.rating.avnuRating.average,
    count: 0
  });

  useEffect(() => {
    setCombinedRating({
      average: product.rating.avnuRating.average,
      count: product.rating.avnuRating.count +
        (product.rating.shopifyRating?.count || 0) +
        (product.rating.wooCommerceRating?.count || 0)
    });
  }, [product.rating]);

  return (
    <motion.div
      className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl 
                transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                New
              </span>
            )}
            {product.vendor.isLocal && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium rounded-full">
                Local
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm
                     text-charcoal hover:text-sage transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isClient && isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-4">
          {/* Vendor & Causes */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            <span className="text-xs text-neutral-gray truncate max-w-[120px]">{product.vendor.name}</span>
            <div className="flex gap-1.5">
              {product.vendor.causes.map((causeId, index) => {
                const cause = causes.find(c => c.id === causeId);
                if (!cause) return null;
                return (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div 
                      className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-sage/10 text-sage rounded-full hover:bg-sage/20 transition-colors duration-200"
                      title={cause.name}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">{cause.icon}</div>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      {cause.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-montserrat font-medium text-charcoal text-sm sm:text-base mb-1 line-clamp-2">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isClient && i < Math.floor(combinedRating.average) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              ))}
            </div>
            {isClient && (
              <span className="text-xs text-neutral-gray">
                ({combinedRating.count})
              </span>
            )}
          </div>

          {/* Price & Shipping */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-base sm:text-lg font-montserrat font-medium text-charcoal">
                ${product.price.toFixed(2)}
              </span>
              {product.vendor.shippingInfo.isFree ? (
                <p className="text-xs text-sage">Free Shipping</p>
              ) : product.vendor.shippingInfo.minimumForFree ? (
                <p className="text-xs text-neutral-gray">
                  Free shipping over ${product.vendor.shippingInfo.minimumForFree}
                </p>
              ) : null}
            </div>
            {!product.inStock && (
              <span className="text-xs text-red-500">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
