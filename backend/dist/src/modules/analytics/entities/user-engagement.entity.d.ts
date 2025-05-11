export declare enum EngagementType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  CATEGORY_VIEW = 'category_view',
  BRAND_VIEW = 'brand_view',
  SEARCH = 'search',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  FAVORITE = 'favorite',
  UNFAVORITE = 'unfavorite',
  SHARE = 'share',
  FILTER_USE = 'filter_use',
  SORT_USE = 'sort_use',
  RECOMMENDATION_CLICK = 'recommendation_click',
  SIGNUP = 'signup',
  LOGIN = 'login',
  ACCOUNT_UPDATE = 'account_update',
}
export declare class UserEngagement {
  id: string;
  userId: string;
  sessionId: string;
  engagementType: EngagementType;
  entityId: string;
  entityType: string;
  pagePath: string;
  referrer: string;
  durationSeconds: number;
  metadata: string;
  deviceType: string;
  platform: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
