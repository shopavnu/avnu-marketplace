import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { ABTestingService } from '../services/ab-testing.service';
import { ABTestResultDto } from '../dto/ab-test-results.dto';

@Resolver()
@UseGuards(AdminGuard)
export class ABTestingResolver {
  constructor(private readonly abTestingService: ABTestingService) {}

  @Query(() => [ABTestResultDto])
  async abTestResults(): Promise<ABTestResultDto[]> {
    return this.abTestingService.getABTestResults();
  }
}
