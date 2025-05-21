import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/products';
import { Brand } from '@/types/brand';
import { getUserProfile } from '@/utils/user';
import { generateMockBrands, generateBrandProducts } from '@/utils/mockData';
import ProductCard from '@/components/products/ProductCard';
import SkeletonProductCard from '@/components/SkeletonProductCard';
import BrandCard from '@/components/brands/BrandCard';
import DiscoverFilterPanel, { DiscoverFilters } from '@/components/DiscoverFilterPanel';
import ActiveFilterPills from '@/components/ActiveFilterPills';

// Personalization helpers
function getPersonalizedProducts(products: Product[]): Product[] {
  const profile = getUserProfile();
  if (!profile || (!profile.interests.length && !profile.favoriteProducts.length)) return products;
  const favs = products.filter((p: Product) => profile.favoriteProducts.includes(p.id));
  const interestMatches = products.filter((p: Product) =>
    profile.interests.some((interest: string) => p.category === interest || (p.tags && p.tags.includes(interest))) &&
    !profile.favoriteProducts.includes(p.id)
  );
  const rest = products.filter((p: Product) => !favs.includes(p) && !interestMatches.includes(p));
  return [...favs, ...interestMatches, ...rest];
}

function getPersonalizedBrands(brands: Brand[]): Brand[] {
  const profile = getUserProfile();
  if (!profile || (!profile.interests.length && !profile.favoriteBrands.length)) return brands;
  const favs = brands.filter((b: Brand) => profile.favoriteBrands.includes(b.id));
  const interestMatches = brands.filter((b: Brand) =>
    b.categories && b.categories.some((cat: string) => profile.interests.includes(cat)) &&
    !profile.favoriteBrands.includes(b.id)
  );
  const rest = brands.filter((b: Brand) => !favs.includes(b) && !interestMatches.includes(b));
  return [...favs, ...interestMatches, ...rest];
}

