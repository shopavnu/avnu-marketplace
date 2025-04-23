import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchResponseDto } from '../dto/search-response.dto';

/**
 * Service for monitoring search performance and relevance
 */
@Injectable()
export class SearchMonitoringService {
  private readonly logger = new Logger(SearchMonitoringService.name);
  private readonly enabled: boolean;
  private readonly sampleRate: number;
  private readonly performanceThresholds: PerformanceThresholds;
  private readonly relevanceThresholds: RelevanceThresholds;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.enabled = this.configService.get<boolean>('SEARCH_MONITORING_ENABLED', true);
    this.sampleRate = this.configService.get<number>('SEARCH_MONITORING_SAMPLE_RATE', 0.1); // 10% of searches

    // Performance thresholds in milliseconds
    this.performanceThresholds = {
      warning: this.configService.get<number>('SEARCH_PERFORMANCE_WARNING_THRESHOLD', 500),
      critical: this.configService.get<number>('SEARCH_PERFORMANCE_CRITICAL_THRESHOLD', 1000),
    };

    // Relevance thresholds (0-1)
    this.relevanceThresholds = {
      zeroResults: this.configService.get<number>('SEARCH_RELEVANCE_ZERO_RESULTS_THRESHOLD', 0.05),
      lowRelevance: this.configService.get<number>('SEARCH_RELEVANCE_LOW_THRESHOLD', 0.3),
    };
  }

  /**
   * Track search performance and relevance
   * @param _options Search options
   * @param results Search results
   * @param duration Search duration in milliseconds
   */
  trackSearch(_options: SearchOptionsInput, results: SearchResponseDto, duration: number): void {
    if (!this.enabled || Math.random() > this.sampleRate) {
      return;
    }

    // Track performance
    this.trackPerformance(_options, duration);

    // Track relevance
    this.trackRelevance(_options, results);

    // Track entity distribution
    this.trackEntityDistribution(_options, results);

    // Track search metrics
    this.trackSearchMetrics(_options, results, duration);
  }

  /**
   * Track search performance
   * @param _options Search options
   * @param duration Search duration in milliseconds
   */
  private trackPerformance(_options: SearchOptionsInput, duration: number): void {
    // Emit performance metric event
    this.eventEmitter.emit('search.performance', {
      query: _options.query,
      entityType: _options.entityType,
      duration,
      timestamp: new Date(),
    });

    // Log performance issues
    if (duration > this.performanceThresholds.critical) {
      this.logger.warn(
        `Critical search performance: ${duration}ms for query "${_options.query}" (${_options.entityType})`,
      );

      // Emit critical performance event
      this.eventEmitter.emit('search.performance.critical', {
        query: _options.query,
        entityType: _options.entityType,
        duration,
        timestamp: new Date(),
      });
    } else if (duration > this.performanceThresholds.warning) {
      this.logger.debug(
        `Warning search performance: ${duration}ms for query "${_options.query}" (${_options.entityType})`,
      );

      // Emit warning performance event
      this.eventEmitter.emit('search.performance.warning', {
        query: _options.query,
        entityType: _options.entityType,
        duration,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Track search relevance
   * @param _options Search options
   * @param results Search results
   */
  private trackRelevance(_options: SearchOptionsInput, results: SearchResponseDto): void {
    const { query, entityType } = _options;
    const { pagination } = results;

    // Check for zero results
    if (pagination.total === 0 && query && query.trim().length > 0) {
      this.logger.debug(`Zero results for query "${query}" (${entityType})`);

      // Emit zero results event
      this.eventEmitter.emit('search.relevance.zero_results', {
        query,
        entityType,
        timestamp: new Date(),
      });

      // Track zero results rate
      this.trackZeroResultsRate(_options);
    }

    // Calculate relevance score if available
    if (results.relevanceScores) {
      const relevanceScore = this.calculateOverallRelevanceScore(results.relevanceScores);

      // Emit relevance metric event
      this.eventEmitter.emit('search.relevance', {
        query,
        entityType,
        relevanceScore,
        timestamp: new Date(),
      });

      // Check for low relevance
      if (relevanceScore < this.relevanceThresholds.lowRelevance && pagination.total > 0) {
        this.logger.debug(
          `Low relevance (${relevanceScore.toFixed(2)}) for query "${query}" (${entityType})`,
        );

        // Emit low relevance event
        this.eventEmitter.emit('search.relevance.low', {
          query,
          entityType,
          relevanceScore,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Track entity distribution
   * @param _options Search options
   * @param results Search results
   */
  private trackEntityDistribution(_options: SearchOptionsInput, results: SearchResponseDto): void {
    if (_options.entityType !== SearchEntityType.ALL || !results.entityDistribution) {
      return;
    }

    // Emit entity distribution event
    this.eventEmitter.emit('search.entity_distribution', {
      query: _options.query,
      distribution: results.entityDistribution,
      timestamp: new Date(),
    });
  }

  /**
   * Track search metrics
   * @param _options Search options
   * @param results Search results
   * @param duration Search duration in milliseconds
   */
  private trackSearchMetrics(
    _options: SearchOptionsInput,
    results: SearchResponseDto,
    duration: number,
  ): void {
    // Create metrics object
    const metrics = {
      query: _options.query,
      entityType: _options.entityType,
      resultCount: results.pagination.total,
      duration,
      timestamp: new Date(),
      enableNlp: _options.enableNlp,
      personalized: _options.personalized,
      filterCount: (_options.filters?.length || 0) + (_options.rangeFilters?.length || 0),
      experimentId: _options.experimentId,
    };

    // Add entity distribution if available
    if (results.entityDistribution) {
      metrics['entityDistribution'] = results.entityDistribution;
    }

    // Add relevance scores if available
    if (results.relevanceScores) {
      metrics['relevanceScores'] = results.relevanceScores;
    }

    // Emit search metrics event
    this.eventEmitter.emit('search.metrics', metrics);
  }

  /**
   * Track zero results rate
   * @param _options Search options
   */
  private trackZeroResultsRate(_options: SearchOptionsInput): void {
    // In a real implementation, we would track zero results rate over time
    // and alert if it exceeds the threshold
  }

  /**
   * Calculate overall relevance score
   * @param relevanceScores Relevance scores
   * @returns Overall relevance score
   */
  private calculateOverallRelevanceScore(relevanceScores: any): number {
    // Calculate weighted average of relevance scores
    const { products, merchants, brands } = relevanceScores;

    // Default weights
    const weights = {
      products: 0.6,
      merchants: 0.2,
      brands: 0.2,
    };

    // Calculate weighted sum
    let weightedSum = 0;
    let totalWeight = 0;

    if (products !== undefined) {
      weightedSum += products * weights.products;
      totalWeight += weights.products;
    }

    if (merchants !== undefined) {
      weightedSum += merchants * weights.merchants;
      totalWeight += weights.merchants;
    }

    if (brands !== undefined) {
      weightedSum += brands * weights.brands;
      totalWeight += weights.brands;
    }

    // Return weighted average or 0 if no scores available
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Get performance statistics
   * @param _period Period in minutes
   * @returns Performance statistics
   */
  async getPerformanceStats(_period = 60): Promise<PerformanceStats> {
    // In a real implementation, we would retrieve performance statistics
    // from a time-series database or metrics service

    // Return mock data for now
    return {
      averageDuration: 150,
      p95Duration: 450,
      p99Duration: 800,
      maxDuration: 1200,
      criticalCount: 5,
      warningCount: 25,
      totalSearches: 1000,
      timestamp: new Date(),
    };
  }

  /**
   * Get relevance statistics
   * @param _period Period in minutes
   * @returns Relevance statistics
   */
  async getRelevanceStats(_period = 60): Promise<RelevanceStats> {
    // In a real implementation, we would retrieve relevance statistics
    // from a time-series database or metrics service

    // Return mock data for now
    return {
      averageRelevance: 0.75,
      zeroResultsRate: 0.03,
      lowRelevanceRate: 0.12,
      entityDistribution: {
        products: 0.65,
        merchants: 0.2,
        brands: 0.15,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Get search health status
   * @returns Search health status
   */
  async getSearchHealthStatus(): Promise<SearchHealthStatus> {
    const performanceStats = await this.getPerformanceStats();
    const relevanceStats = await this.getRelevanceStats();

    // Determine health status
    const performanceStatus = this.determinePerformanceStatus(performanceStats);
    const relevanceStatus = this.determineRelevanceStatus(relevanceStats);

    // Overall status is the worst of the two
    const overallStatus =
      performanceStatus === 'critical' || relevanceStatus === 'critical'
        ? 'critical'
        : performanceStatus === 'warning' || relevanceStatus === 'warning'
          ? 'warning'
          : 'healthy';

    return {
      status: overallStatus,
      performance: {
        status: performanceStatus,
        stats: performanceStats,
      },
      relevance: {
        status: relevanceStatus,
        stats: relevanceStats,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Determine performance status
   * @param stats Performance statistics
   * @returns Performance status
   */
  private determinePerformanceStatus(stats: PerformanceStats): HealthStatus {
    if (stats.p95Duration > this.performanceThresholds.critical) {
      return 'critical';
    } else if (stats.p95Duration > this.performanceThresholds.warning) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  /**
   * Determine relevance status
   * @param stats Relevance statistics
   * @returns Relevance status
   */
  private determineRelevanceStatus(stats: RelevanceStats): HealthStatus {
    if (stats.zeroResultsRate > this.relevanceThresholds.zeroResults) {
      return 'critical';
    } else if (stats.lowRelevanceRate > this.relevanceThresholds.lowRelevance) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }
}

/**
 * Performance thresholds
 */
interface PerformanceThresholds {
  warning: number;
  critical: number;
}

/**
 * Relevance thresholds
 */
interface RelevanceThresholds {
  zeroResults: number;
  lowRelevance: number;
}

/**
 * Performance statistics
 */
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

/**
 * Relevance statistics
 */
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

/**
 * Health status
 */
type HealthStatus = 'healthy' | 'warning' | 'critical';

/**
 * Search health status
 */
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
