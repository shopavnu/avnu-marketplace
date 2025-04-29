import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { UserSegmentationService } from '../services/user-segmentation.service';
import { UserSegmentationDataDto } from '../dto/user-segmentation.dto';

@Resolver()
@UseGuards(AdminGuard)
export class UserSegmentationResolver {
  constructor(private readonly userSegmentationService: UserSegmentationService) {}

  @Query(() => UserSegmentationDataDto)
  async userSegmentationData(
    @Args('period', { type: () => Int, defaultValue: 30 }) period: number,
  ): Promise<UserSegmentationDataDto> {
    return this.userSegmentationService.getUserSegmentationData(period);
  }
}
