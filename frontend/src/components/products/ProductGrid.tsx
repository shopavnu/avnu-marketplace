import { Product } from '@/types/products';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
}



const ITEMS_PER_PAGE = 12;

export default function ProductGrid({ products }: ProductGridProps) {
  const [mounted, setMounted] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { query } = router.query;

  // Using useCallback to memoize the loadMore function
  const loadMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const nextProducts = products.slice(
        displayedProducts.length,
        displayedProducts.length + ITEMS_PER_PAGE
      );
      setDisplayedProducts((prev: Product[]) => [...prev, ...nextProducts]);
      setPage((prev: number) => prev + 1);
      setLoading(false);
    }, 500);
  }, [displayedProducts.length, products]);

  useEffect(() => {
    setMounted(true);
    setDisplayedProducts(products.slice(0, ITEMS_PER_PAGE));
  }, [products]);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (!loading && displayedProducts.length < products.length) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedProducts, loading, products, mounted, loadMore]);

  if (!mounted) {
    return null;
  }

  return (
    <motion.div 
      className="columns-1 xs:columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 p-2 sm:p-4 safe-left safe-right safe-bottom"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <AnimatePresence>
        {displayedProducts.map((product: Product, index: number) => (
          <motion.div
            key={product.id}
            className="break-inside-avoid mb-2 sm:mb-4 cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/product/${product.id}`}>
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-warm-white shadow-sm hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => {
                  // Track product click with position based on index in grid
                  const position = index + 1; // Use index + 1 as position (1-based indexing)
                  const searchQuery = Array.isArray(query) ? query[0] : query;
                  
                  if (searchQuery) {
                    analyticsService.trackSearchResultClick(
                      product.id,
                      position,
                      searchQuery
                    );
                  }
                }}
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={index < 4}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-3 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.button
                      className="p-3 rounded-full bg-white/90 text-charcoal hover:bg-sage hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-3 rounded-full bg-white/90 text-charcoal hover:bg-sage hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </motion.button>
                  </motion.div>
                </div>
                <motion.div 
                  className="p-3 sm:p-4"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.h3 
                    className="font-montserrat text-base sm:text-lg font-medium text-charcoal mb-1"
                    whileHover={{ x: 5 }}
                  >
                    {product.title}
                  </motion.h3>
                  <p className="font-inter text-xs sm:text-sm text-neutral-gray mb-2">
                    {product.brand}
                  </p>
                  <motion.p 
                    className="font-montserrat font-medium text-sage text-sm sm:text-base"
                    whileHover={{ scale: 1.05 }}
                  >
                    ${product.price.toFixed(2)}
                  </motion.p>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
