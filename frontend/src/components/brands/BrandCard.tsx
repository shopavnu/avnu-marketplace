import Image from 'next/image';
import Link from 'next/link';
import { Brand } from '@/types/brand';
import ClientOnly from '@/components/common/ClientOnly';
import { StarIcon } from '@heroicons/react/20/solid'; // Import star icon

interface BrandCardProps {
  brand: Brand;
}

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <ClientOnly>
      <Link href={`/brand/${brand.id}`} passHref legacyBehavior>
        <a className="block relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02] bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 h-full">
          {/* Image Section */}
          <div className="relative h-48 w-full">
            <Image
              src={brand.coverImage}
              alt={brand.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            {/* Subtle gradient for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            {/* Logo Overlay */}
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow">
              <Image src={brand.logo} alt={`${brand.name} logo`} width={32} height={32} className="rounded-full" />
            </div>
          </div>

          {/* Content Section - Adjusted padding and text colors for white background */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1 text-gray-900">{brand.name}</h3>
            {/* Rating Display */}
            {brand.rating && (
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                <span>{brand.rating.average.toFixed(1)}</span>
                <span className="ml-1">({brand.rating.count} reviews)</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{brand.description}</p>
            {/* Location Display */}
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {brand.location}
            </div>
            {/* Values/Causes Display */}
            {brand.values && brand.values.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {brand.values.map((value) => (
                  <span key={value} className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full capitalize">
                    {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
      </Link>
    </ClientOnly>
  );
}
