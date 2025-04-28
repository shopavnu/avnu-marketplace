import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ProductSuppressionAnalyticsService } from '../services/product-suppression-analytics.service';

@Resolver()
export class ProductSuppressionAnalyticsResolver {
  constructor(
    private readonly productSuppressionAnalyticsService: ProductSuppressionAnalyticsService,
  ) {}

  @Query(() => SuppressionMetricsResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async suppressionMetrics(
    @Args('period', { type: () => Int, nullable: true }) period?: number,
    @Args('merchantId', { type: () => String, nullable: true }) merchantId?: string,
  ) {
    return this.productSuppressionAnalyticsService.getSuppressionMetrics(period, merchantId);
  }
}

// GraphQL Types
import { ObjectType, Field, Float, Int as GraphQLInt } from '@nestjs/graphql';

@ObjectType()
class SuppressionOverview {
  @Field(() => GraphQLInt)
  totalSuppressedProducts: number;

  @Field(() => GraphQLInt)
  totalActiveSuppressedProducts: number;

  @Field(() => GraphQLInt)
  totalResolvedSuppressions: number;

  @Field(() => Float)
  avgResolutionTimeHours: number;

  @Field(() => Float)
  suppressionRate: number;
}

@ObjectType()
class MerchantSuppressionMetrics {
  @Field()
  merchantId: string;

  @Field()
  merchantName: string;

  @Field(() => GraphQLInt)
  suppressedCount: number;

  @Field(() => GraphQLInt)
  resolvedCount: number;

  @Field(() => Float)
  avgResolutionTimeHours: number;

  @Field(() => Float)
  suppressionRate: number;
}

@ObjectType()
class CategorySuppressionMetrics {
  @Field()
  categoryId: string;

  @Field()
  categoryName: string;

  @Field(() => GraphQLInt)
  suppressedCount: number;

  @Field(() => GraphQLInt)
  resolvedCount: number;

  @Field(() => Float)
  avgResolutionTimeHours: number;

  @Field(() => Float)
  suppressionRate: number;
}

@ObjectType()
class TimeframeSuppressionMetrics {
  @Field()
  date: string;

  @Field(() => GraphQLInt)
  suppressedCount: number;

  @Field(() => GraphQLInt)
  resolvedCount: number;

  @Field(() => Float)
  avgResolutionTimeHours: number;

  @Field(() => Float)
  suppressionRate: number;
}

@ObjectType()
class ResolutionTimeDistribution {
  @Field()
  timeRange: string;

  @Field(() => GraphQLInt)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
class SuppressionMetricsResponse {
  @Field(() => SuppressionOverview)
  overview: SuppressionOverview;

  @Field(() => [MerchantSuppressionMetrics])
  byMerchant: MerchantSuppressionMetrics[];

  @Field(() => [CategorySuppressionMetrics])
  byCategory: CategorySuppressionMetrics[];

  @Field(() => [TimeframeSuppressionMetrics])
  byTimeframe: TimeframeSuppressionMetrics[];

  @Field(() => [ResolutionTimeDistribution])
  resolutionTimeDistribution: ResolutionTimeDistribution[];
}
