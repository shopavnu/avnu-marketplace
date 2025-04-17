import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { MasonryItem } from '@/types/home';

// Get aspect ratio based on index
const getAspectRatio = (index: number) => {
  // Create a repeating pattern of aspect ratios
  const ratios = ['3/4', '4/3', '3/2', '2/3', '1/1', '9/16'];
  return ratios[index % ratios.length];
};

const heroItems: MasonryItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&q=80&fit=crop',
    title: 'Handcrafted Ceramics',
    category: 'Home'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1602872030219-ad2b9a54315c?auto=format&q=80&fit=crop',
    title: 'Artisan Jewelry',
    category: 'Accessories'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&q=80&fit=crop',
    title: 'Sustainable Fashion',
    category: 'Fashion'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&q=80&fit=crop',
    title: 'Modern Lighting',
    category: 'Home'
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&q=80&fit=crop',
    title: 'Eco-friendly Textiles',
    category: 'Home'
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&q=80&fit=crop',
    title: 'Minimalist Decor',
    category: 'Home'
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&q=80&fit=crop',
    title: 'Artisanal Pottery',
    category: 'Home'
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1467293622093-9f15c96be70f?auto=format&q=80&fit=crop',
    title: 'Woven Baskets',
    category: 'Home'
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&q=80&fit=crop',
    title: 'Handmade Soaps',
    category: 'Bath & Body'
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&q=80&fit=crop',
    title: 'Organic Candles',
    category: 'Home'
  }
];

export default function HeroMasonry() {
  const [mounted, setMounted] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-warm-white overflow-hidden safe-top safe-bottom">
      {/* Floating Text */}
      {mounted ? (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="text-center p-4 sm:p-8 bg-warm-white/80 backdrop-blur-lg rounded-2xl w-full max-w-4xl mx-4 safe-left safe-right">
            <motion.h1
              className="font-montserrat text-3xl sm:text-4xl md:text-6xl font-bold text-charcoal mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Discover Extraordinary<br />Independent Brands
            </motion.h1>
            <motion.p
              className="font-inter text-base sm:text-lg md:text-xl text-neutral-gray mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Explore our curated collection of unique products from passionate creators and artisans.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/shop" className="inline-block">
                  <span className="bg-sage text-warm-white px-8 py-3 rounded-full font-montserrat hover:bg-opacity-90 transition-all inline-block cursor-pointer shadow-md hover:shadow-lg">
                    Start Exploring
                  </span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/for-brands" className="inline-block">
                  <span className="border-2 border-sage text-sage px-8 py-3 rounded-full font-montserrat hover:bg-sage hover:text-warm-white transition-all inline-block cursor-pointer">
                    For Brands
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}

      {/* Masonry Grid */}
      {mounted ? (
        <div className="absolute inset-0 columns-1 xs:columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 p-2 sm:p-4 opacity-75 [column-fill:_balance] space-y-2 sm:space-y-4 safe-left safe-right safe-bottom">
          {heroItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative w-full break-inside-avoid rounded-xl overflow-hidden"
              style={{
                aspectRatio: index === 0 ? '2/3' : // First item is always tall
                          index === 1 ? '1/1' : // Second item is square
                          index === 2 ? '3/4' : // Third item is medium
                          index === 3 ? '4/3' : // Fourth item is wide
                          getAspectRatio(index) // Use consistent pattern
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredId(item.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === item.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: hoveredId === item.id ? 1 : 0, y: hoveredId === item.id ? 0 : 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-montserrat text-sm font-medium mb-1">{item.title}</h3>
                <p className="font-inter text-xs text-white/80">{item.category}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-white/0 via-warm-white/60 to-warm-white pointer-events-none" />
    </div>
  );
}
