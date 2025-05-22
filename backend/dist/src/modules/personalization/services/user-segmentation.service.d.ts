import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import { UserSegmentationDataDto } from '../dto/user-segmentation.dto';
import { ProductsService } from '../../products/products.service';
import { CategoryService } from '../../products/services/category.service';
import { MerchantService } from '../../merchants/services/merchant.service';
export declare class UserSegmentationService {
  private readonly sessionRepository;
  private readonly interactionRepository;
  private readonly productsService;
  private readonly categoryService;
  private readonly merchantService;
  private readonly segmentColors;
  constructor(
    sessionRepository: Repository<SessionEntity>,
    interactionRepository: Repository<SessionInteractionEntity>,
    productsService: ProductsService,
    categoryService: CategoryService,
    merchantService: MerchantService,
  );
  getUserSegmentationData(days?: number): Promise<UserSegmentationDataDto>;
  private generateUserSegments;
  private generatePageHeatmap;
  private generateFunnelData;
  private identifyBrowsers;
  private identifyResearchers;
  private identifyShoppers;
  private identifyReturners;
  private getTopCategoriesForSegment;
  private getTopBrandsForSegment;
  private getAvgSessionDuration;
}
