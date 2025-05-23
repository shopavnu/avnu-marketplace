import { ConfigService } from '@nestjs/config';
import { RelevanceAlgorithm, ABTestConfig } from './search-relevance.service';
import { GoogleAnalyticsService } from '../../analytics/services/google-analytics.service';
export declare class ABTestingService {
    private readonly configService;
    private readonly googleAnalyticsService;
    private readonly logger;
    private readonly activeTests;
    private readonly userAssignments;
    constructor(configService: ConfigService, googleAnalyticsService: GoogleAnalyticsService);
    private initializeActiveTests;
    getActiveTests(): ABTestConfig[];
    getTestById(testId: string): ABTestConfig | undefined;
    assignUserToVariant(testId: string, userId: string, clientId: string): {
        variantId: string;
        algorithm: RelevanceAlgorithm;
        params?: Record<string, any>;
    } | null;
    private selectVariantByWeight;
    private trackVariantAssignment;
    trackSearchResults(clientId: string, testId: string, variantId: string, searchTerm: string, resultCount: number, userId?: string): Promise<void>;
    trackSearchClick(clientId: string, testId: string, variantId: string, searchTerm: string, productId: string, position: number, userId?: string): Promise<void>;
    getTestMetrics(testId: string): Promise<any>;
}
