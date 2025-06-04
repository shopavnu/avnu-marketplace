import React, { useState, useEffect } from "react";
import { Product } from "@/types/products";
import { SearchFilters, SearchResult } from "@/types/search";
import { categories } from "@/data/categories";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import { ConsistentProductCard } from "@/components/products";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import useProgressiveLoading from "@/hooks/useProgressiveLoading";
import PriorityContentLoader from "@/components/common/PriorityContentLoader";
import CategoryPills from "@/components/common/CategoryPills";
import AccessibleLayout from "@/components/layout/AccessibleLayout";
import SectionLandmark from "@/components/accessibility/SectionLandmark";

// Product image URLs from Unsplash - exactly 20 verified images
const productImages = [
  "photo-1523275335684-37898b6baf30", // 1. Watch
  "photo-1505740420928-5e560c06d30e", // 2. Headphones
  "photo-1542291026-7eec264c27ff", // 3. Red shoe
  "photo-1600185365926-3a2ce3cdb9eb", // 4. Backpack
  "photo-1546938576-6e6a64f317cc", // 5. Shoes
  "photo-1585386959984-a4155224a1ad", // 6. Camera
  "photo-1592921870789-04563d55041c", // 7. Watch 2
  "photo-1625772452859-1c03d5bf1137", // 8. Headphones 2
  "photo-1611312449408-fcece27cdbb7", // 9. Shirt
  "photo-1607522370275-f14206abe5d3", // 10. Sneakers
  "photo-1553062407-98eeb64c6a62", // 11. Backpack 2
  "photo-1608667508764-33cf0726b13a", // 12. Sunglasses
  "photo-1560343090-f0409e92791a", // 13. Shoes 2
  "photo-1595950653106-6c9ebd614d3a", // 14. Handbag
  "photo-1491553895911-0055eca6402d", // 15. Sneakers 2
  "photo-1556906781-9a412961c28c", // 16. Backpack 3
  "photo-1542219550-37153d387c27", // 17. Glasses 2
  "photo-1576566588028-4147f3842f27", // 18. Headphones 3
  "photo-1594938298603-c8148c4dae35", // 19. Camera 2
  "photo-1434056886845-dac89ffe9b56", // 20. Watch 3
];

// Helper function to generate mock products
const generateMockProducts = (seed = 1) =>
  Array.from({ length: 20 }, (_, i) => {
    // Use deterministic values for server-side rendering
    const productIndex = i + 1;
    const vendorIndex = Math.floor(i / 5) + 1;
    const brandIndex = Math.floor(i / 3) + 1;

    return {
      id: `product-${productIndex}`,
      title: `Product ${productIndex}`,
      description:
        "A wonderful product description that showcases the unique features and benefits.",
      price: 20 + productIndex * 10, // Deterministic price
      image: `https://images.unsplash.com/${productImages[i]}?auto=format&fit=crop&w=800&q=80`,
      images: [
        `https://images.unsplash.com/${productImages[i]}?auto=format&fit=crop&w=800&q=80`,
      ],
      brand: `Brand ${brandIndex}`,
      category: "Apparel", // Fixed category for SSR
      subCategory: "Mens",
      slug: `product-${productIndex}`, // Add required slug property
      categories: ["Apparel", "Mens"], // Add required categories property
      attributes: {
        size: "M",
        color: "Blue",
        material: "Cotton", // Add required material property
        weight: "0.5kg", // Add required weight property
        dimensions: "10x20x5cm", // Add optional dimensions property
      },
      isNew: false, // Fixed for SSR
      rating: {
        shopifyRating: {
          average: 4.5,
          count: 50,
        },
        avnuRating: {
          average: 4.5,
          count: 25,
        },
      },
      vendor: {
        id: `vendor-${vendorIndex}`,
        name: `Vendor ${vendorIndex}`,
        causes: ["sustainable", "eco-friendly"], // Using correct cause IDs
        isLocal: false, // Fixed for SSR
        shippingInfo: {
          isFree: true,
          minimumForFree: 50,
          baseRate: 5.99,
        },
      },
      inStock: true, // Fixed for SSR
      tags: ["trending"], // Fixed for SSR
      createdAt: new Date(2025, 0, 1).toISOString(), // Fixed date for SSR
    };
  });

// Initial products with deterministic values for SSR
const mockProducts: Product[] = generateMockProducts();

/**
 * Accessible shop page with enhanced vertical navigation
 */
