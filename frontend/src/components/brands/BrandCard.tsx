import Image from 'next/image';
import { Brand } from '@/types/brand';
import ClientOnly from '@/components/common/ClientOnly';

interface BrandCardProps {
  brand: Brand;
}

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <ClientOnly>
      <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]">
        <div className="relative h-48">
          <Image
            src={brand.coverImage}
            alt={brand.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold mb-1">{brand.name}</h3>
          <p className="text-sm text-gray-200 mb-2">{brand.description}</p>
          <div className="flex items-center text-xs text-gray-300">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {brand.location}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
