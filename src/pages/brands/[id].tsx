import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Brand } from '@/types/brand';
import { Product } from '@/types/products';
import { SearchFilters } from '@/types/search';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import ProductCard from '@/components/products/ProductCard';
import { generateMockBrands, generateBrandProducts } from '@/utils/mockData';

// Get all mock brands
const mockBrands = generateMockBrands();

// Function to get brand by ID
const getBrandById = (id: string) => {
  const brand = mockBrands.find(b => b.id === id);
  if (!brand) return null;
  return brand as Brand & { values: string[]; logo: string };
};

export default function BrandPage() {
  const router = useRouter();
  const { id } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Get brand data
  const brand = id ? getBrandById(id as string) : null;

  // Update products when brand changes
  useEffect(() => {
    if (brand) {
      const products = generateBrandProducts(brand, brand.categories[0]);
      setFilteredProducts(products);
    }
  }, [brand]);

  if (!brand) {
    return <div className="container mx-auto px-4 py-8">Brand not found</div>;
  }

  // Handle search and filtering
  const handleSearch = (query: string, newFilters: SearchFilters = {}) => {
    const filtered = filteredProducts.filter(product => {
      const matchesQuery = !query || 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.subCategory.toLowerCase().includes(query.toLowerCase());

      return matchesQuery;
    });

    setFilteredProducts(filtered);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <Image
          src={brand.coverImage}
          alt={brand.name}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-6">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{brand.name}</h1>
                <p className="text-xl opacity-90">{brand.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Highlights */}
      <div className="bg-sage/5 border-y border-sage/10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Causes */}
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-sage mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-charcoal">Causes Supported</h3>
                <p className="text-neutral-gray">
                  {brand.values.map((value: string) => value.split('-').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')).join(', ')}
                </p>
              </div>
            </div>
            
            {/* Shipping */}
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-sage mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <div className="w-full">
                <h3 className="font-semibold text-charcoal">Free Shipping Progress</h3>
                <p className="text-neutral-gray mb-2">On orders over $75</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-sage h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((cartTotal / 75) * 100, 100)}%` 
                    }}
                  />
                </div>
                {cartTotal < 75 ? (
                  <p className="text-xs text-neutral-gray mt-1">
                    Add ${(75 - cartTotal).toFixed(2)} more to get free shipping
                  </p>
                ) : (
                  <p className="text-xs text-sage mt-1">You&apos;ve qualified for free shipping! 🎉</p>
                )}
              </div>
              {/* Temporary buttons for testing cart total */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setCartTotal(prev => Math.max(0, prev - 25))}
                  className="text-xs bg-sage/10 text-sage px-2 py-1 rounded"
                >
                  -$25
                </button>
                <button
                  onClick={() => setCartTotal(prev => prev + 25)}
                  className="text-xs bg-sage/10 text-sage px-2 py-1 rounded"
                >
                  +$25
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-sage mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-charcoal">Location</h3>
                <p className="text-neutral-gray">{brand.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Panel */}
          <div className="w-full md:w-64 shrink-0">
            <FilterPanel 
              filters={filters} 
              onChange={(newFilters: SearchFilters) => handleSearch(searchQuery, newFilters)} 
              category={brand.primaryCategory}
              secondaryCategories={brand.secondaryCategories}
            />
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-6">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                recentSearches={[]}
                suggestions={[]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
