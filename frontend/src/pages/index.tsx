import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { Logo } from '@/components/layout';
import { ProductGrid } from '@/components/products';
import { products } from '@/data/products';
import { brands } from '@/data/brands';
import { BrandCard } from '@/components/brands';
import { HeroMasonry } from '@/components/home';
import { SearchSection } from '@/components/search';
import { DiscoveryFeed } from '@/components/discovery';
import ClientOnly from '@/components/common/ClientOnly';

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

        {/* Featured Brands */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-montserrat text-2xl text-charcoal mb-8">
              Featured Brands
            </h2>
            <ClientOnly>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brands.slice(0, 4).map((brand) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <BrandCard brand={brand} />
                  </motion.div>
                ))}
              </div>
            </ClientOnly>
          </div>
        </section>

        {/* Personalized Discovery Feed */}
        <section className="mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-montserrat text-2xl text-charcoal">
                Discover Products
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
            <ClientOnly>
              <DiscoveryFeed limit={24} showTitle={true} />
            </ClientOnly>
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
              <ClientOnly>
                <ul className="space-y-2 font-inter text-neutral-gray">
                  <li><a href="#" className="hover:text-warm-white transition-colors">New Arrivals</a></li>
                  <li><a href="#" className="hover:text-warm-white transition-colors">Featured</a></li>
                  <li><a href="#" className="hover:text-warm-white transition-colors">Categories</a></li>
                  <li><a href="#" className="hover:text-warm-white transition-colors">Brands</a></li>
                </ul>
              </ClientOnly>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">About</h3>
              <ClientOnly>
                <ul className="space-y-2 font-inter text-neutral-gray">
                  <li><a href="#" className="hover:text-warm-white transition-colors">Our Story</a></li>
                  <li><a href="#" className="hover:text-warm-white transition-colors">For Brands</a></li>
                  <li><a href="#" className="hover:text-warm-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-warm-white transition-colors">Contact</a></li>
                </ul>
              </ClientOnly>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">Newsletter</h3>
              <p className="font-inter text-neutral-gray mb-4">Stay updated with new brands and products.</p>
              <ClientOnly>
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
              </ClientOnly>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
