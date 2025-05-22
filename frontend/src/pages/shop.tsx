import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/products";
import { SearchFilters, SearchResult } from "@/types/search";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import ProductCard from "@/components/products/ProductCard";
import { ConsistentProductCard } from "@/components/products";

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

export default function ShopPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult>({
    query: "",
    filters: {},
    totalResults: mockProducts.length,
    products: mockProducts,
    suggestedFilters: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setMounted(true);
    // Update with randomized data on client-side
    if (typeof window !== "undefined") {
      const randomizedProducts = generateMockProducts(Date.now());
      setSearchResults((prev) => ({
        ...prev,
        products: randomizedProducts,
      }));
    }
  }, []);

  // Generate search suggestions based on product titles and brands
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const suggestions = Array.from(
        new Set([
          // Get matching product titles
          ...mockProducts
            .map((p) => p.title)
            .filter(
              (title) =>
                title.toLowerCase().includes(query) &&
                title.toLowerCase() !== query,
            )
            .slice(0, 3),
          // Get matching brands
          ...mockProducts
            .map((p) => p.brand)
            .filter(
              (brand) =>
                brand.toLowerCase().includes(query) &&
                brand.toLowerCase() !== query,
            )
            .slice(0, 2),
        ]),
      ).slice(0, 4); // Limit to 4 total suggestions

      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  // Simulated search function
  const handleSearch = async (
    query: string,
    newFilters: SearchFilters = {},
  ) => {
    setLoading(true);
    // In a real implementation, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSearchResults({
      query,
      filters: newFilters,
      totalResults: mockProducts.length,
      products: mockProducts,
      suggestedFilters: [],
    });

    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev].slice(0, 5));
    }

    setLoading(false);
  };

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1000
      ) {
        if (!loading) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="sticky top-0 z-50 bg-warm-white/80 backdrop-blur-lg safe-top">
        <div className="container mx-auto px-4 py-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={recentSearches}
            suggestions={searchSuggestions}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 safe-left safe-right safe-bottom">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Panel */}
          <div className="w-full md:w-64 shrink-0">
            <FilterPanel
              filters={filters}
              onChange={(newFilters: SearchFilters) => {
                setFilters(newFilters);
                handleSearch(searchQuery, newFilters);
              }}
            />
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {/* Search Summary */}
            <div className="mb-6">
              <h1 className="text-2xl font-montserrat font-bold text-charcoal mb-2">
                {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
              </h1>
              <p className="text-neutral-gray">
                {searchResults.totalResults} products found
              </p>
            </div>

            {/* Product Grid - No animation wrappers to prevent layout shifts */}
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
              {searchResults.products.map((product, index) => (
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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
