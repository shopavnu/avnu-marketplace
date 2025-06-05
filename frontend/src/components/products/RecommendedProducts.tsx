import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Types
interface ProductType {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  brand: string;
}

interface RecommendedProductsProps {
  products?: ProductType[];
  title?: string;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  products = [],
  title = 'You May Also Like',
}) => {
  // If no products provided, use these example products
  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: 'prod-rec-1',
            title: 'Handcrafted Ceramic Bowl',
            price: 35.99,
            image:
              'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=800',
            slug: 'handcrafted-ceramic-bowl',
            brand: 'Terra & Clay',
          },
          {
            id: 'prod-rec-2',
            title: 'Cotton Throw Pillow',
            price: 29.99,
            image:
              'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?auto=format&fit=crop&w=800',
            slug: 'cotton-throw-pillow',
            brand: 'Pure Living',
          },
          {
            id: 'prod-rec-3',
            title: 'Wooden Serving Tray',
            price: 42.50,
            image:
              'https://images.unsplash.com/photo-1604350026183-f4fcc7f309c1?auto=format&fit=crop&w=800',
            slug: 'wooden-serving-tray',
            brand: 'Natural Wood Co.',
          },
          {
            id: 'prod-rec-4',
            title: 'Linen Table Runner',
            price: 24.99,
            image:
              'https://images.unsplash.com/photo-1589986005992-e5379505d269?auto=format&fit=crop&w=800',
            slug: 'linen-table-runner',
            brand: 'Pure Living',
          },
        ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-charcoal">{title}</h2>
        <Link href="/shop" className="flex items-center text-sage hover:text-sage-dark transition-colors">
          <span className="mr-1">View Shop</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {displayProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={item}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Link href={`/products/${product.slug}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10">
                  {product.title}
                </h3>
                <div className="font-medium text-charcoal">
                  {formatCurrency(product.price)}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default RecommendedProducts;
