import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { DataNormalizationService } from './data-normalization.service';
import {
  ProgressiveLoadingDto,
  ProgressiveLoadingResponseDto,
} from '../dto/progressive-loading.dto';
export declare class ProgressiveLoadingService {
  private readonly productRepository;
  private readonly dataNormalizationService;
  private readonly logger;
  constructor(
    productRepository: Repository<Product>,
    dataNormalizationService: DataNormalizationService,
  );
  loadProgressively(
    options: ProgressiveLoadingDto,
  ): Promise<ProgressiveLoadingResponseDto<Product>>;
  prefetchProducts(cursor?: string, limit?: number): Promise<string[]>;
}
