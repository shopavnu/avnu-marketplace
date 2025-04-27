import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/products';
import { causes } from '@/components/search/FilterPanel';
import { analyticsService } from '@/services/analytics.service';
import { useRouter } from 'next/router';
import ValueTag from '@/components/common/ValueTag';

interface MasonryProductCardProps {
  product: Product;
  priority?: boolean;
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
}

export default function MasonryProductCard({ 
  product, 
  priority = false,
  size = 'medium',
  showDescription = false
}: MasonryProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { query } = router.query;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simplified card that will definitely work
  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      style={{ 
        width: '100%',
        height: '100%',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        contain: 'strict'
      }}
    >
      <Link 
        href={`/product/${product.id}`} 
        className="block h-full" 
      >
        {/* Image section */}
        <div style={{ height: '200px', position: 'relative' }}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            style={{ objectFit: 'cover' }}
            priority={priority}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                New
              </span>
            )}
            {product.vendor?.isLocal && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium rounded-full">
                Local
              </span>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-medium text-charcoal text-base mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          {/* Description (optional) */}
          {showDescription && product.description && (
            <p className="text-sm text-neutral-gray mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto">
            {mounted ? (
              <span className="text-lg font-medium text-charcoal">
                ${product.price.toFixed(2)}
              </span>
            ) : (
              <span className="text-lg font-medium text-charcoal opacity-0">
                $0.00
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
