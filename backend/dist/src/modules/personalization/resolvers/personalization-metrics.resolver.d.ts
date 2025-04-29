import { PersonalizationMetricsService } from '../services/personalization-metrics.service';
import { PersonalizationMetricsDto } from '../dto/personalization-metrics.dto';
export declare class PersonalizationMetricsResolver {
    private readonly personalizationMetricsService;
    constructor(personalizationMetricsService: PersonalizationMetricsService);
    personalizationMetrics(period: number): Promise<PersonalizationMetricsDto>;
}
