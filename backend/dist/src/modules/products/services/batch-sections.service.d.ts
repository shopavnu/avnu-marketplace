import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../products.service';
import { DataNormalizationService } from './data-normalization.service';
import { BatchSectionsRequestDto, BatchSectionsResponseDto } from '../dto/batch-sections.dto';
export declare class BatchSectionsService {
  private readonly productRepository;
  private readonly productsService;
  private readonly dataNormalizationService;
  private readonly logger;
  constructor(
    productRepository: Repository<Product>,
    productsService: ProductsService,
    dataNormalizationService: DataNormalizationService,
  );
  loadBatchSections(batchRequest: BatchSectionsRequestDto): Promise<BatchSectionsResponseDto>;
  private loadSection;
}
