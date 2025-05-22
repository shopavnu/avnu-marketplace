export declare enum MetricType {
  REVENUE = 'revenue',
  ORDERS = 'orders',
  AOV = 'average_order_value',
  CONVERSION_RATE = 'conversion_rate',
  PRODUCT_VIEWS = 'product_views',
  CART_ADDS = 'cart_adds',
  CHECKOUT_STARTS = 'checkout_starts',
  CHECKOUT_COMPLETIONS = 'checkout_completions',
  CART_ABANDONMENT = 'cart_abandonment',
  NEW_USERS = 'new_users',
  RETURNING_USERS = 'returning_users',
  SEARCH_COUNT = 'search_count',
  SEARCH_CONVERSION = 'search_conversion',
  MERCHANT_REVENUE = 'merchant_revenue',
  PLATFORM_REVENUE = 'platform_revenue',
}
export declare enum TimeGranularity {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}
export declare class BusinessMetrics {
  id: string;
  metricType: MetricType;
  value: number;
  count: number;
  dimension1: string;
  dimension2: string;
  dimension3: string;
  timeGranularity: TimeGranularity;
  timestamp: Date;
  periodStart: Date;
  periodEnd: Date;
}
