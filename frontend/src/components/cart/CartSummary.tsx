import React from 'react';
import Image from 'next/image';
import useCart from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';
import { CartItem } from '@/types/cart';

interface CartSummaryProps {
  showImages?: boolean;
  showControls?: boolean;
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  showImages = true,
  showControls = false,
  className = '',
}) => {
  const { 
    items, 
    cartTotal, 
    removeItem, 
    updateQuantity, 
    itemsByBrand,
    getShippingInfo
  } = useCart();

  if (items.length === 0) {
    return (
      <div className={`py-4 ${className}`}>
        <p className="text-gray-500 text-center">Your cart is empty</p>
      </div>
    );
  }

  // Calculate taxes (for demo purposes, 8%)
  const tax = cartTotal * 0.08;
  
  // Calculate shipping based on brand thresholds
  let totalShipping = 0;
  
  Object.entries(itemsByBrand).forEach(([brandName, brandItems]) => {
    const { freeShipping } = getShippingInfo(brandName);
    if (!freeShipping) {
      // Use a default shipping cost of $5.99 per brand if not free
      totalShipping += 5.99;
    }
  });
  
  const orderTotal = cartTotal + tax + totalShipping;

  return (
    <div className={`${className}`}>
      {/* Cart Items */}
      <div className="space-y-4 mb-4">
        {items.map((item: CartItem) => (
          <div key={`${item.product.id}-${item.product.variant?.id || 'default'}`} className="flex items-start">
            {showImages && (
              <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.image || '/images/placeholder.jpg'}
                  alt={item.product.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div className={`flex-1 ${showImages ? 'ml-3' : ''}`}>
              <h4 className="text-sm font-medium text-gray-800">{item.product.title}</h4>
              <div className="text-xs text-gray-500 mt-0.5">
                {item.product.variant && <span>{item.product.variant.name}</span>}
                <span className="block mt-0.5">{item.product.brand}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm text-gray-800">
                  {formatCurrency(item.product.price)} x {item.quantity}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
              
              {showControls && (
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700"
                    >
                      -
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Brand-specific shipping info */}
      {Object.entries(itemsByBrand).map(([brandName, brandItems]) => {
        const { freeShipping, amountToFreeShipping, threshold } = getShippingInfo(brandName);
        
        // Only show threshold information if there's a threshold and it's not already free
        if (threshold > 0 && !freeShipping) {
          const brandTotal = brandItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity, 
            0
          );
          const progress = Math.min(100, (brandTotal / threshold) * 100);
          
          return (
            <div key={brandName} className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-lg mb-3 border border-teal-100">
              <p className="text-xs text-gray-700 font-medium mb-1">
                Spend <span className="font-semibold text-teal-700">${amountToFreeShipping.toFixed(2)}</span> more for FREE shipping from {brandName}!
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                ${brandTotal.toFixed(2)} / ${threshold.toFixed(2)}
              </p>
            </div>
          );
        }
        return null;
      })}

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{totalShipping === 0 ? 'Free' : formatCurrency(totalShipping)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-medium text-base pt-2 border-t border-gray-100 mt-2">
          <span>Total</span>
          <span>{formatCurrency(orderTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
