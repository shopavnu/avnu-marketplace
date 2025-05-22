import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { PersonalizationMetricsService } from '../services/personalization-metrics.service';
import { PersonalizationMetricsDto } from '../dto/personalization-metrics.dto';

@Resolver()
@UseGuards(AdminGuard)
export class PersonalizationMetricsResolver {
  constructor(private readonly personalizationMetricsService: PersonalizationMetricsService) {}

  @Query(() => PersonalizationMetricsDto)
  async personalizationMetrics(
    @Args('period', { type: () => Int, defaultValue: 30 }) period: number,
  ): Promise<PersonalizationMetricsDto> {
    return this.personalizationMetricsService.getPersonalizationMetrics(period);
  }
}
