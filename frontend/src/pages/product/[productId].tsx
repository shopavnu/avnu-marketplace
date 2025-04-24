import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, HeartIcon, ShoppingCartIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Product } from '@/types/products';
import ProductCard from '@/components/products/ProductCard';
import { causes } from '@/components/search/FilterPanel';
import { brands as allBrands } from '@/data/brands';
import { analyticsService } from '@/services/analytics.service';
import useDwellTimeTracking from '@/hooks/useDwellTimeTracking';

/**
 * Helper function to get brand ID from name
 * This is a shared utility function used across multiple components
 */
const getBrandIdFromName = (brandName: string): string => {
  // First, try to find a real brand with this name
  const brand = allBrands.find(b => b.name === brandName);
  if (brand) return brand.id;
  
  // For mock brand names like "Brand 1", use the first real brand ID
  if (brandName.startsWith('Brand ') && allBrands.length > 0) {
    // Use a consistent brand ID based on the brand number
    const brandNumber = parseInt(brandName.replace('Brand ', '')) || 1;
    const index = (brandNumber - 1) % allBrands.length;
    return allBrands[index].id;
  }
  
  // Fallback to a URL-friendly version of the name
  return brandName.toLowerCase().replace(/\s+/g, '-');
};

interface FreeShippingProgressBarProps {
  brandName: string;
  currentAmount?: number;
  threshold?: number;
}

const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({ brandName, currentAmount = 15.50, threshold = 50.00 }) => {
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

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  brandProducts: Product[];
}

