import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { brands as allBrands } from '@/data/brands';
import { products as allProducts } from '@/data/products';
import { ConsistentProductCard } from '@/components/products';
import { Brand } from '@/types/brand';
import { Product } from '@/types/products';
import useProgressiveLoading from '@/hooks/useProgressiveLoading';
import PriorityContentLoader from '@/components/common/PriorityContentLoader';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import AccessibleLayout from '@/components/layout/AccessibleLayout';
import SectionLandmark from '@/components/accessibility/SectionLandmark';

/**
 * Accessible brand detail page with enhanced vertical navigation
 */
const AccessibleBrandDetailPage: React.FC = () => {
  const router = useRouter();
  const { brandId } = router.query;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [allBrandProducts, setAllBrandProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Load brand data
  useEffect(() => {
    if (brandId) {
      const foundBrand = allBrands.find(b => b.id === brandId);
      setBrand(foundBrand || null);

      if (foundBrand) {
        // Filter products for the current brand
        const filteredProducts = allProducts.filter(p => p.brand === foundBrand.name);
        setAllBrandProducts(filteredProducts);
      } else {
        setAllBrandProducts([]);
      }
    }
  }, [brandId]);
  
  // Set mounted state on client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch products progressively
  const fetchBrandProducts = async (page: number, pageSize: number) => {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return paginated results
    const startIndex = (page - 1) * pageSize;
    return allBrandProducts.slice(startIndex, startIndex + pageSize);
  };
  
  // Use progressive loading hook
  const {
    data: brandProducts,
    isLoading,
    hasMore,
    loadMore,
    loadMoreRef,
    isInitialLoading
  } = useProgressiveLoading<Product>({
    loadMoreFn: fetchBrandProducts,
    pageSize: 8,
    enabled: mounted && !!brand,
    maxItems: 100
  });
  
  // Define sections for navigation and skip links
  const sections = brand ? [
    { id: 'brand-hero', title: 'Brand Hero' },
    { id: 'brand-info', title: 'Brand Information' },
    { id: 'brand-products', title: 'Products' }
  ] : [];
  
  // Define skip links
  const skipLinks = [
    { targetId: 'main-content', text: 'Skip to main content' },
    { targetId: 'brand-info', text: 'Skip to brand information' },
    { targetId: 'brand-products', text: 'Skip to products' }
  ];
  
  // Loading State
  if (!brand) {
    return (
      <AccessibleLayout
        title="Brand"
        description="Loading brand details"
        sections={[]}
        skipLinks={[]}
        showSectionNavigation={false}
      >
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
            </div>
          </div>
        </div>
      </AccessibleLayout>
    );
  }
  
  return (
    <AccessibleLayout
      title={brand.name}
      description={`Shop ${brand.name} products on Avnu Marketplace`}
      sections={sections}
      skipLinks={skipLinks}
    >
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <SectionLandmark
          id="brand-hero"
          title={brand.name}
          subtitle={brand.description || ''}
          className="relative"
        >
          <div className="relative h-[50vh] min-h-[350px] w-full overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={brand.coverImage || '/placeholder-hero.jpg'}
                alt={`${brand.name} hero image`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
              <div className="container mx-auto max-w-6xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">{brand.name}</h1>
                {brand.rating && (
                  <div className="flex items-center gap-2 text-white/90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">{brand.rating.average.toFixed(1)}</span>
                    <span className="text-sm">({brand.rating.count} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionLandmark>

        {/* Brand Information */}
        <SectionLandmark
          id="brand-info"
          title="About the Brand"
          subtitle={brand.description || ''}
          className="py-8 bg-white"
        >
          <div className="container mx-auto px-4">
            {/* Brand Attributes */}
            <div className="flex flex-wrap gap-4 mb-6">
              {brand.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{brand.location}</span>
                </div>
              )}
              
              {brand.founded && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Founded {brand.founded}</span>
                </div>
              )}
              
              {brand.rating && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{brand.rating.average.toFixed(1)} ({brand.rating.count} reviews)</span>
                </div>
              )}
            </div>
            
            {/* Brand Causes/Values */}
            {brand.causes && brand.causes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {brand.causes.map(cause => (
                  <span 
                    key={cause} 
                    className="px-3 py-1 bg-sage/10 text-sage text-sm font-medium rounded-full"
                  >
                    {cause}
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionLandmark>
        
        {/* Brand Products */}
        <SectionLandmark
          id="brand-products"
          title={`${brand.name} Products`}
          subtitle={`Explore our collection of ${brand.name} products`}
          className="py-8 bg-white"
        >
          <div className="container mx-auto px-4">
            {isInitialLoading ? (
              <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
            ) : (
              <PriorityContentLoader
                priorityContent={
                  <>
                    {brandProducts.length > 0 ? (
                      <div 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        style={{ 
                          display: 'grid',
                          gridTemplateRows: 'repeat(auto-fill, 360px)',
                          contain: 'layout',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        {brandProducts.slice(0, 8).map((product, index) => (
                          <div
                            key={product.id}
                            style={{ 
                              height: '360px',
                              width: '100%',
                              contain: 'strict',
                              position: 'relative'
                            }}
                          >
                            <a 
                              href={`/product/${product.id}`}
                              className="block h-full w-full"
                              aria-label={`View ${product.title} details`}
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
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="mt-3 font-medium">No Products Found</p>
                        <p className="text-sm mt-1">We couldn&apos;t find any products for {brand.name} at the moment.</p>
                      </div>
                    )}
                  </>
                }
                deferredContent={
                  <>
                    {/* Remaining products */}
                    {brandProducts.length > 8 && (
                      <div 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12"
                        style={{ 
                          display: 'grid',
                          gridTemplateRows: 'repeat(auto-fill, 360px)',
                          contain: 'layout',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        {brandProducts.slice(8).map((product, index) => (
                          <div
                            key={product.id}
                            style={{ 
                              height: '360px',
                              width: '100%',
                              contain: 'strict',
                              position: 'relative'
                            }}
                          >
                            <a 
                              href={`/product/${product.id}`}
                              className="block h-full w-full"
                              aria-label={`View ${product.title} details`}
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
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Loading State */}
                    {isLoading && (
                      <div className="mt-8">
                        <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
                      </div>
                    )}
                    
                    {/* Load More Button */}
                    {hasMore && !isLoading && (
                      <div 
                        ref={loadMoreRef}
                        className="w-full py-8 flex justify-center"
                      >
                        <button
                          onClick={() => loadMore()}
                          className="px-6 py-2 bg-sage text-white rounded-md hover:bg-sage/90 transition-colors"
                          aria-label={`Load more ${brand.name} products`}
                        >
                          Load more products
                        </button>
                      </div>
                    )}
                  </>
                }
                placeholder={<ProductGridSkeleton count={8} columns={4} gap="1.5rem" />}
                threshold={400}
              />
            )}
          </div>
        </SectionLandmark>
      </div>
    </AccessibleLayout>
  );
};

export default AccessibleBrandDetailPage;
