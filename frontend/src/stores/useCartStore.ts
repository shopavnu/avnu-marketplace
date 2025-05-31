import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CartState, ProductSummary, CartActionType } from '@/types/cart';

// Analytics tracking function - this will be used to track cart events
const trackCartEvent = (action: CartActionType, product?: ProductSummary, quantity?: number) => {
  // This is a placeholder for analytics tracking
  // In a real implementation, this would call your analytics service
  console.log('Cart Event:', action, { product, quantity });
  
  // TODO: Implement actual analytics tracking with Segment/PostHog
  // if (typeof window !== 'undefined' && window.analytics) {
  //   window.analytics.track(action, { product, quantity });
  // }
};

interface CartStore extends CartState {
  // Actions
  addItem: (product: ProductSummary, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // UI state
  openCart: () => void;
  closeCart: () => void;
  
  // Calculations
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemsGroupedByBrand: () => Record<string, CartItem[]>;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      
      // Actions
      addItem: (product, quantity) => {
        if (quantity <= 0) return;
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          
          let newItems;
          if (existingItemIndex >= 0) {
            // Update existing item
            newItems = [...state.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + quantity,
            };
          } else {
            // Add new item
            newItems = [
              ...state.items,
              {
                product,
                quantity,
                addedAt: new Date().toISOString(),
              },
            ];
          }
          
          // Track the event
          trackCartEvent(CartActionType.ADD_ITEM, product, quantity);
          
          return { items: newItems, isOpen: true };
        });
      },
      
      removeItem: (productId) => {
        set((state) => {
          const item = state.items.find(item => item.product.id === productId);
          if (item) {
            trackCartEvent(CartActionType.REMOVE_ITEM, item.product, item.quantity);
          }
          
          return {
            items: state.items.filter((item) => item.product.id !== productId),
          };
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // If quantity is 0 or negative, remove the item
          get().removeItem(productId);
          return;
        }
        
        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          );
          
          const item = state.items.find(item => item.product.id === productId);
          if (item) {
            trackCartEvent(CartActionType.UPDATE_QUANTITY, item.product, quantity);
          }
          
          return { items: newItems };
        });
      },
      
      clearCart: () => {
        trackCartEvent(CartActionType.CLEAR_CART);
        set({ items: [] });
      },
      
      // UI state
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      // Calculations
      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      getItemsGroupedByBrand: () => {
        return get().items.reduce<Record<string, CartItem[]>>((groups, item) => {
          const brand = item.product.brand;
          if (!groups[brand]) {
            groups[brand] = [];
          }
          groups[brand].push(item);
          return groups;
        }, {});
      },
    }),
    {
      name: 'avnu-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
