import { User } from '../../users/entities/user.entity';
export declare class UserPreferenceProfile {
  id: string;
  userId: string;
  user: User;
  lastUpdated: Date;
  totalPageViews: number;
  totalProductViews: number;
  averageScrollDepth: number;
  averageProductViewTimeSeconds: number;
  averageSessionDurationMinutes: number;
  productEngagementCount: number;
  topViewedCategories: string[];
  topViewedBrands: string[];
  recentlyViewedProducts: string[];
  categoryPreferences: Record<string, number>;
  brandPreferences: Record<string, number>;
  productPreferences: Record<string, number>;
  viewTimeByCategory: Record<string, number>;
  viewTimeByBrand: Record<string, number>;
  scrollDepthByPageType: Record<string, number>;
  priceRangePreferences: Record<string, number>;
  hasEnoughData: boolean;
  createdAt: Date;
  updatedAt: Date;
}
