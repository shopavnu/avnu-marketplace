import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import { AnonymousUserMetricsDto } from '../dto/anonymous-user-metrics.dto';
import { ProductsService } from '../../products/products.service';
import { CategoryService } from '../../products/services/category.service';
import { MerchantService } from '../../merchants/services/merchant.service';
export declare class AnonymousUserAnalyticsService {
    private readonly sessionRepository;
    private readonly interactionRepository;
    private readonly productsService;
    private readonly categoryService;
    private readonly merchantService;
    private readonly logger;
    constructor(sessionRepository: Repository<SessionEntity>, interactionRepository: Repository<SessionInteractionEntity>, productsService: ProductsService, categoryService: CategoryService, merchantService: MerchantService);
    getAnonymousUserMetrics(period: number): Promise<AnonymousUserMetricsDto>;
    private calculateOverviewMetrics;
    private calculateInteractionsByType;
    private calculateTopCategoryPreferences;
    private calculateTopBrandPreferences;
    private calculateTopSearchTerms;
    private calculateMetricsByTimeframe;
    private getCategoryName;
    private getMerchantName;
}
