import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brand } from '@/types/brand';
import ClientOnly from '@/components/common/ClientOnly';
import { StarIcon } from '@heroicons/react/20/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
import ValueTag from '@/components/common/ValueTag';

interface BrandCardProps {
  brand: Brand;
  featured?: boolean;
  showValues?: boolean;
  maxValues?: number;
}

export default function BrandCard({ 
  brand, 
  featured = false,
  showValues = true,
  maxValues = 3 
}: BrandCardProps) {
  // Limit the number of values shown if maxValues is set
  const displayValues = maxValues > 0 ? brand.values.slice(0, maxValues) : brand.values;
  const hasMoreValues = brand.values.length > maxValues;
  
  return (
    <ClientOnly>
      <div
        style={{ 
          height: '100%',
          width: '100%',
          contain: 'strict',
          position: 'relative'
        }}
        data-testid="brand-card"
        className="h-full"
      >
        <Link href={`/brand/${brand.id}`} className="block relative overflow-hidden rounded-xl shadow-lg bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage h-full flex flex-col">
          {/* Image Section */}
          <div className="relative aspect-square w-full overflow-hidden flex-shrink-0">
            <Image
              src={brand.coverImage}
              alt={brand.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              className="transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            {/* Subtle gradient for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            {/* Logo Overlay */}
            <motion.div 
              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <Image 
                src={brand.logo} 
                alt={`${brand.name} logo`} 
                width={36} 
                height={36} 
                className="rounded-full" 
              />
            </motion.div>
            
            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-3 right-3 bg-sage text-white text-xs font-medium px-2 py-1 rounded-full">
                Featured
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-montserrat font-medium mb-1 text-charcoal">{brand.name}</h3>
            
            {/* Rating Display */}
            {brand.rating && (
              <div className="flex items-center mb-2 text-sm text-neutral-gray">
                <StarIcon className="w-4 h-4 text-amber-500 mr-1" />
                <span>{brand.rating.average.toFixed(1)}</span>
                <span className="ml-1">({brand.rating.count} reviews)</span>
              </div>
            )}
            
            <p className="text-sm text-neutral-gray mb-4 line-clamp-2">{brand.description}</p>
            
            {/* Location Display */}
            <div className="flex items-center text-xs text-neutral-gray mb-4">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {brand.location}
            </div>
            
            {/* Values/Causes Display */}
            {showValues && brand.values && brand.values.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {displayValues.map((value) => (
                  <ValueTag key={value} value={value} size="small" />
                ))}
                {hasMoreValues && (
                  <span className="text-xs text-neutral-gray px-2 py-0.5">
                    +{brand.values.length - maxValues} more
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    </ClientOnly>
  );
}
