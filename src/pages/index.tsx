import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from 'next/image';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Logo } from '@/components/layout';
/*
  TEMPORARY: This file contains some unused imports and variables that are expected to be used
  in future development (e.g., when integrating real merchant data or new features).
  eslint-disable-next-line comments have been added to allow builds to pass during development.
  BEFORE PRODUCTION: Remove these disables and clean up all unused code.
*/
import { Product } from '@/types/products';
import { ProductGrid } from '@/components/products';
import ProductCard from '@/components/products/ProductCard';
import { products as dataProducts } from '@/data/products';
import { brands as dataBrands } from '@/data/brands';
import { BrandCard } from '@/components/brands';
import { HeroMasonry } from '@/components/home';
import { SearchSection } from '@/components/search';
import ClientOnly from '@/components/common/ClientOnly';
import { adaptProduct, adaptBrand } from '@/utils/type-adapters';

// Utility: shuffle array for freshness
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Utility: get popular products (mock by rating desc, fallback to random)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPopularProducts(products: Product[]): Product[] {
  if (products.length && products[0].rating !== undefined) {
    return [...products].sort((a, b) => {
      // Use avnuRating.average as primary, fallback to shopify/wooCommerce, else 0
      const getAvg = (rating: Product['rating']) => {
        if (rating.avnuRating && typeof rating.avnuRating.average === 'number') return rating.avnuRating.average;
        if (rating.shopifyRating && typeof rating.shopifyRating.average === 'number') return rating.shopifyRating.average;
        if (rating.wooCommerceRating && typeof rating.wooCommerceRating.average === 'number') return rating.wooCommerceRating.average;
        return 0;
      };
      return getAvg(b.rating) - getAvg(a.rating);
    });
  }
  return shuffleArray(products);
}

import { getUserProfile } from '@/utils/user';

// Personalization helpers
import { Brand } from '@/types/brand';

function getPersonalizedBrands(brands: Brand[]): Brand[] {
  const profile = getUserProfile();
  if (!profile || (!profile.interests.length && !profile.favoriteBrands.length)) return brands;
  // Prioritize favorite brands, then brands matching interests
  const favs = brands.filter((b: Brand) => profile.favoriteBrands.includes(b.id));
  const interestMatches = brands.filter((b: Brand) =>
    b.categories && b.categories.some((cat: string) => profile.interests.includes(cat)) &&
    !profile.favoriteBrands.includes(b.id)
  );
  const rest = brands.filter((b: Brand) => !favs.includes(b) && !interestMatches.includes(b));
  return [...favs, ...interestMatches, ...rest];
}

function getPersonalizedProducts(products: Product[]): Product[] {
  const profile = getUserProfile();
  if (!profile || (!profile.interests.length && !profile.favoriteProducts.length)) return products;
  // Prioritize favorite products, then products matching interests, then the rest
  const favs = products.filter((p: Product) => profile.favoriteProducts.includes(p.id));
  const interestMatches = products.filter((p: Product) =>
    profile.interests.some((interest: string) => p.category === interest || (p.tags && p.tags.includes(interest))) &&
    !profile.favoriteProducts.includes(p.id)
  );
  const rest = products.filter((p: Product) => !favs.includes(p) && !interestMatches.includes(p));
  return [...favs, ...interestMatches, ...rest];
}

