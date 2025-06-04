import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import useCartStore from "@/stores/useCartStore";
import { CartItem } from "@/types/cart";

// Import CartItem type from our types

import { brands as allBrands } from "@/data/brands";

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
  const brand = allBrands.find((b) => b.name === brandName);
  if (brand) return brand.id;

  // For mock brand names like "Brand 1", use a real brand ID
  if (brandName.startsWith("Brand ") && allBrands.length > 0) {
    const brandNumber = parseInt(brandName.replace("Brand ", "")) || 1;
    const index = (brandNumber - 1) % allBrands.length;
    return allBrands[index].id;
  }

  // Fallback to a URL-friendly version of the name
  return brandName.toLowerCase().replace(/\s+/g, "-");
};

// Using CartItem from our types file now

// Free Shipping Progress Bar Component
interface FreeShippingProgressBarProps {
  brandName: string;
  currentAmount: number;
  threshold: number;
}

const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({
  brandName,
  currentAmount,
  threshold,
}) => {
  const progress = Math.min((currentAmount / threshold) * 100, 100);
  const amountNeeded = Math.max(0, threshold - currentAmount);

  return (
    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-lg mb-3 border border-teal-100">
      <p className="text-xs text-gray-700 font-medium mb-1">
        {amountNeeded > 0 ? (
          <>
            Spend{" "}
            <span className="font-semibold text-teal-700">
              ${amountNeeded.toFixed(2)}
            </span>{" "}
            more for FREE shipping from {brandName}!
          </>
        ) : (
          <span className="font-semibold text-green-600">
            You&apos;ve earned free shipping from {brandName}! 🎉
          </span>
        )}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
        <div
          className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 text-right mt-1">
        ${currentAmount.toFixed(2)} / ${threshold.toFixed(2)}
      </p>
    </div>
  );
};

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onClose }) => {
  // Get cart data from Zustand store
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getCartTotal,
    getItemsGroupedByBrand,
    closeCart 
  } = useCartStore();
  
  // Add scrollbar styles to head
  useEffect(() => {
    if (typeof document !== "undefined") {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = scrollbarStyles;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define handleClickOutside inside useEffect to properly include all dependencies
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeCart();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, closeCart]);

  // Calculate cart totals
  const subtotal = getCartTotal();
  const estimatedTax = subtotal * 0.08; // Example tax rate
  const total = subtotal + estimatedTax;

  // Group items by brand using our store utility function
  const itemsByBrand = getItemsGroupedByBrand();

  // Brand shipping thresholds and totals
  // In a real app, this would be fetched from an API
  const brandTotals = Object.entries(itemsByBrand).map(([brandName, items]) => {
    const total = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    return {
      brandName,
      total,
      // Simulate different thresholds by brand - this would be fetched from brand settings in a real app
      threshold: brandName === "EcoWear" ? 50 : brandName === "ZeroWaste" ? 35 : 0,
    };
  });

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-[380px] max-h-[80vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: '100%', height: '100%' }}
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

            <div className="overflow-auto cart-items-scroll" style={{ maxHeight: "50vh" }}>
              {items.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h4 className="text-lg font-medium text-charcoal mb-2">
                    Your cart is empty
                  </h4>
                  <p className="text-neutral-gray text-sm mb-4">
                    Looks like you haven&apos;t added any items to your cart yet.
                  </p>
                  <button
                    onClick={onClose}
                    className="inline-block px-6 py-2 bg-sage text-white rounded-full font-medium hover:bg-sage/90 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    {Object.entries(itemsByBrand).map(
                      ([brandName, items], index) => (
                        <div key={brandName} className="pt-2 px-4">
                          {/* Brand Header */}
                          <div className="flex items-center mb-2">
                            <Link
                              href={`/brands/${getBrandIdFromName(brandName)}`}
                              className="text-sm font-medium text-charcoal hover:text-sage transition-colors"
                              onClick={onClose}
                            >
                              {brandName}
                            </Link>
                          </div>

                          {/* Brand Items */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                            }}
                          >
                            {items.map((item) => (
                              <div
                                key={item.product.id}
                                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0"
                              >
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  width: '100%'
                                }}>
                                  <motion.div
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
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
                                  </motion.div>

                                  {/* Product Details */}
                                  <div className="flex-grow">
                                    <h4 className="text-charcoal font-medium text-sm">
                                      {item.product.title}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="text-sage font-medium">
                                        ${item.product.price.toFixed(2)}
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() =>
                                            updateQuantity(
                                              item.product.id,
                                              item.quantity - 1,
                                            )
                                          }
                                          disabled={item.quantity <= 1}
                                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <MinusIcon className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-sm">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateQuantity(
                                              item.product.id,
                                              item.quantity + 1,
                                            )
                                          }
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
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Free Shipping Progress Bar */}
                          {brandTotals.find((bt) => bt.brandName === brandName)
                            ?.threshold && (
                            <FreeShippingProgressBar
                              brandName={brandName}
                              currentAmount={
                                brandTotals.find(
                                  (bt) => bt.brandName === brandName,
                                )?.total || 0
                              }
                              threshold={
                                brandTotals.find(
                                  (bt) => bt.brandName === brandName,
                                )?.threshold || 0
                              }
                            />
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Cart Summary */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600">Estimated Tax</span>
                      <span className="font-medium">
                        ${estimatedTax.toFixed(2)}
                      </span>
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
                      onClick={() => {
                        closeCart();
                        onClose();
                      }}
                      className="w-full py-2 mt-2 text-sm text-charcoal hover:text-sage transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDropdown;
