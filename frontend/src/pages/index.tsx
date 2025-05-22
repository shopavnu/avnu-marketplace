import { motion, useScroll, useTransform } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useRef } from "react";
import { Logo } from "@/components/layout";
import { ProductGrid } from "@/components/products";
import { products } from "@/data/products";
import { brands } from "@/data/brands";
import { BrandCard, FeaturedBrands } from "@/components/brands";
import { HeroMasonry } from "@/components/home";
import { SearchSection } from "@/components/search";
import {
  DiscoveryFeed,
  CategoryGrid,
  PersonalizedGrid,
} from "@/components/discovery";
import ClientOnly from "@/components/common/ClientOnly";
import { ScrollSection, ScrollItem } from "@/components/common";
import { getFeaturedCategories } from "@/data/categories";
import DOMInspector from "../components/debug/DOMInspector";
import FlexProductCard from "@/components/products/FlexProductCard";
import CardWrapper from "@/components/products/CardWrapper";

export default function Home() {
  // Refs for scroll animations
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mainRef });

  // Transform values for parallax effects
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <div className="min-h-screen bg-warm-white">
      <Head>
        <title>av | nu - Curated Independent Brands</title>
        <meta
          name="description"
          content="Discover curated independent brands on av | nu marketplace"
        />
      </Head>

      <main ref={mainRef}>
        <DOMInspector />
        {/* Hero Section with Prominent Search */}
        <ClientOnly>
          <motion.div
            className="relative"
            style={{ opacity: heroOpacity, scale: heroScale }}
          >
            <HeroMasonry />

            {/* Prominent Search Section - Positioned over Hero */}
            <div className="absolute top-1/2 left-0 right-0 z-10 transform -translate-y-1/2">
              <SearchSection />
            </div>
          </motion.div>
        </ClientOnly>

        {/* Visual Category Browser */}
        <ScrollSection
          fadeIn={true}
          slideUp={true}
          bgColor="bg-warm-white"
          className="py-12"
        >
          <ClientOnly>
            <ScrollItem>
              <CategoryGrid
                title="Browse Categories"
                description="Discover sustainable products across our curated collections"
                showFeaturedOnly={true}
                maxCategories={12}
              />
            </ScrollItem>
          </ClientOnly>
        </ScrollSection>

        {/* Featured Brands with Value Tags */}
        <ScrollSection
          fadeIn={true}
          slideUp={true}
          bgColor="bg-sage/5"
          className="py-16"
        >
          <ClientOnly>
            <FeaturedBrands
              title="Brands with Similar Values"
              description="Discover more brands that align with your preferences"
              brands={brands}
              maxBrands={4}
              valueFiltered={true}
            />
          </ClientOnly>
        </ScrollSection>

        {/* Personalized "For You" Masonry Grid */}
        <ScrollSection
          fadeIn={true}
          slideUp={true}
          bgColor="bg-warm-white"
          className="py-16"
        >
          <ClientOnly>
            <PersonalizedGrid
              title="For You"
              description="Products we think you'll love based on your preferences"
              products={products}
              maxProducts={12}
            />
          </ClientOnly>
        </ScrollSection>

        {/* Vertical Discovery Feed */}
        <ScrollSection
          fadeIn={true}
          slideUp={true}
          bgColor="bg-white"
          className="py-16"
        >
          <div className="max-w-7xl mx-auto px-4">
            <ScrollItem>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-montserrat text-2xl text-charcoal">
                  Discover More
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {["All", "Home", "Art", "Lighting", "Textiles"].map(
                    (category, index) => (
                      <ScrollItem key={category} delay={index * 0.05}>
                        <motion.button
                          className="px-4 py-2 rounded-full text-sm font-inter text-neutral-gray hover:text-sage hover:bg-sage/10 transition-all whitespace-nowrap"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {category}
                        </motion.button>
                      </ScrollItem>
                    ),
                  )}
                </div>
              </div>
            </ScrollItem>
            <ClientOnly>
              <ScrollItem>
                <DiscoveryFeed limit={24} showTitle={true} />
              </ScrollItem>
            </ClientOnly>
          </div>
        </ScrollSection>
      </main>

      <ScrollSection
        fadeIn={true}
        slideUp={false}
        bgColor="bg-charcoal"
        className="py-12 text-warm-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="font-inter text-white text-xl tracking-wider mb-4 block">
                av | nu
              </span>
              <p className="font-inter text-neutral-gray">
                Connecting discerning shoppers with extraordinary independent
                brands.
              </p>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">Shop</h3>
              <ClientOnly>
                <ul className="space-y-2 font-inter text-neutral-gray">
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      New Arrivals
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      Featured
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      Categories
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      Brands
                    </a>
                  </li>
                </ul>
              </ClientOnly>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">About</h3>
              <ClientOnly>
                <ul className="space-y-2 font-inter text-neutral-gray">
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      Our Story
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      For Brands
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-warm-white transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </ClientOnly>
            </div>
            <div>
              <h3 className="font-montserrat text-lg mb-4">Newsletter</h3>
              <p className="font-inter text-neutral-gray mb-4">
                Stay updated with new brands and products.
              </p>
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
      </ScrollSection>
    </div>
  );
}