export default function AccessibleShopPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  // Define a custom interface for local search results
  interface ShopSearchResults {
    query: string;
    filters: Record<string, any>;
    totalResults: number;
    products: Product[];
    suggestedFilters: string[];
  }
  
  const [searchResults, setSearchResults] = useState<ShopSearchResults>({
    query: "",
    filters: {},
    totalResults: mockProducts.length,
    products: [],
    suggestedFilters: [],
  });

  // Set mounted state on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate loading products progressively
  const fetchProducts = async (page: number, pageSize: number) => {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Apply filters and search query
    let filteredProducts = [...mockProducts];

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply category filter if selected
    if (selectedCategoryId) {
      filteredProducts = filteredProducts.filter((product) =>
        product.categories.includes(selectedCategoryId),
      );
    }

    // Apply other filters if any
    if (filters.brand && filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        filters.brand!.includes(product.brand),
      );
    }

    if (filters.price?.min !== undefined || filters.price?.max !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const price = product.price;
        const min = filters.price?.min ?? 0;
        const max = filters.price?.max ?? Infinity;
        return price >= min && price <= max;
      });
    }

    // Update total results
    setSearchResults((prev) => ({
      ...prev,
      totalResults: filteredProducts.length,
    }));

    // Return paginated results
    const startIndex = (page - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  };

  // Use progressive loading hook
  const {
    data: products,
    isLoading,
    hasMore,
    loadMore,
    loadMoreRef,
    isInitialLoading,
  } = useProgressiveLoading<Product>({
    loadMoreFn: fetchProducts,
    pageSize: 12,
    enabled: mounted,
    maxItems: 100,
  });

  // Update search results when products change
  useEffect(() => {
    setSearchResults((prev) => ({
      ...prev,
      products,
    }));
  }, [products]);

  // Simulated search function
  const handleSearch = (query: string, newFilters: SearchFilters = {}) => {
    setSearchQuery(query);
    setFilters(newFilters);

    // Reset progressive loading to start fresh with new search/filters
    setSearchResults((prev) => ({
      ...prev,
      query,
      filters: newFilters,
      products: [],
    }));

    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev].slice(0, 5));
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  // Define sections for navigation and skip links
  const sections = [
    { id: "search", title: "Search" },
    { id: "categories", title: "Categories" },
    { id: "products", title: "Products" },
  ];

  // Define skip links
  const skipLinks = [
    { targetId: "main-content", text: "Skip to main content" },
    { targetId: "search", text: "Skip to search" },
    { targetId: "categories", text: "Skip to categories" },
    { targetId: "products", text: "Skip to products" },
    { targetId: "filters", text: "Skip to filters" },
  ];

  return (
    <AccessibleLayout
      title="Shop"
      description="Shop for sustainable and ethical products"
      sections={sections}
      skipLinks={skipLinks}
    >
      <div className="min-h-screen bg-warm-white">
        {/* Search Bar */}
        <div className="sticky top-0 z-50 bg-warm-white/80 backdrop-blur-lg safe-top">
          <SectionLandmark
            id="search"
            title="Search Products"
            className="container mx-auto px-4 py-4"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              recentSearches={recentSearches}
              suggestions={searchSuggestions}
            />
          </SectionLandmark>
        </div>

        <div className="container mx-auto px-4 safe-left safe-right safe-bottom">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Panel */}
            <SectionLandmark
              id="filters"
              title="Filters"
              className="w-full md:w-64 shrink-0"
            >
              <FilterPanel
                filters={filters}
                onChange={(newFilters: SearchFilters) => {
                  setFilters(newFilters);
                  handleSearch(searchQuery, newFilters);
                }}
              />
            </SectionLandmark>

            {/* Search Results with Progressive Loading */}
            <div className="flex-1">
              {/* Category Pills */}
              <SectionLandmark
                id="categories"
                title="Categories"
                className="mb-8"
              >
                <CategoryPills
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={handleCategorySelect}
                />
              </SectionLandmark>

              {/* Products Grid */}
              <SectionLandmark
                id="products"
                title={
                  searchQuery
                    ? `Results for "${searchQuery}"`
                    : selectedCategoryId
                      ? `${categories.find((c) => c.id === selectedCategoryId)?.name || "Category"}`
                      : "All Products"
                }
                subtitle={`${searchResults.totalResults} products found`}
                className="flex-1"
              >
                {isInitialLoading ? (
                  <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
                ) : (
                  <PriorityContentLoader
                    priorityContent={
                      <div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
                        style={{
                          display: "grid",
                          gridTemplateRows: "repeat(auto-fill, 360px)",
                          contain: "layout",
                          position: "relative",
                          zIndex: 1,
                        }}
                        data-testid="product-grid"
                      >
                        {products.slice(0, 8).map((product, index) => (
                          <div
                            key={product.id}
                            style={{
                              height: "360px",
                              width: "100%",
                              contain: "strict",
                              position: "relative",
                            }}
                            data-testid="product-cell"
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
                    }
                    deferredContent={
                      <>
                        {/* Remaining products */}
                        {products.length > 8 && (
                          <div
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12"
                            style={{
                              display: "grid",
                              gridTemplateRows: "repeat(auto-fill, 360px)",
                              contain: "layout",
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            {products.slice(8).map((product, index) => (
                              <div
                                key={product.id}
                                style={{
                                  height: "360px",
                                  width: "100%",
                                  contain: "strict",
                                  position: "relative",
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
                            <ProductGridSkeleton
                              count={8}
                              columns={4}
                              gap="1.5rem"
                            />
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
                              aria-label="Load more products"
                            >
                              Load more products
                            </button>
                          </div>
                        )}
                      </>
                    }
                    placeholder={
                      <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
                    }
                    threshold={400}
                  />
                )}
              </SectionLandmark>
            </div>
          </div>
        </div>
      </div>
    </AccessibleLayout>
  );
}
