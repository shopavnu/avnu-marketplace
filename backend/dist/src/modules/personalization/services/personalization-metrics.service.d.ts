import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import { PersonalizationMetricsDto } from '../dto/personalization-metrics.dto';
import { CategoryService } from '../../products/services/category.service';
export declare class PersonalizationMetricsService {
  private readonly sessionRepository;
  private readonly interactionRepository;
  private readonly categoryService;
  constructor(
    sessionRepository: Repository<SessionEntity>,
    interactionRepository: Repository<SessionInteractionEntity>,
    categoryService: CategoryService,
  );
  getPersonalizationMetrics(days?: number): Promise<PersonalizationMetricsDto>;
  private calculateConversionRate;
  private calculateClickThroughRate;
  private calculateAverageOrderValue;
  private calculateTimeOnSite;
  private calculateRecommendationAccuracy;
  private calculateUserSatisfaction;
  private getHistoricalData;
  private getTopRecommendationCategories;
}
