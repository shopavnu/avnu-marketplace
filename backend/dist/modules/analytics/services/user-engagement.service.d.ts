import { Repository } from 'typeorm';
import { UserEngagement } from '../entities/user-engagement.entity';
export declare class UserEngagementService {
  private readonly userEngagementRepository;
  private readonly logger;
  constructor(userEngagementRepository: Repository<UserEngagement>);
  trackEngagement(data: Partial<UserEngagement>): Promise<UserEngagement>;
  trackPageView(
    userId: string | null,
    sessionId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<UserEngagement>;
  trackProductView(
    userId: string | null,
    sessionId: string,
    productId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackCategoryView(
    userId: string | null,
    sessionId: string,
    categoryId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackBrandView(
    userId: string | null,
    sessionId: string,
    brandId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackSearch(
    userId: string | null,
    sessionId: string,
    searchQuery: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackAddToCart(
    userId: string | null,
    sessionId: string,
    productId: string,
    quantity: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackRemoveFromCart(
    userId: string | null,
    sessionId: string,
    productId: string,
    quantity: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackCheckoutStart(
    userId: string | null,
    sessionId: string,
    cartItems: any[],
    totalAmount: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackCheckoutComplete(
    userId: string | null,
    sessionId: string,
    orderId: string,
    orderItems: any[],
    totalAmount: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackFavorite(
    userId: string,
    sessionId: string,
    productId: string,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  trackUnfavorite(
    userId: string,
    sessionId: string,
    productId: string,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement>;
  getUserEngagementByTimePeriod(
    period?: number,
    interval?: 'day' | 'week' | 'month',
  ): Promise<any[]>;
  getUserEngagementByType(period?: number): Promise<any[]>;
  getTopViewedProducts(limit?: number, period?: number): Promise<any[]>;
  getTopFavoritedProducts(limit?: number, period?: number): Promise<any[]>;
  getUserEngagementFunnel(period?: number): Promise<any>;
  getUserRetentionMetrics(period?: number): Promise<any>;
}
