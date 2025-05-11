import { ProductQueryOptimizerService } from '../services/product-query-optimizer.service';
export declare class QueryCacheWarmupTask {
  private readonly queryOptimizerService;
  private readonly logger;
  constructor(queryOptimizerService: ProductQueryOptimizerService);
  warmupQueryCache(): Promise<void>;
}
