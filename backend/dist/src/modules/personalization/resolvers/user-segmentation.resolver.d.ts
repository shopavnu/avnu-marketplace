import { UserSegmentationService } from '../services/user-segmentation.service';
import { UserSegmentationDataDto } from '../dto/user-segmentation.dto';
export declare class UserSegmentationResolver {
  private readonly userSegmentationService;
  constructor(userSegmentationService: UserSegmentationService);
  userSegmentationData(period: number): Promise<UserSegmentationDataDto>;
}
