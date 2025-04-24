import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';
import { UserRole } from '../../users/entities/user.entity';

/**
 * GraphQL resolver for analytics dashboard data
 */
@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsDashboardResolver {
  constructor(private readonly analyticsDashboardService: AnalyticsDashboardService) {}

  /**
   * Get dashboard overview with key metrics
   *
   * @param period Period in days
   * @returns Dashboard overview metrics
   */
  @Query(() => JSON)
  @Roles(UserRole.ADMIN)
  async dashboardOverview(
    @Args('period', { type: () => Int, defaultValue: 30 }) period: number,
  ): Promise<any> {
    return this.analyticsDashboardService.getDashboardOverview(period);
  }

  /**
   * Get search performance overview
   *
   * @param period Period in days
   * @returns Search performance metrics
   */
  @Query(() => JSON)
  @Roles(UserRole.ADMIN)
  async searchPerformance(
    @Args('period', { type: () => Int, defaultValue: 30 }) period: number,
  ): Promise<any> {
    return this.analyticsDashboardService.getSearchPerformanceOverview(period);
  }

  /**
   * Get entity search performance
   *
   * @param period Period in days
   * @returns Entity search performance metrics
   */
  @Query(() => JSON)
  @Roles(UserRole.ADMIN)
  async entitySearchPerformance(
    @Args('period', { type: () => Int, defaultValue: 30 }) period: number,
  ): Promise<any> {
    return this.analyticsDashboardService.getEntitySearchPerformance(period);
  }

  /**
   * Get user preference analytics
   *
   * @param limit Maximum number of items to return
   * @returns User preference analytics
   */
  @Query(() => JSON)
  @Roles(UserRole.ADMIN)
  async userPreferenceAnalytics(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<any> {
    return this.analyticsDashboardService.getUserPreferenceAnalytics(limit);
  }

  /**
   * Get A/B testing analytics
   *
   * @returns A/B testing analytics
   */
  @Query(() => JSON)
  @Roles(UserRole.ADMIN)
  async abTestingAnalytics(): Promise<any> {
    return this.analyticsDashboardService.getABTestingAnalytics();
  }

  /**
   * Get personalization effectiveness metrics
   *
   * @param period Period in days
   * @returns Personalization effectiveness metrics
   */
  @Query(() => JSON)
  @Roles(UserRole.ADMIN)
  async personalizationEffectiveness(
    @Args('period', { type: () => Int, defaultValue: 30 }) period: number,
  ): Promise<any> {
    return this.analyticsDashboardService.getPersonalizationEffectiveness(period);
  }
}
