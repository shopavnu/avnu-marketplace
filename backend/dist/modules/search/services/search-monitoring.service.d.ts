import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
export declare class SearchMonitoringService {
  private readonly configService;
  private readonly eventEmitter;
  private readonly logger;
  private readonly enabled;
  private readonly sampleRate;
  private readonly performanceThresholds;
  private readonly relevanceThresholds;
  constructor(configService: ConfigService, eventEmitter: EventEmitter2);
  trackSearch(_options: SearchOptionsInput, results: SearchResponseDto, duration: number): void;
  private trackPerformance;
  private trackRelevance;
  private trackEntityDistribution;
  private trackSearchMetrics;
  private trackZeroResultsRate;
  private calculateOverallRelevanceScore;
  getPerformanceStats(_period?: number): Promise<PerformanceStats>;
  getRelevanceStats(_period?: number): Promise<RelevanceStats>;
  getSearchHealthStatus(): Promise<SearchHealthStatus>;
  private determinePerformanceStatus;
  private determineRelevanceStatus;
}
export interface PerformanceStats {
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  maxDuration: number;
  criticalCount: number;
  warningCount: number;
  totalSearches: number;
  timestamp: Date;
}
interface RelevanceStats {
  averageRelevance: number;
  zeroResultsRate: number;
  lowRelevanceRate: number;
  entityDistribution: {
    products: number;
    merchants: number;
    brands: number;
  };
  timestamp: Date;
}
type HealthStatus = 'healthy' | 'warning' | 'critical';
interface SearchHealthStatus {
  status: HealthStatus;
  performance: {
    status: HealthStatus;
    stats: PerformanceStats;
  };
  relevance: {
    status: HealthStatus;
    stats: RelevanceStats;
  };
  timestamp: Date;
}
export {};