// Helper function to generate mock products
const generateMockProductsForSSG = () => {
  // This is a simplified version of the function in the shop page
  return Array.from({ length: 20 }, (_, i) => {
    const productIndex = i + 1;
    const vendorIndex = Math.floor(i / 5) + 1;
    const brandIndex = Math.floor(i / 3) + 1;

    return {
      id: `product-${productIndex}`,
      title: `Product ${productIndex}`,
      description: 'A wonderful product description that showcases the unique features and benefits. This product is carefully crafted with attention to detail and quality materials. Perfect for everyday use or special occasions, it combines style, functionality, and durability.',
      price: 20 + (productIndex * 10),
      image: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80`,
      images: [
        `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80`,
        `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80`,
        `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80`,
        `https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80`,
      ],
      brand: `Brand ${brandIndex}`,
      category: 'Apparel',
      subCategory: 'Mens',
      attributes: { 
        size: 'M', 
        color: 'Blue',
        material: 'Cotton',
        weight: '0.5kg'
      },
      isNew: productIndex % 5 === 0,
      rating: {
        shopifyRating: {
          average: 4.5,
          count: 50
        },
        wooCommerceRating: {
          average: 4.2,
          count: 30
        },
        avnuRating: {
          average: 4.7,
          count: 25
        }
      },
      vendor: {
        id: `vendor-${vendorIndex}`,
        name: `Vendor ${vendorIndex}`,
        causes: ['sustainable', 'eco-friendly'],
        isLocal: vendorIndex % 3 === 0,
        shippingInfo: {
          isFree: vendorIndex % 2 === 0,
          minimumForFree: 50,
          baseRate: 5.99
        }
      },
      inStock: productIndex % 7 !== 0,
      tags: ['trending', 'featured'],
      createdAt: new Date(2025, 0, 1).toISOString()
    };
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Use both the mock products and the actual products from data file
  const mockProducts = generateMockProductsForSSG();
  const { products: dataProducts } = await import('@/data/products');
  
  // Combine all product IDs to ensure we generate paths for all possible products
  const allProducts = [...mockProducts, ...dataProducts];
  
  // Create unique paths based on product IDs
  const paths = Array.from(new Set(allProducts.map(p => p.id))).map(id => ({
    params: { productId: id },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    // Get products from both sources
    const mockProducts = generateMockProductsForSSG();
    const { products: dataProducts } = await import('@/data/products');
    
    // Combine all products to search from
    const allProducts = [...mockProducts, ...dataProducts];
    
    // Find the requested product
    const product = allProducts.find((p) => p.id === params?.productId);
    
    if (!product) {
      return {
        notFound: true,
      };
    }

    // Get related products (same category)
    const relatedProducts = allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    // Get more from this brand
    const brandProducts = allProducts
      .filter((p) => p.brand === product.brand && p.id !== product.id)
      .slice(0, 4);

    return {
      props: {
        product,
        relatedProducts,
        brandProducts,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        product: null,
        relatedProducts: [],
        brandProducts: [],
      },
      revalidate: 10, // Try again sooner if there was an error
    };
  }
};

export default function ProductPage({ product, relatedProducts, brandProducts }: ProductPageProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // Track dwell time for this product
  const searchQuery = router.query.q as string || '';
  const position = parseInt(router.query.pos as string) || undefined;
  
  // Track product view when the page loads
  useEffect(() => {
    if (product) {
      // Get the referrer from the router query or document.referrer
      const referrer = router.query.ref as string || 
                      (typeof document !== 'undefined' ? document.referrer : '');
      
      analyticsService.trackProductView(product, referrer);
    }
  }, [product, router.query]);
  
  // Use the dwell time tracking hook
  useDwellTimeTracking({
    resultId: product?.id || '',
    query: searchQuery,
    position: position
  });
  
  // Handle case where product is null (from error handling)
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold text-charcoal mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn&apos;t find the product you&apos;re looking for.</p>
          <Link href="/shop" className="inline-block px-6 py-3 bg-sage text-white rounded-full hover:bg-sage/90 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Calculate combined rating
  const combinedRating = {
    average: product.rating.avnuRating.average,
    count: product.rating.avnuRating.count +
      (product.rating.shopifyRating?.count || 0) +
      (product.rating.wooCommerceRating?.count || 0)
  };

  // Handle attribute selection
  const handleAttributeSelect = (key: string, value: string) => {
    setSelectedAttributes({
      ...selectedAttributes,
      [key]: value,
    });
    
    // Track attribute selection
    analyticsService.trackProductAttributeSelect(product.id, key, value);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    console.log('Adding to cart:', {
      product,
      quantity,
      selectedAttributes,
    });
    
    // Track add to cart event
    analyticsService.trackAddToCart(
      product,
      quantity,
      selectedAttributes
    );
    
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  // If the page is still loading
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.title} | av | nu</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <meta property="og:title" content={`${product.title} | av | nu`} />
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:image" content={product.image} />
      </Head>

      <main className="min-h-screen bg-warm-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-neutral-gray">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-sage transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span>/</span>
              </li>
              <li>
                <Link href="/shop" className="hover:text-sage transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <span>/</span>
              </li>
              <li>
                <Link 
                  href={`/shop?category=${encodeURIComponent(product.category)}`} 
                  className="hover:text-sage transition-colors"
                >
                  {product.category}
                </Link>
              </li>
              <li>
                <span>/</span>
              </li>
              <li className="text-charcoal font-medium truncate max-w-[200px]">
                {product.title}
              </li>
            </ol>
          </nav>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={product.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* New Badge */}
                {product.isNew && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-sage text-white text-sm font-medium rounded-full">
                    New
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm
                           text-charcoal hover:text-sage transition-colors duration-200 shadow-sm"
                  aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorited ? (
                    <HeartIconSolid className="w-6 h-6 text-sage" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 snap-start
                              ${index === currentImageIndex ? 'ring-2 ring-sage' : 'ring-1 ring-gray-200'}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand & Title */}
              <div>
                <Link 
                  href={`/brand/${getBrandIdFromName(product.brand)}`}
                  className="text-sage hover:underline text-sm font-medium"
                >
                  {product.brand}
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">
                  {product.title}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    i < Math.floor(combinedRating.average) ? (
                      <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    )
                  ))}
                </div>
                <span className="text-sm text-neutral-gray">
                  {combinedRating.average.toFixed(1)} ({combinedRating.count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-charcoal">
                  ${product.price.toFixed(2)}
                </span>
                {product.isNew && (
                  <span className="text-sm text-sage font-medium">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Attributes */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-charcoal mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {key === 'color' ? (
                        // Color attribute with color swatch
                        <>
                          <div 
                            className="w-5 h-5 rounded-full ring-1 ring-gray-200 flex-shrink-0"
                            style={{ backgroundColor: value?.toLowerCase() || '#ffffff' }}
                          />
                          <div>
                            <span className="text-xs text-gray-500 block">Color</span>
                            <span className="text-sm text-charcoal">{value || ''}</span>
                          </div>
                        </>
                      ) : (
                        // Other attributes with icons
                        <>
                          <div className="w-5 h-5 flex items-center justify-center text-sage flex-shrink-0">
                            {key === 'size' && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 10h14v1H3v-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {key === 'material' && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5V7A2.5 2.5 0 0011 4.5H8.128a2.252 2.252 0 011.884-1.488A2.25 2.25 0 0112.25 1h1.5a2.25 2.25 0 012.238 2.012zM11.5 3.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.25h-3v-.25z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M2 7a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7zm2 3.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                              </svg>
                            )}
                            {key === 'weight' && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254h-1.5a31.74 31.74 0 00-3.339.254l1.77 7.85a.75.75 0 01-.387.83A4.981 4.981 0 015 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.702-7.545a31.293 31.293 0 00-1.103.232.75.75 0 01-.336-1.461 33.212 33.212 0 016.668-.83V2.75A.75.75 0 0110 2zM5 7.543L3.92 12.33a3.499 3.499 0 002.16 0L5 7.543zm10 0l-1.08 4.787a3.498 3.498 0 002.16 0L15 7.543z" clipRule="evenodd" />
                              </svg>
                            )}
                            {!['size', 'material', 'weight', 'color'].includes(key) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block capitalize">{key}</span>
                            <span className="text-sm text-charcoal">{value}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Color Selection */}
                {product.attributes.color && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-charcoal mb-2">Select Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Blue', 'Black', 'Green', 'Red'].map((colorOption) => (
                        <button
                          key={colorOption}
                          className={`w-8 h-8 rounded-full ${selectedAttributes['color'] === colorOption ? 'ring-2 ring-offset-2 ring-sage' : 'ring-1 ring-gray-200'}`}
                          style={{ backgroundColor: colorOption.toLowerCase() }}
                          onClick={() => handleAttributeSelect('color', colorOption)}
                          aria-label={`Select color: ${colorOption}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Size Selection */}
                {product.attributes.size && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-charcoal mb-2">Select Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {['S', 'M', 'L', 'XL'].map((sizeOption) => (
                        <button
                          key={sizeOption}
                          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm ${selectedAttributes['size'] === sizeOption ? 'bg-sage text-white' : 'bg-gray-100 text-charcoal hover:bg-gray-200'} transition-colors`}
                          onClick={() => handleAttributeSelect('size', sizeOption)}
                        >
                          {sizeOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-charcoal mb-2">
                  Quantity
                </h3>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 text-charcoal hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center text-charcoal"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 text-charcoal hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full py-3 px-6 rounded-full flex items-center justify-center gap-2 text-white font-medium transition-colors
                            ${product.inStock
                              ? 'bg-sage hover:bg-sage/90'
                              : 'bg-gray-300 cursor-not-allowed'
                            }`}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {isAddedToCart
                    ? 'Added to Cart!'
                    : product.inStock
                      ? 'Add to Cart'
                      : 'Out of Stock'
                  }
                </button>
                
                {/* Free Shipping Progress Bar */}
                {product.vendor.shippingInfo.minimumForFree && (
                  <div className="mt-4">
                    <FreeShippingProgressBar 
                      brandName={product.brand} 
                      currentAmount={15.50} 
                      threshold={product.vendor.shippingInfo.minimumForFree} 
                    />
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start gap-3">
                  <TruckIcon className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-charcoal">
                      Shipping
                    </h3>
                    {product.vendor.shippingInfo.isFree ? (
                      <p className="text-sm text-gray-600">
                        Free shipping on this item
                      </p>
                    ) : product.vendor.shippingInfo.minimumForFree ? (
                      <p className="text-sm text-gray-600">
                        Free shipping on orders over ${product.vendor.shippingInfo.minimumForFree.toFixed(2)}
                        <br />
                        Standard shipping: ${product.vendor.shippingInfo.baseRate?.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Standard shipping: ${product.vendor.shippingInfo.baseRate?.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                

              </div>

              {/* Vendor & Causes */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-charcoal">
                      Sold by
                    </h3>
                    <Link 
                      href={`/vendor/${product.vendor.id}`}
                      className="text-sage hover:underline text-sm"
                    >
                      {product.vendor.name}
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    {product.vendor.causes.map((causeId, index) => {
                      const cause = causes.find(c => c.id === causeId);
                      if (!cause) return null;
                      return (
                        <div
                          key={index}
                          className="relative group"
                        >
                          <div 
                            className="flex items-center justify-center w-8 h-8 bg-sage/10 text-sage rounded-full hover:bg-sage/20 transition-colors duration-200"
                            title={cause.name}
                          >
                            <div className="w-5 h-5 flex items-center justify-center">{cause.icon}</div>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            {cause.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Guarantee */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-charcoal">
                      av | nu Guarantee
                    </h3>
                    <p className="text-sm text-gray-600">
                      30-day returns, quality verified, secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* More from this Brand */}
          {brandProducts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-charcoal">
                  More from {product.brand}
                </h2>
                <Link 
                  href={`/brand/${getBrandIdFromName(product.brand)}`}
                  className="text-sage hover:underline text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandProducts.map((brandProduct) => (
                  <ProductCard key={brandProduct.id} product={brandProduct} />
                ))}
              </div>
            </section>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-charcoal">
                  You May Also Like
                </h2>
                <Link 
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="text-sage hover:underline text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
