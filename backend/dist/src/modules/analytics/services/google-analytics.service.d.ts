import { ConfigService } from '@nestjs/config';
export interface AnalyticsEvent {
    name: string;
    params: Record<string, any>;
}
export declare class GoogleAnalyticsService {
    private readonly configService;
    private readonly logger;
    private readonly measurementId;
    private readonly apiSecret;
    private readonly endpoint;
    private readonly isEnabled;
    constructor(configService: ConfigService);
    sendEvent(clientId: string, event: AnalyticsEvent, userId?: string): Promise<boolean>;
    trackSearch(clientId: string, searchTerm: string, resultCount: number, testInfo?: {
        testId: string;
        variantId: string;
    }, userId?: string): Promise<boolean>;
    trackSearchClick(clientId: string, searchTerm: string, productId: string, position: number, testInfo?: {
        testId: string;
        variantId: string;
    }, userId?: string): Promise<boolean>;
    trackSearchRefinement(clientId: string, originalSearchTerm: string, refinedSearchTerm: string, filterApplied: Record<string, any>, testInfo?: {
        testId: string;
        variantId: string;
    }, userId?: string): Promise<boolean>;
    trackABTestImpression(clientId: string, testId: string, variantId: string, context: Record<string, any>, userId?: string): Promise<boolean>;
    generateClientId(): string;
}
