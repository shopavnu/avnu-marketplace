import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { XMarkIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types/products';
import { brands as allBrands } from '@/data/brands';

// Add custom CSS for scrollbar styling
const scrollbarStyles = `
  .cart-items-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .cart-items-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .cart-items-scroll::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  .cart-items-scroll::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

/**
 * Helper function to get brand ID from name
 * Reused across multiple components for consistent brand URL generation
 */
const getBrandIdFromName = (brandName: string): string => {
  // First, try to find a real brand with this name
  const brand = allBrands.find(b => b.name === brandName);
  if (brand) return brand.id;
  
  // For mock brand names like "Brand 1", use a real brand ID
  if (brandName.startsWith('Brand ') && allBrands.length > 0) {
    const brandNumber = parseInt(brandName.replace('Brand ', '')) || 1;
    const index = (brandNumber - 1) % allBrands.length;
    return allBrands[index].id;
  }
  
  // Fallback to a URL-friendly version of the name
  return brandName.toLowerCase().replace(/\s+/g, '-');
};

// Cart item type
export interface CartItem {
  product: Product;
  quantity: number;
}

// Free Shipping Progress Bar Component
interface FreeShippingProgressBarProps {
  brandName: string;
  currentAmount: number;
  threshold: number;
}

const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({ 
  brandName, 
  currentAmount, 
  threshold 
}) => {
  const progress = Math.min((currentAmount / threshold) * 100, 100);
  const amountNeeded = Math.max(0, threshold - currentAmount);

  return (
    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-lg mb-3 border border-teal-100">
      <p className="text-xs text-gray-700 font-medium mb-1">
        {amountNeeded > 0
          ? <>Spend <span className="font-semibold text-teal-700">${amountNeeded.toFixed(2)}</span> more for FREE shipping from {brandName}!</>
          : <span className="font-semibold text-green-600">You've earned free shipping from {brandName}! 🎉</span>
        }
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
        <div 
          className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 text-right mt-1">${currentAmount.toFixed(2)} / ${threshold.toFixed(2)}</p>
    </div>
  );
};

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onClose }) => {
  // Add scrollbar styles to head
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = scrollbarStyles;
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);
  // Mock cart data - in a real app, this would come from a cart context or state management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Load mock cart data on mount
  useEffect(() => {
    // In a real app, this would be fetched from an API or local storage
    const mockCartItems: CartItem[] = [
      {
        product: {
          id: 'product-1',
          title: 'Ceramic Vase',
          description: 'Handcrafted ceramic vase with natural glazes',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800',
          images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800'],
          brand: 'Terra & Clay',
          category: 'Home',
          subCategory: 'Decor',
          attributes: { color: 'Blue', material: 'Ceramic' },
          isNew: true,
          rating: {
            avnuRating: { average: 4.8, count: 24 },
            shopifyRating: { average: 4.7, count: 15 }
          },
          vendor: {
            id: 'vendor-1',
            name: 'Terra & Clay',
            causes: ['sustainable', 'handmade'],
            isLocal: true,
            shippingInfo: {
              isFree: false,
              minimumForFree: 75,
              baseRate: 5.99
            }
          },
          inStock: true,
          tags: ['featured'],
          createdAt: new Date().toISOString()
        },
        quantity: 1
      },
      {
        product: {
          id: 'product-2',
          title: 'Organic Cotton Throw',
          description: 'Soft, organic cotton throw with hand-woven details',
          price: 39.99,
          image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800',
          images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800'],
          brand: 'Pure Living',
          category: 'Home',
          subCategory: 'Textiles',
          attributes: { color: 'Natural', material: 'Cotton' },
          isNew: false,
          rating: {
            avnuRating: { average: 4.5, count: 18 }
          },
          vendor: {
            id: 'vendor-2',
            name: 'Pure Living',
            causes: ['organic', 'sustainable'],
            isLocal: false,
            shippingInfo: {
              isFree: false,
              minimumForFree: 50,
              baseRate: 4.99
            }
          },
          inStock: true,
          tags: ['bestseller'],
          createdAt: new Date().toISOString()
        },
        quantity: 2
      }
    ];
    
    setCartItems(mockCartItems);
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const estimatedTax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + estimatedTax;

  // Group items by brand
  const itemsByBrand = cartItems.reduce((groups, item) => {
    const brandName = item.product.brand;
    if (!groups[brandName]) {
      groups[brandName] = [];
    }
    groups[brandName].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  // Calculate brand totals for shipping progress
  const brandTotals = Object.entries(itemsByBrand).map(([brandName, items]) => {
    const brandTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingThreshold = items[0].product.vendor.shippingInfo.minimumForFree || 0;
    return { brandName, total: brandTotal, threshold: shippingThreshold };
  });

  // Handle quantity changes
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  // Handle item removal
  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-[380px] max-h-[80vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-lg text-charcoal">Your Cart</h3>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-charcoal transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[80vh] cart-items-scroll">
            {cartItems.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBagIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Your cart is empty</p>
                <Link 
                  href="/shop" 
                  className="mt-4 inline-block px-4 py-2 bg-sage text-white rounded-full text-sm font-medium hover:bg-sage/90 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="p-4">
                {/* Items grouped by brand */}
                {Object.entries(itemsByBrand).map(([brandName, items], brandIndex) => (
                  <div 
                    key={brandName} 
                    className={`${brandIndex > 0 ? 'pt-4 mt-4 border-t border-gray-100' : ''}`}
                  >
                    {/* Brand Header */}
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        href={`/brand/${getBrandIdFromName(brandName)}`}
                        className="text-sage hover:underline text-sm font-medium"
                      >
                        {brandName}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Brand Items */}
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {items.map(item => (
                        <motion.div 
                          key={item.product.id}
                          variants={itemVariants}
                          className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0"
                        >
                          {/* Product Image */}
                          <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
                            <Image
                              src={item.product.image}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-medium text-charcoal truncate">
                              {item.product.title}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-sm text-gray-500">
                                ${item.product.price.toFixed(2)}
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-charcoal"
                                  disabled={item.quantity <= 1}
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-charcoal"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Free Shipping Progress Bar */}
                    {brandTotals.find(bt => bt.brandName === brandName)?.threshold && (
                      <FreeShippingProgressBar
                        brandName={brandName}
                        currentAmount={brandTotals.find(bt => bt.brandName === brandName)?.total || 0}
                        threshold={brandTotals.find(bt => bt.brandName === brandName)?.threshold || 0}
                      />
                    )}
                  </div>
                ))}
              </div>

                {/* Cart Summary */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span className="font-medium">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mb-4">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="block w-full text-center py-3 bg-sage text-white rounded-full font-medium hover:bg-sage/90 transition-colors"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Link>
                
                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full py-2 mt-2 text-sm text-charcoal hover:text-sage transition-colors"
                >
                  Continue Shopping
                </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDropdown;
