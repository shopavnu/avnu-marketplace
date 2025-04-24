import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/20/solid'; // Keep solid for filled star
import { MapPinIcon, TagIcon } from '@heroicons/react/24/outline'; // Import outline icons
import { brands as allBrands } from '@/data/brands';
import { products as allProducts } from '@/data/products'; // Import product data
import ProductCard from '@/components/products/ProductCard'; // Import ProductCard component
import { Brand } from '@/types/brand'; // Import from central types
import { Product } from '@/types/products'; // Import Product type

// --- Placeholder Components (Replace with actual implementations later) ---

interface FreeShippingProgressBarProps {
  brandName: string;
  // TODO: Add props for current cart total for this brand & free shipping threshold
}

const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({ brandName }) => {
  // Dummy values - replace with actual logic
  const currentAmount = 15.50;
  const threshold = 50.00;
  const progress = Math.min((currentAmount / threshold) * 100, 100);
  const amountNeeded = Math.max(0, threshold - currentAmount);

  return (
    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg mb-6 shadow border border-teal-100">
      <p className="text-sm text-gray-700 font-medium mb-1">
        {amountNeeded > 0
          ? <>Spend <span className="font-semibold text-teal-700">${amountNeeded.toFixed(2)}</span> more for FREE shipping from {brandName}!</>
          : <span className="font-semibold text-green-600">You&apos;ve earned free shipping from {brandName}! 🎉</span>
        }
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
        <div 
          className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 text-right mt-1">${currentAmount.toFixed(2)} / ${threshold.toFixed(2)}</p>
    </div>
  );
};

interface BrandProductSearchProps {
  brandName: string;
  // TODO: Add props for handling search results / state management
}

const BrandProductSearch: React.FC<BrandProductSearchProps> = ({ brandName }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // --- COMPLEXITY WARNING --- 
    // Implementing this search requires:
    // 1. Fetching products specifically for this brand (potentially API call or filtering existing data).
    // 2. Filtering products based on searchTerm.
    // 3. Displaying results (likely updating state in this component or parent).
    // 4. Handling loading/error/no results states.
    // Consider if a simple text filter on already displayed products is sufficient,
    // or if a more robust backend search is needed.
    console.log(`Search requested for '${searchTerm}' within ${brandName} products... (Full implementation pending)`);
    // Example: alert(`Search for '${searchTerm}' - Implementation needed!`); 
  };

  return (
    <div className="mb-8">
      {/* Redesigned Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {/* Search Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${brandName} products...`}
          className="block w-full rounded-md border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 transition-colors duration-150"
          aria-label={`Search products from ${brandName}`}
        />
        {/* Optional: Add a clear button inside the input */}
      </form>
    </div>
  );
};

// --- Main Page Component ---

const BrandDetailPage: React.FC = () => {
  const router = useRouter();
  const { brandId } = router.query; // Get brandId from URL query params
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (brandId) {
      const foundBrand = allBrands.find(b => b.id === brandId);
      setBrand(foundBrand || null);

      if (foundBrand) {
        // Filter products for the current brand
        const filteredProducts = allProducts.filter(p => p.brand === foundBrand.name);
        setBrandProducts(filteredProducts);
      } else {
        setBrandProducts([]); // Reset if brand not found
      }
    }
  }, [brandId]);

  // Loading State
  if (!brand) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading brand details...</p></div>;
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
            src={brand.coverImage || '/placeholder-hero.jpg'}
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
            <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">{brand.name}</h1>
            {brand.rating && (
              <div className="flex items-center gap-2 text-white/90">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">{brand.rating.average.toFixed(1)}</span>
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
              <MapPinIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{brand.location}</span>
            </motion.div>

            {/* Values */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-2"
            >
              <TagIcon className="w-5 h-5 text-gray-500" />
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

      {/* Free Shipping Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 py-4"
      >
        <div className="max-w-2xl mx-auto">
          <FreeShippingProgressBar brandName={brand.name} />
        </div>
      </motion.div>

      {/* Description Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative bg-gradient-to-b from-white via-gray-50 to-white py-8 md:py-12 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            {/* Quote marks and content */}
            <div className="relative">
              {/* Top quote mark */}
              <svg className="absolute -top-6 -left-4 h-12 w-12 text-gray-200 transform -rotate-12" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>

              {/* Description Text */}
              <div className="relative z-10 text-center px-4 md:px-8">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light italic"
                >
                  {brand.description}
                </motion.p>
              </div>

              {/* Bottom quote mark */}
              <svg className="absolute -bottom-6 -right-4 h-12 w-12 text-gray-200 transform rotate-12" fill="currentColor" viewBox="0 0 32 32">
                <path d="M22.648 28C27.544 24.544 31 18.88 31 12.64c0-5.088-3.072-8.064-6.624-8.064-3.36 0-5.856 2.688-5.856 5.856 0 3.168 2.208 5.472 5.088 5.472.576 0 1.344-.096 1.536-.192-.48 3.264-3.552 7.104-6.624 9.024L22.648 28zm-16.512 0c4.8-3.456 8.256-9.12 8.256-15.36 0-5.088-3.072-8.064-6.624-8.064-3.264 0-5.856 2.688-5.856 5.856 0 3.168 2.304 5.472 5.184 5.472.576 0 1.248-.096 1.44-.192-.48 3.264-3.456 7.104-6.528 9.024L6.136 28z" />
              </svg>
            </div>

            {/* Brand Stats or Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
            >
              {/* Example stats - you can customize these based on your brand data */}
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900">{brand.rating?.count || 0}</div>
                <div className="text-sm text-gray-500">Happy Customers</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900">{brandProducts.length}</div>
                <div className="text-sm text-gray-500">Products</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900">{brand.rating?.average.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900">{brand.values.length}</div>
                <div className="text-sm text-gray-500">Core Values</div>
              </div>
            </motion.div>
          </motion.div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-3">Search {brand.name} Products</h3>
                <BrandProductSearch brandName={brand.name} />
              </div>
            </div>
          </motion.div>

          {/* Product Grid - Pinterest Style */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex-1"
          >
            {brandProducts.length > 0 ? (
              <motion.div 
                className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4 [column-fill:_balance] mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 1.1,
                  staggerChildren: 0.1
                }}
              >
                {brandProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="break-inside-avoid mb-3 md:mb-4 transform hover:scale-[1.02] transition-transform duration-200"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-500 py-12"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mt-3 font-medium">No Products Found</p>
                <p className="text-sm mt-1">We couldn&apos;t find any products for {brand.name} at the moment.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BrandDetailPage;
