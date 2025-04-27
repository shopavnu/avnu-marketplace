import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/data/categories';

interface CategoryCardProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category,
  size = 'medium'
}) => {
  // Standardize aspect ratio to match product cards
  const aspectRatio = 'aspect-square';
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group h-full"
    >
      <Link href={`/category/${category.slug}`} className="block h-full flex flex-col">
        <div className={`relative ${aspectRatio} rounded-xl overflow-hidden flex-shrink-0`}>
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="font-montserrat font-medium text-white text-sm sm:text-base">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-white/80 text-xs mt-1 line-clamp-2 hidden sm:block">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
