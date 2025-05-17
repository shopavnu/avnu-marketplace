import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { Logo } from '@/components/layout';
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
import { Product } from '@/types/products';
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

// Placeholder for future personalization (user/session-based)
// Example: const userInterests = getUserInterests() // <-- To implement

export default function Home() {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shuffleArray(dataBrands).slice(0, 4).map((brand) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <BrandCard brand={adaptBrand(brand)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Now */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-montserrat text-2xl text-charcoal mb-8">
              Popular Now
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Adapt products to the full Product type before sorting and rendering */}
              {getPopularProducts(dataProducts.map(adaptProduct)).slice(0, 4).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* For You (Product Discovery Feed) */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 mb-8 flex items-center justify-between">
              <h2 className="font-montserrat text-2xl text-charcoal">
                For You
              </h2>
              <div className="flex gap-2">
                {['All', 'Home', 'Art', 'Lighting', 'Textiles'].map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 rounded-full text-sm font-inter text-neutral-gray hover:text-sage hover:bg-sage/10 transition-all"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <ProductGrid products={dataProducts.map(adaptProduct)} />
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
