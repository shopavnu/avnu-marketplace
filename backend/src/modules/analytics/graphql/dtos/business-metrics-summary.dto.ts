import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class BusinessMetricsSummaryDto {
  @Field(() => Float, { nullable: true, description: 'Total revenue' })
  totalRevenue?: number;

  @Field(() => Int, { nullable: true, description: 'Total orders' })
  totalOrders?: number;

  @Field(() => Float, { nullable: true, description: 'Average Order Value (AOV)' })
  averageOrderValue?: number;

  @Field(() => Float, { nullable: true, description: 'Overall conversion rate' })
  conversionRate?: number;

  @Field(() => Int, { nullable: true, description: 'Number of active users' })
  activeUsers?: number;

  // Add other relevant summary metrics as needed
}
