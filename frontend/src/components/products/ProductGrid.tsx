import { Product } from "@/types/products";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { analyticsService } from "@/services/analytics.service";
import { useRouter } from "next/router";
import Link from "next/link";
import useProducts from "@/hooks/useProducts";
import { Spinner } from "@/components/common";

interface ProductGridProps {
  initialProducts?: Product[];
}

export default function ProductGrid({ initialProducts = [] }: ProductGridProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { query } = router.query;
  
  const {
    products: displayedProducts,
    loading,
    hasMore,
    fetchMore,
    error
  } = useProducts({
    initialData: initialProducts,
    initialTake: 12
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1000
      ) {
        if (!loading && hasMore) {
          fetchMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, mounted, fetchMore]);

  if (!mounted) {
    return null;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error loading products: {error.message}</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="relative">
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
                <div className="relative overflow-hidden rounded-lg">
                  <div className="aspect-[1/1.3] relative">
                    <Image
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white transition-opacity duration-300">
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm opacity-90">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <Spinner size="large" />
        </div>
      )}
      
      {/* End of results message */}
      {!loading && !hasMore && displayedProducts.length > 0 && (
        <div className="text-center my-8 text-gray-500">
          No more products to load
        </div>
      )}
      
      {/* Empty state */}
      {!loading && displayedProducts.length === 0 && !error && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No products found</p>
        </div>
      )}
    </div>
  );
}
