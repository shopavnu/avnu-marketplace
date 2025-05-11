import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
export declare class SearchCacheService implements OnModuleInit {
  private cacheManager;
  private readonly configService;
  private readonly enabled;
  private readonly defaultTtl;
  private readonly logger;
  constructor(cacheManager: Cache, configService: ConfigService);
  onModuleInit(): any;
  private generateCacheKey;
  private shouldCache;
  getCachedResults(options: SearchOptionsInput): Promise<SearchResponseDto | null>;
  cacheResults(options: SearchOptionsInput, results: SearchResponseDto): Promise<void>;
  invalidateCache(pattern: string): Promise<void>;
}
