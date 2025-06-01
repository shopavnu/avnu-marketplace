// Types related to the shopping cart

export interface ProductSummary {
  id: string;
  title: string;
  price: number;
  image: string;
  brand: string;
  slug: string;
  inStock: boolean;
  attributes?: Record<string, string>;
  variant?: {
    id: string;
    name: string;
    value: string;
    price?: number; // Optional price adjustment for variants
  };
}

export interface CartItem {
  product: ProductSummary;
  quantity: number;
  addedAt: string; // ISO date string
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Cart action types for analytics tracking
export enum CartActionType {
  ADD_ITEM = 'ADD_ITEM',
  REMOVE_ITEM = 'REMOVE_ITEM',
  UPDATE_QUANTITY = 'UPDATE_QUANTITY',
  CLEAR_CART = 'CLEAR_CART',
}
