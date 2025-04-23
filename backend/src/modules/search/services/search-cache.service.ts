import {
  Injectable,
  Inject,
  OnModuleInit,
  Logger, // Ensure Logger is imported
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
// Removed incorrect LoggerService import
import { SearchCacheException } from '../../../common/exceptions/search-exceptions'; // Use relative path
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
// Import kept for potential future use
import * as _crypto from 'crypto';

// ... (rest of imports)

@Injectable()
export class SearchCacheService implements OnModuleInit {
  private readonly enabled: boolean;
  private readonly defaultTtl: number;
  // Updated logger property
  private readonly logger = new Logger(SearchCacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    // Removed logger injection parameter
  ) {
    this.enabled = this.configService.get<boolean>('SEARCH_CACHE_ENABLED', true);
    this.defaultTtl = this.configService.get<number>('SEARCH_CACHE_TTL_SECONDS', 300);
    // Removed logger context creation line

    if (!this.enabled) {
      this.logger.warn('Search cache is disabled by configuration.');
    }
  }

  onModuleInit(): any {
    // No specific initialization needed for now
  }

  /**
   * Generate a cache key for search options
   * @param options Search options
   * @returns Cache key
   */
  private generateCacheKey(options: SearchOptionsInput): string {
    try {
      // Create a normalized version of the options for consistent key generation
      const keyParts = [
        `query:${options.query}`,
        `page:${options.page}`,
        `limit:${options.limit}`,
        `entity:${options.entityType || 'all'}`,
      ];

      // Add filters if present
      if (options.filters) {
        const filterKeys = Object.keys(options.filters).sort();
        for (const key of filterKeys) {
          const value = options.filters[key];
          if (Array.isArray(value)) {
            keyParts.push(`${key}:[${value.sort().join(',')}]`);
          } else {
            keyParts.push(`${key}:${value}`);
          }
        }
      }

      // Add sorting if present
      if (options.sort) {
        keyParts.push(`sort:${options.sort}`);
      }

      // Add NLP flag if present
      if (options.enableNlp) {
        keyParts.push('nlp:true');
      }

      return `search:${options.entityType || 'all'}:${keyParts.join('|')}`;
    } catch (error) {
      this.logger.error(`Error generating cache key: ${error.message}`, error.stack);
      // Return a fallback key that won't collide with normal keys
      return `search:error:${Date.now()}`;
    }
  }

  /**
   * Check if search results should be cached
   * @param options Search options
   * @returns Whether to cache the results
   */
  private shouldCache(options: SearchOptionsInput): boolean {
    if (!this.enabled) {
      return false;
    }

    // Don't cache personalized searches
    if (options.personalized) {
      return false;
    }

    // Don't cache searches with experiment IDs
    if (options.experimentId) {
      return false;
    }

    // Cache searches with at least 2 characters
    return !options.query || options.query.length >= 2;
  }

  /**
   * Get cached search results
   * @param options Search options
   * @returns Cached search results or null if not found
   */
  async getCachedResults(options: SearchOptionsInput): Promise<SearchResponseDto | null> {
    try {
      if (!this.enabled) {
        return null;
      }

      // Don't cache personalized searches
      if (options.personalized) {
        return null;
      }

      const cacheKey = this.generateCacheKey(options);
      const cachedResults = await this.cacheManager.get<SearchResponseDto>(cacheKey);

      if (cachedResults) {
        this.logger.debug(`Cache hit for search: ${options.query}`);
      } else {
        this.logger.debug(`Cache miss for search: ${options.query}`);
      }

      return cachedResults || null;
    } catch (error) {
      this.logger.error(`Error retrieving cached results: ${error.message}`, error.stack);
      // Don't throw the error - cache failures should not break the search flow
      return null;
    }
  }

  /**
   * Cache search results
   * @param options Search options
   * @param results Search results
   */
  async cacheResults(options: SearchOptionsInput, results: SearchResponseDto): Promise<void> {
    try {
      if (!this.enabled) {
        return;
      }

      // Don't cache personalized searches
      if (options.personalized) {
        return;
      }

      // Don't cache zero result searches
      if (results.pagination.total === 0) {
        return;
      }

      const cacheKey = this.generateCacheKey(options);
      await this.cacheManager.set(cacheKey, results, this.defaultTtl);
      this.logger.debug(`Cached search results for: ${options.query}`);
    } catch (error) {
      this.logger.error(`Error caching search results: ${error.message}`, error.stack);
      // Don't throw the error - cache failures should not break the search flow
    }
  }

  /**
   * Invalidate cache for a specific entity type
   * @param pattern Cache pattern
   */
  async invalidateCache(pattern: string): Promise<void> {
    try {
      if (!this.enabled) {
        return;
      }

      await this.cacheManager.del(pattern);
      this.logger.debug(`Invalidated cache entries matching pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`, error.stack);
      throw new SearchCacheException(`Failed to invalidate cache: ${error.message}`);
    }
  }
}
