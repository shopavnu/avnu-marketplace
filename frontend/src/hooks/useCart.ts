import { useCallback } from 'react';
import useCartStore from '@/stores/useCartStore';
import { ProductSummary } from '@/types/cart';

/**
 * Custom hook for cart functionality that provides a simplified API
 * for components to interact with the cart
 */
const useCart = () => {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    isOpen,
    getCartTotal,
    getCartCount,
    getItemsGroupedByBrand
  } = useCartStore();

  // Helper function to add a product to cart with quantity 1
  const addToCart = useCallback((product: ProductSummary) => {
    addItem(product, 1);
  }, [addItem]);

  // Helper function to add a product with custom quantity
  const addToCartWithQuantity = useCallback((product: ProductSummary, quantity: number) => {
    addItem(product, quantity);
  }, [addItem]);

  // Check if a product is in cart
  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.product.id === productId);
  }, [items]);

  // Get quantity of a product in cart
  const getItemQuantity = useCallback((productId: string) => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }, [items]);

  // Calculate shipping eligibility for a brand
  const getShippingInfo = useCallback((brandName: string) => {
    // Import mock shipping data for testing
    try {
      // Dynamic import for mock data - will only load in dev environment
      const { mockShippingInfo } = require('@/utils/mockData');
      
      const shippingInfo = mockShippingInfo[brandName] || {
        freeShipping: false,
        minimumForFree: 50,
        baseRate: 5.99
      };
      
      // Get all items for this brand
      const brandItems = items.filter(item => item.product.brand === brandName);
      
      // Calculate total for this brand
      const brandTotal = brandItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 
        0
      );
      
      const freeShipping = brandTotal >= shippingInfo.minimumForFree;
      const amountToFreeShipping = Math.max(0, shippingInfo.minimumForFree - brandTotal);
      
      return {
        freeShipping,
        amountToFreeShipping,
        threshold: shippingInfo.minimumForFree,
        baseRate: shippingInfo.baseRate
      };
    } catch (error) {
      // Fallback if mock data isn't available
      const defaultThreshold = 50;
      const brandItems = items.filter(item => item.product.brand === brandName);
      const brandTotal = brandItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 0
      );
      
      const freeShipping = brandTotal >= defaultThreshold;
      const amountToFreeShipping = Math.max(0, defaultThreshold - brandTotal);
      
      return {
        freeShipping,
        amountToFreeShipping,
        threshold: defaultThreshold,
        baseRate: 5.99
      };
    }
  }, [items]);

  // Format cart for sending to backend
  const getCartForApi = useCallback(() => {
    return {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        variantId: item.product.variant?.id || null
      })),
      total: getCartTotal()
    };
  }, [items, getCartTotal]);

  return {
    // State
    items,
    isOpen,
    cartCount: getCartCount(),
    cartTotal: getCartTotal(),
    itemsByBrand: getItemsGroupedByBrand(),
    
    // Actions
    addToCart,
    addToCartWithQuantity,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    
    // Utilities
    isInCart,
    getItemQuantity,
    getShippingInfo,
    getCartForApi
  };
};

export default useCart;
