import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartIcon,
  XMarkIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { products as allProducts } from "@/data/products";
import { Product } from "@/types/products";
import ProductCard from "@/components/products/ProductCard";

const FavoritesPage = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on component mount
  useEffect(() => {
    // In a real app, this would come from an API or local storage
    // For demo purposes, we'll use a subset of products as mock favorites
    const loadFavorites = () => {
      setIsLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        // Select a few random products as favorites
        const mockFavorites = allProducts
          .filter((_, index) => index % 3 === 0) // Select every third product
          .slice(0, 6); // Limit to 6 products

        setFavorites(mockFavorites);
        setIsLoading(false);
      }, 800);
    };

    loadFavorites();
  }, []);

  // Remove item from favorites
  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((product) => product.id !== productId));
  };

  // Add to cart (mock functionality)
  const addToCart = (product: Product) => {
    // In a real app, this would add the product to the cart
    console.log("Added to cart:", product.title);

    // Show a toast or notification
    alert(`Added ${product.title} to your cart!`);
  };

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal">
            My Favorites
          </h1>
          <Link
            href="/shop"
            className="text-sage hover:underline flex items-center"
          >
            Continue Shopping
          </Link>
        </div>

        {isLoading ? (
          // Loading state
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
          </div>
        ) : favorites.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 max-w-md mx-auto"
          >
            <HeartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-charcoal mb-2">
              Your favorites list is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Browse our collections and heart your favorite items to save them
              here for later.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-sage text-white rounded-md font-medium hover:bg-sage/90 transition-colors"
            >
              Explore Products
            </Link>
          </motion.div>
        ) : (
          // Favorites grid
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden relative group"
              >
                {/* Product Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Link href={`/product/${product.id}`}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>

                  {/* Remove from favorites button */}
                  <button
                    onClick={() => removeFromFavorites(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <HeartIconSolid className="w-5 h-5 text-sage" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <Link
                    href={`/brand/${product.brand.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sage hover:underline text-sm font-medium"
                  >
                    {product.brand}
                  </Link>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-medium text-charcoal mt-1 hover:text-sage transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-charcoal">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center text-sage hover:text-sage/80 transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingBagIcon className="w-5 h-5 mr-1" />
                      <span className="text-sm">Add to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Recently Viewed Section (optional) */}
        {!isLoading && favorites.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-charcoal mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allProducts.slice(6, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
