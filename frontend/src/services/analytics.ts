// Analytics service to track user behavior throughout the application
// Provides an abstraction layer that can integrate with multiple analytics providers

// Event types
export enum EventType {
  // Page views
  VIEW_PAGE = 'view_page',
  
  // Cart events
  VIEW_CART = 'view_cart',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  UPDATE_CART = 'update_cart',
  
  // Checkout events
  BEGIN_CHECKOUT = 'begin_checkout',
  ADD_SHIPPING_INFO = 'add_shipping_info',
  ADD_PAYMENT_INFO = 'add_payment_info',
  
  // Purchase events
  PURCHASE = 'purchase',
  
  // Product events
  VIEW_ITEM = 'view_item',
  VIEW_ITEM_LIST = 'view_item_list',
  
  // User events
  LOGIN = 'login',
  SIGNUP = 'signup',
  
  // Custom events
  CUSTOM = 'custom'
}

interface AnalyticsOptions {
  // Enable console logging for debugging
  debug?: boolean;
}

interface PageViewProperties {
  path: string;
  title: string;
  referrer?: string;
}

interface ProductProperties {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  quantity?: number;
  variant?: string;
  currency?: string;
}

interface CartProperties {
  items: ProductProperties[];
  value?: number;
  currency?: string;
}

interface CheckoutProperties extends CartProperties {
  step?: number;
  option?: string;
}

interface PurchaseProperties extends CartProperties {
  transaction_id: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
}

class AnalyticsService {
  private debug: boolean;
  private initialized: boolean = false;
  
  constructor(options: AnalyticsOptions = {}) {
    this.debug = options.debug || false;
  }
  
  /**
   * Initialize analytics services
   */
  init(): void {
    if (this.initialized) return;
    
    this.loadAnalyticsScripts();
    this.initialized = true;
    
    if (this.debug) {
      console.log('Analytics service initialized');
    }
  }
  
  /**
   * Load any external analytics scripts
   */
  private loadAnalyticsScripts(): void {
    // This would load scripts for services like Google Analytics, Segment, PostHog, etc.
    // Example for Google Analytics:
    if (typeof window !== 'undefined') {
      // GA4 implementation would go here
      // this.loadGoogleAnalytics();
      
      // Segment implementation would go here
      // this.loadSegment();
      
      // For now we'll just use console logging for demonstration
    }
  }
  
  /**
   * Track a generic event
   */
  track(event: EventType, properties?: any): void {
    if (!this.initialized) {
      this.init();
    }
    
    if (this.debug) {
      console.log(`[Analytics] Tracking event: ${event}`, properties);
    }
    
    // Send to various providers
    // this.sendToGA(event, properties);
    // this.sendToSegment(event, properties);
    // etc.
  }
  
  /**
   * Track page view
   */
  trackPageView(properties: PageViewProperties): void {
    this.track(EventType.VIEW_PAGE, properties);
  }
  
  /**
   * Track product view
   */
  trackProductView(product: ProductProperties): void {
    this.track(EventType.VIEW_ITEM, { product });
  }
  
  /**
   * Track add to cart
   */
  trackAddToCart(product: ProductProperties): void {
    this.track(EventType.ADD_TO_CART, { product });
  }
  
  /**
   * Track remove from cart
   */
  trackRemoveFromCart(product: ProductProperties): void {
    this.track(EventType.REMOVE_FROM_CART, { product });
  }
  
  /**
   * Track begin checkout
   */
  trackBeginCheckout(cart: CartProperties): void {
    this.track(EventType.BEGIN_CHECKOUT, cart);
  }
  
  /**
   * Track checkout step
   */
  trackCheckoutStep(step: number, option: string, properties: CheckoutProperties): void {
    this.track(
      step === 1 ? EventType.ADD_SHIPPING_INFO : EventType.ADD_PAYMENT_INFO, 
      { ...properties, step, option }
    );
  }
  
  /**
   * Track purchase completion
   */
  trackPurchase(purchase: PurchaseProperties): void {
    this.track(EventType.PURCHASE, purchase);
  }
}

// Create singleton instance
const analytics = new AnalyticsService({ debug: process.env.NODE_ENV === 'development' });

export default analytics;
