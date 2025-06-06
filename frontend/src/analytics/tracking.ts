/**
 * Analytics tracking functionality for the Avnu Marketplace
 * Handles tracking of various user events and commerce actions
 */

export interface TrackingProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variant?: string;
  brand?: string;
}

export interface OrderCompletedEvent {
  orderId: string;
  total: number;
  currency: string;
  products: TrackingProduct[];
  cartTotal?: number;
  cartItems?: Array<{ productId: string; quantity: number; variantId?: string | null }>;
  couponCode?: string;
  discount?: number;
}

/**
 * Track completed order for analytics
 * @param eventData Order completion data
 */
export const trackOrderCompleted = (eventData: OrderCompletedEvent) => {
  console.log('Tracking order completed:', eventData);
  
  try {
    // Send to data layer for GTM/GA4 integration
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: eventData.orderId,
          value: eventData.total,
          currency: eventData.currency,
          items: eventData.products.map(product => ({
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: product.quantity,
            item_brand: product.brand,
            item_category: product.category,
            item_variant: product.variant
          }))
        }
      });
    }
    
    // Optional: Send to server-side analytics if needed
    fetch('/api/analytics/track-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).catch(err => {
      console.error('Failed to send server-side analytics:', err);
    });
  } catch (error) {
    console.error('Error tracking order completion:', error);
  }
};

/**
 * Track product view event
 */
export const trackProductView = (productData: {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  variant?: string;
}) => {
  console.log('Tracking product view:', productData);
  
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          items: [{
            item_id: productData.id,
            item_name: productData.name,
            price: productData.price,
            item_brand: productData.brand,
            item_category: productData.category,
            item_variant: productData.variant
          }]
        }
      });
    }
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

/**
 * Track add to cart event
 */
export const trackAddToCart = (productData: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  brand?: string;
  category?: string;
  variant?: string;
}) => {
  console.log('Tracking add to cart:', productData);
  
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          items: [{
            item_id: productData.id,
            item_name: productData.name,
            price: productData.price,
            quantity: productData.quantity,
            item_brand: productData.brand,
            item_category: productData.category,
            item_variant: productData.variant
          }]
        }
      });
    }
  } catch (error) {
    console.error('Error tracking add to cart:', error);
  }
};

// Add type declaration for window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
