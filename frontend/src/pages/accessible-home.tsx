import React, { useRef, useState, useEffect } from "react";
// @ts-ignore - Ignoring TypeScript errors for framer-motion imports
import { useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { products } from "@/data/products";
import { brands } from "@/data/brands";
import { HeroMasonry } from "@/components/home";
import { SearchSection } from "@/components/search";
import { DiscoveryFeed, CategoryGrid } from "@/components/discovery";
import { FeaturedBrands } from "@/components/brands";
import ClientOnly from "@/components/common/ClientOnly";
import { getFeaturedCategories } from "@/data/categories";
import OptimizedPersonalizedGrid from "@/components/discovery/OptimizedPersonalizedGrid";
import AccessibleLayout from "@/components/layout/AccessibleLayout";
import SectionLandmark from "@/components/accessibility/SectionLandmark";

/**
 * Accessible version of the home page with enhanced vertical navigation
 */
export default function AccessibleHome() {
  // Refs for scroll animations
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mainRef as React.RefObject<HTMLElement> });
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform values for parallax effects
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  // Define sections for navigation and skip links
  const sections = [
    { id: "hero", title: "Hero" },
    { id: "categories", title: "Categories" },
    { id: "featured-brands", title: "Featured Brands" },
    { id: "for-you", title: "For You" },
    { id: "discover-more", title: "Discover More" },
  ];

  // Define skip links
  const skipLinks = [
    { targetId: "main-content", text: "Skip to main content" },
    { targetId: "categories", text: "Skip to categories" },
    { targetId: "for-you", text: "Skip to personalized content" },
    { targetId: "discover-more", text: "Skip to discover more" },
  ];

  return (
    <AccessibleLayout
      title="Home"
      description="Discover curated independent brands on av | nu marketplace"
      sections={sections}
      skipLinks={skipLinks}
    >
      <div ref={mainRef} className="min-h-screen bg-warm-white">
        {/* Hero Section with Prominent Search */}
        <SectionLandmark
          id="hero"
          title="Discover Curated Independent Brands"
          subtitle="Find sustainable products that match your values"
          isMain={true}
          className="relative"
        >
          <ClientOnly>
            <div
              style={{ opacity: heroOpacity as any, scale: heroScale as any }}
            >
              <HeroMasonry />

              {/* Prominent Search Section - Positioned over Hero */}
              <div className="absolute top-1/2 left-0 right-0 z-10 transform -translate-y-1/2">
                <SearchSection />
              </div>
            </div>
          </ClientOnly>
        </SectionLandmark>

        {/* Visual Category Browser */}
        <SectionLandmark
          id="categories"
          title="Browse Categories"
          subtitle="Discover sustainable products across our curated collections"
          className="py-12 bg-warm-white"
        >
          <ClientOnly>
            <CategoryGrid
              title="Browse Categories"
              description="Discover sustainable products across our curated collections"
              showFeaturedOnly={true}
              maxCategories={12}
            />
          </ClientOnly>
        </SectionLandmark>

        {/* Featured Brands with Value Tags */}
        <SectionLandmark
          id="featured-brands"
          title="Brands with Similar Values"
          subtitle="Discover more brands that align with your preferences"
          className="py-16 bg-sage/5"
          seeAllUrl="/brands"
          seeAllText="View all brands"
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
        </SectionLandmark>

        {/* Personalized "For You" Section */}
        <SectionLandmark
          id="for-you"
          title="For You"
          subtitle="Products we think you'll love based on your preferences"
          className="py-16 bg-warm-white"
        >
          <ClientOnly>
            {mounted && (
              <OptimizedPersonalizedGrid
                title="For You"
                maxItems={12}
                columns={4}
                gap={24}
              />
            )}
          </ClientOnly>
        </SectionLandmark>

        {/* Vertical Discovery Feed */}
        <SectionLandmark
          id="discover-more"
          title="Discover More"
          subtitle="Explore our curated collections"
          className="py-16 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {["All", "Home", "Art", "Lighting", "Textiles"].map(
                  (category) => (
                    <button
                      key={category}
                      className="px-4 py-2 rounded-full text-sm font-inter text-neutral-gray hover:text-sage hover:bg-sage/10 transition-all whitespace-nowrap"
                      aria-label={`Filter by ${category}`}
                    >
                      {category}
                    </button>
                  ),
                )}
              </div>
            </div>
            <ClientOnly>
              {mounted && <DiscoveryFeed limit={24} showTitle={true} />}
            </ClientOnly>
          </div>
        </SectionLandmark>

        {/* Footer */}
        <footer className="py-12 bg-charcoal text-warm-white">
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
                <h3 id="footer-shop" className="font-montserrat text-lg mb-4">
                  Shop
                </h3>
                <ul
                  className="space-y-2 font-inter text-neutral-gray"
                  aria-labelledby="footer-shop"
                >
                  <li>
                    <Link
                      href="/shop"
                      className="hover:text-warm-white transition-colors"
                    >
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/featured"
                      className="hover:text-warm-white transition-colors"
                    >
                      Featured
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="hover:text-warm-white transition-colors"
                    >
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/brands"
                      className="hover:text-warm-white transition-colors"
                    >
                      Brands
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 id="footer-about" className="font-montserrat text-lg mb-4">
                  About
                </h3>
                <ul
                  className="space-y-2 font-inter text-neutral-gray"
                  aria-labelledby="footer-about"
                >
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-warm-white transition-colors"
                    >
                      Our Story
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/for-brands"
                      className="hover:text-warm-white transition-colors"
                    >
                      For Brands
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="hover:text-warm-white transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-warm-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3
                  id="footer-newsletter"
                  className="font-montserrat text-lg mb-4"
                >
                  Newsletter
                </h3>
                <p className="font-inter text-neutral-gray mb-4">
                  Stay updated with new brands and products.
                </p>
                <form className="flex" aria-labelledby="footer-newsletter">
                  <label htmlFor="email-input" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-l-full bg-white/10 text-warm-white placeholder:text-neutral-gray focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-r-full bg-sage text-warm-white font-montserrat hover:bg-opacity-90 transition-all"
                    aria-label="Subscribe to newsletter"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AccessibleLayout>
  );
}