export default function DiscoverPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<DiscoverFilters>({});
  const [sort, setSort] = useState<string>('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Generate brands and products once on component mount
  useEffect(() => {
    setMounted(true);

    try {
      // Create fallback data for stability with all required Brand properties
      const fallbackBrands: Brand[] = Array.from({ length: 8 }, (_, i) => ({
        id: `brand-${i+1}`,
        name: `Brand ${i+1}`,
        description: `Sustainable ethical brand with high-quality products.`,
        location: 'Portland, OR',
        rating: 4.5,
        isVerified: true,
        categories: ['Apparel'],
        primaryCategory: 'Apparel' as Brand['primaryCategory'], // Required property
        secondaryCategories: ['Sports'] as Brand['secondaryCategories'], // Required property
        values: ['sustainable', 'ethical'],
        coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        logo: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=200&q=80',
        productCount: 25,
        joinedDate: new Date().toISOString()
      }));

      // Try to generate data, fall back if needed
      let generatedBrands;
      try {
        generatedBrands = generateMockBrands() || fallbackBrands;
      } catch (e) {
        console.error('Error generating brands:', e);
        generatedBrands = fallbackBrands;
      }

      setBrands(getPersonalizedBrands(generatedBrands));
      
      // Generate initial product data with all required Product properties
      const fallbackProducts: Product[] = Array.from({ length: 24 }, (_, i) => ({
        id: `product-${i+1}`,
        title: `Product ${i+1}`,
        description: 'Premium sustainable product made with eco-friendly materials.',
        price: 49.99 + (i % 10) * 10,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        brand: `Brand ${(i % 8) + 1}`,
        category: 'Apparel',
        subCategory: 'Tops', // Required property
        attributes: { // Required property
          material: 'Organic Cotton',
          fit: 'Regular'
        },
        isNew: i < 4,
        rating: {
          avnuRating: { average: 4.5, count: 15 + i },
          shopifyRating: { average: 4.5, count: 30 }
        },
        vendor: {
          id: `brand-${(i % 8) + 1}`,
          name: `Brand ${(i % 8) + 1}`,
          isLocal: true,
          causes: ['sustainable', 'ethical'],
          shippingInfo: {
            isFree: true,
            minimumForFree: 75,
            baseRate: 7.99
          }
        },
        inStock: true,
        tags: ['sustainable', 'ethical'],
        createdAt: new Date().toISOString()
      }));
      
      // Try to generate products from brands, fall back if needed
      let allProducts: Product[] = [];
      
      try {
        generatedBrands.forEach(brand => {
          if (brand?.categories) {
            (Array.isArray(brand.categories) ? brand.categories : []).forEach(category => {
              if (brand && category) {
                const brandProducts = generateBrandProducts({ ...brand, values: brand.values ?? [] }, category);
                if (Array.isArray(brandProducts) && brandProducts.length > 0) {
                  allProducts = allProducts.concat(brandProducts);
                }
              }
            });
          }
        });
      } catch (e) {
        console.error('Error generating products:', e);
      }
      
      // Use fallback if we couldn't generate products
      if (allProducts.length === 0) {
        allProducts = fallbackProducts;
      }
      
      setProducts(getPersonalizedProducts(allProducts));
    } catch (e) {
      console.error('Discover page error:', e);
    }
  }, []);

  // Helper: available values for filters
  const availableBrands = Array.from(new Set(products.map(p => p.brand))).sort();
  const availableCategories = Array.from(new Set(products.map(p => p.category))).sort();
  // Flatten all attributes
  const availableAttributes: { [key: string]: string[] } = {};
  products.forEach(p => {
    if (p.attributes) {
      Object.entries(p.attributes).forEach(([k, v]) => {
        if (!Array.isArray(availableAttributes[k])) availableAttributes[k] = [];
        if (Array.isArray(v)) {
          v.forEach(val => {
            if (!availableAttributes[k].includes(val)) availableAttributes[k].push(val);
          });
        } else if (typeof v === 'string') {
          if (!availableAttributes[k].includes(v)) availableAttributes[k].push(v);
        }
      });
    }
  });

  // Filtering logic
  const filteredProducts = React.useMemo(() => products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && Array.isArray(filters.brand) && !filters.brand.includes(product.brand)) return false;
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    if (filters.rating && (!product.rating || !product.rating.shopifyRating || product.rating.shopifyRating.average < filters.rating)) return false;
    if (filters.shipping === 'free' && !(product.vendor && product.vendor.shippingInfo && product.vendor.shippingInfo.isFree)) return false;
    if (filters.shipping === 'local' && !(product.vendor && product.vendor.isLocal)) return false;
    if (filters.inStock && !product.inStock) return false;
    if (filters.dealsOnly && !(product.tags && product.tags.includes('deal'))) return false;
    if (Array.isArray(filters.sustainability) && filters.sustainability.length > 0 && !(product.tags && filters.sustainability.some(s => product.tags.includes(s)))) return false;
    if (filters.attributes && typeof filters.attributes === 'object') {
      for (const [attr, vals] of Object.entries(filters.attributes)) {
        if (!Array.isArray(vals) || vals.length === 0) continue;
        if (!product.attributes || !vals.some(v => product.attributes[attr] === v || (Array.isArray(product.attributes[attr]) && product.attributes[attr].includes(v)))) {
          return false;
        }
      }
    }
    return true;
  }), [products, filters]);

  return (
    <div className="min-h-screen bg-warm-white">
      <main className="container mx-auto px-0 py-10 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        {/* Sidebar: sticky on desktop, drawer on mobile */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 mb-8 lg:mb-0">
          <div className="hidden lg:block sticky top-24">
            <DiscoverFilterPanel
              filters={filters}
              onChange={change => setFilters(prev => ({ ...prev, ...change }))}
              availableBrands={availableBrands}
              availableCategories={availableCategories}
              availableAttributes={availableAttributes}
            />
          </div>
          {/* Mobile filter drawer button */}
          <div className="lg:hidden mb-4">
            <button
              className="px-4 py-2 bg-primary text-white rounded shadow"
              onClick={() => setShowMobileFilters(true)}
              aria-label="Show Filters"
            >
              Filters
            </button>
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
                <div className="w-80 bg-white h-full shadow-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Filters</span>
                    <button onClick={() => setShowMobileFilters(false)} aria-label="Close Filters">×</button>
                  </div>
                  <DiscoverFilterPanel
                    filters={filters}
                    onChange={change => setFilters(prev => ({ ...prev, ...change }))}
                    availableBrands={availableBrands}
                    availableCategories={availableCategories}
                    availableAttributes={availableAttributes}
                  />
                </div>
                <div className="flex-1" onClick={() => setShowMobileFilters(false)} />
              </div>
            )}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-3xl font-montserrat font-bold mb-6 text-charcoal">Discover For You</h1>

          {/* Personalized Brands */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Brands You Might Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {brands.slice(0, 10).map((brand, idx) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                  >
                    <BrandCard brand={brand} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Filtered Personalized Products */}
           <section>
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold mr-2">Products For You</h2>
                  <span className="text-sm text-gray-500">{filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm text-gray-700">Sort by:</label>
                  <select
                    id="sort"
                    className="text-sm px-2 py-1 border rounded"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <button
                    className="text-sm px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 ml-2"
                    onClick={() => setFilters({})}
                    disabled={Object.keys(filters).length === 0}
                    aria-label="Reset all filters"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              {/* Active filter pills */}
              <ActiveFilterPills
                filters={filters}
                onRemove={(key, value) => {
                  setFilters(prev => {
                    const updated: DiscoverFilters = { ...prev };
                    if (Array.isArray(updated[key])) {
                      const arr = (updated[key] as string[]).filter((v: string) => v !== value);
                      if (arr.length > 0) {
                        updated[key] = arr;
                      } else {
                        delete updated[key];
                      }
                    } else if (typeof updated[key] === 'object' && updated[key] !== null) {
                      const obj = { ...updated[key] } as Record<string, string[]>;
                      Object.keys(obj).forEach(attr => {
                        if (Array.isArray(obj[attr])) {
                          obj[attr] = obj[attr].filter((v: string) => value !== `${attr}: ${v}`);
                          if (obj[attr].length === 0) delete obj[attr];
                        }
                      });
                      if (Object.keys(obj).length > 0) {
                        updated[key] = obj;
                      } else {
                        delete updated[key];
                      }
                    } else {
                      delete updated[key];
                    }
                    return updated;
                  });
                }}
              />
            </div>
            {/* Infinite scroll logic */}
            {(() => {
              const [visibleCount, setVisibleCount] = React.useState(20);
              React.useEffect(() => {
                setVisibleCount(20); // Reset on filter change
              }, [JSON.stringify(filters), sort]);
              React.useEffect(() => {
                const handleScroll = () => {
                  if (
                    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                    visibleCount < filteredProducts.length
                  ) {
                    setVisibleCount(vc => Math.min(vc + 20, filteredProducts.length));
                  }
                };
                window.addEventListener('scroll', handleScroll);
                return () => window.removeEventListener('scroll', handleScroll);
              }, [visibleCount, filteredProducts.length]);
              const sortedProducts = React.useMemo(() => {
                if (sort === 'price-low') return [...filteredProducts].sort((a, b) => a.price - b.price);
                if (sort === 'price-high') return [...filteredProducts].sort((a, b) => b.price - a.price);
                if (sort === 'newest') return [...filteredProducts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                return filteredProducts;
              }, [filteredProducts, sort]);

              // Skeleton loader count
              const skeletonCount = Math.min(visibleCount, 20);

              if (!mounted) return <div className="text-center py-16 text-lg text-gray-400">Loading products...</div>;
              if (sortedProducts.length === 0) return <div className="text-center py-16 text-lg text-gray-400">No products match your filters.</div>;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-all duration-300">
                  <AnimatePresence>
                    {mounted
                      ? sortedProducts.slice(0, visibleCount).map((product, idx) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: idx * 0.03 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))
                      : Array.from({ length: skeletonCount }).map((_, idx) => (
                        <SkeletonProductCard key={idx} />
                      ))}
                  </AnimatePresence>
                  {visibleCount < sortedProducts.length && (
                    <div className="col-span-full flex justify-center py-8">
                      {mounted
                        ? <span className="text-gray-400">Loading more products...</span>
                        : Array.from({ length: 3 }).map((_, idx) => <SkeletonProductCard key={idx} />)}
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        </div>
      </main>
    </div>
  );
}
