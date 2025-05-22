import { useRouter } from "next/router";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { brands as allBrands } from "@/data/brands";
import { products as allProducts } from "@/data/products"; // Import product data
import ProductCard from "@/components/products/ProductCard"; // Import ProductCard component
import { ConsistentProductCard } from "@/components/products"; // Import our consistent card components
import { Brand } from "@/types/brand"; // Import from central types
import { Product } from "@/types/products"; // Import Product type
import { DiscoverySectionWrapper, RecentlyViewedSection } from "@/components/discovery"; // Import discovery components
import { trackCategoryView } from "@/utils/discovery-integration"; // Import tracking function

const BrandDetailPage: React.FC = () => {
  const router = useRouter();
  const { brandId } = router.query; // Get brandId from URL query params
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (brandId) {
      const foundBrand = allBrands.find((b) => b.id === brandId);
      setBrand(foundBrand || null);

      if (foundBrand) {
        // Filter products for the current brand
        const filteredProducts = allProducts.filter(
          (p) => p.brand === foundBrand.name,
        );
        setBrandProducts(filteredProducts);
        
        // Track brand view for personalization
        if (typeof brandId === 'string') {
          trackCategoryView(brandId);
        }
      } else {
        setBrandProducts([]); // Reset if brand not found
      }
    }
  }, [brandId]);

  // Loading State
  if (!brand) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading brand details...</p>
      </div>
    );
  }

  // --- Render Page ---
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[50vh] min-h-[350px] w-full overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={brand.coverImage || "/placeholder-hero.jpg"}
            alt={`${brand.name} hero image`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10"
        >
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">
              {brand.name}
            </h1>
            {brand.rating && (
              <div className="flex items-center gap-2 text-white/90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  {brand.rating.average.toFixed(1)}
                </span>
                <span className="text-sm">({brand.rating.count} reviews)</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Brand Details Section - Horizontal Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">{brand.location}</span>
            </motion.div>

            {/* Values */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h6z" />
              </svg>
              {brand.values.map((value, index) => (
                <motion.span
                  key={value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize"
                >
                  {value}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Search and Products Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="container mx-auto px-4 pb-8"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="md:w-56 lg:w-64 flex-shrink-0"
          >
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Search {brand.name} Products
                </h3>
                {/* Search Input */}
                <form className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {/* Search Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    placeholder={`Search ${brand.name} products...`}
                    className="block w-full rounded-md border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 transition-colors duration-150"
                    aria-label={`Search products from ${brand.name}`}
                  />
                </form>
              </div>
            </div>
          </motion.div>

          {/* Product Grid - Pinterest Style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {brandProducts.length > 0 ? (
              /* Product Grid - No animation wrappers to prevent layout shifts */
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                style={{
                  display: "grid",
                  gridTemplateRows: "repeat(auto-fill, 360px)",
                  contain: "layout" /* Add CSS containment to the grid */,
                  position: "relative",
                  zIndex: 1,
                }}
                data-testid="product-grid"
              >
                {brandProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                    style={{
                      height: "360px",
                      width: "100%",
                      contain: "strict",
                      position: "relative",
                    }}
                    data-testid="product-cell"
                  >
                    <ConsistentProductCard
                      product={product}
                      badges={
                        <>
                          {product.isNew && (
                            <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                          {product.vendor?.isLocal && (
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium rounded-full">
                              Local
                            </span>
                          )}
                        </>
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-500 py-12"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="mt-3 font-medium">No Products Found</p>
                <p className="text-sm mt-1">
                  We couldn&apos;t find any products for {brand.name} at the
                  moment.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Discovery Section - Related Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-sage/5 py-12"
      >
        <div className="container mx-auto px-4">
          <DiscoverySectionWrapper
            title="You Might Also Like"
            subtitle="Personalized recommendations based on your browsing"
            maxItems={4}
            columns={4}
            showSeeAllLink={true}
            seeAllUrl="/final-discovery"
          />
        </div>
      </motion.div>

      {/* Recently Viewed Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-white py-12"
      >
        <div className="container mx-auto px-4">
          <RecentlyViewedSection 
            maxItems={4}
            showWhenEmpty={false}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default BrandDetailPage;