export default function Home() {
  // State for loading indicators
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [forYouLoading, setForYouLoading] = useState(true);
  
  // State for category selection
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Home', 'Art', 'Lighting', 'Textiles'];
  
  // Adapted data
  const adaptedBrands = getPersonalizedBrands(dataBrands);
  const adaptedProducts = getPersonalizedProducts(dataProducts.map(adaptProduct));
  const [filteredProducts, setFilteredProducts] = useState(adaptedProducts);
  
  // Simulate loading different sections
  useEffect(() => {
    const timer1 = setTimeout(() => setBrandsLoading(false), 800);
    const timer2 = setTimeout(() => setPopularLoading(false), 1200);
    const timer3 = setTimeout(() => setForYouLoading(false), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
  
  // Filter products by category
  useEffect(() => {
    setForYouLoading(true);
    setTimeout(() => {
      if (selectedCategory === 'All') {
        setFilteredProducts(adaptedProducts);
      } else {
        setFilteredProducts(
          adaptedProducts.filter(product => product.category === selectedCategory)
        );
      }
      setForYouLoading(false);
    }, 500);
  }, [selectedCategory, adaptedProducts]);

  return (
    <div className="min-h-screen bg-warm-white">
      <Head>
        <title>av | nu - Curated Independent Brands</title>
        <meta name="description" content="Discover curated independent brands on av | nu marketplace" />
      </Head>

      <main>
        {/* Hero Section */}
        <ClientOnly>
          <HeroMasonry />
        </ClientOnly>

        {/* Search Section */}
        <ClientOnly>
          <SearchSection />
        </ClientOnly>

        {/* Brands You Might Like */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-montserrat text-2xl text-charcoal mb-8">
              Brands You Might Like
            </h2>
            
            {/* Skeleton loader */}
            {brandsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-neutral-100 rounded-lg p-4 h-48 flex flex-col justify-between">
                    <div className="bg-neutral-200 h-12 w-12 rounded-full mb-3" />
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-neutral-200 rounded w-full mb-1" />
                      <div className="h-3 bg-neutral-200 rounded w-4/5" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="h-5 bg-neutral-200 rounded w-12" />
                      <div className="h-5 bg-neutral-200 rounded w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {adaptedBrands.slice(0, 4).map((brand, index) => (
                    <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <BrandCard brand={adaptBrand(brand)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* Popular Now */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-montserrat text-2xl text-charcoal mb-8">
              Popular Now
            </h2>
            
            {/* Skeleton loader for Popular Now */}
            {popularLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-neutral-100 rounded-lg p-4 h-64 flex flex-col justify-between">
                    {/* Image placeholder */}
                    <div className="bg-neutral-200 h-32 w-full rounded mb-3" />
                    {/* Content placeholders */}
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-neutral-200 rounded w-2/3 mb-3" />
                      {/* Price placeholder */}
                      <div className="h-5 bg-neutral-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {/* Adapt products to the full Product type before sorting and rendering */}
                  {adaptedProducts.slice(0, 4).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* For You (Product Discovery Feed) */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <h2 className="font-montserrat text-2xl text-charcoal">
                For You
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-inter transition-all ${
                      selectedCategory === category 
                      ? 'bg-sage text-white shadow-sm font-medium' 
                      : 'text-neutral-gray hover:text-sage hover:bg-sage/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Skeleton loader for For You section */}
            {forYouLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 px-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-neutral-100 rounded-lg h-72 p-4 flex flex-col justify-between">
                    {/* Image placeholder */}
                    <div className="bg-neutral-200 h-40 w-full rounded mb-3" />
                    {/* Content placeholders */}
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-neutral-200 rounded w-2/3 mb-3" />
                      {/* Price placeholder */}
                      <div className="h-5 bg-neutral-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div layout className="px-4">  
                <ProductGrid products={filteredProducts} />
                
                {filteredProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-montserrat font-medium mb-2">No products found</h3>
                    <p className="text-neutral-gray max-w-md">
                      We couldn't find any products in the {selectedCategory} category. Try selecting another category or check back later.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-charcoal text-warm-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="font-inter text-white text-xl tracking-wider mb-4 block">av | nu</span>
              <p className="font-inter text-neutral-gray">
                Connecting discerning shoppers with extraordinary independent brands.
              </p>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">Shop</h3>
              <ul className="space-y-2 font-inter text-neutral-gray">
  <li><a href="#" className="hover:text-warm-white transition-colors">New Arrivals</a></li>
  <li><a href="#" className="hover:text-warm-white transition-colors">Featured</a></li>
  <li><a href="#" className="hover:text-warm-white transition-colors">Categories</a></li>
  <li><a href="#" className="hover:text-warm-white transition-colors">Brands</a></li>
</ul>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">About</h3>
              <ul className="space-y-2 font-inter text-neutral-gray">
  <li><a href="#" className="hover:text-warm-white transition-colors">Our Story</a></li>
  <li><a href="#" className="hover:text-warm-white transition-colors">For Brands</a></li>
  <li><a href="#" className="hover:text-warm-white transition-colors">Blog</a></li>
  <li><a href="#" className="hover:text-warm-white transition-colors">Contact</a></li>
</ul>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">Newsletter</h3>
              <p className="font-inter text-neutral-gray mb-4">Stay updated with new brands and products.</p>
              <form className="flex">
  <input
    type="email"
    placeholder="Enter your email"
    className="flex-1 px-4 py-2 rounded-l-full bg-white/10 text-warm-white placeholder:text-neutral-gray focus:outline-none focus:ring-1 focus:ring-sage"
  />
  <button className="px-6 py-2 rounded-r-full bg-sage text-warm-white font-montserrat hover:bg-opacity-90 transition-all">
    Join
  </button>
</form>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
