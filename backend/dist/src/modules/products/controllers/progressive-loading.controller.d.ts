import { ProgressiveLoadingService } from '../services/progressive-loading.service';
import {
  ProgressiveLoadingDto,
  ProgressiveLoadingResponseDto,
} from '../dto/progressive-loading.dto';
import { DataNormalizationService } from '../services/data-normalization.service';
export declare class ProgressiveLoadingController {
  private readonly progressiveLoadingService;
  private readonly dataNormalizationService;
  private readonly logger;
  constructor(
    progressiveLoadingService: ProgressiveLoadingService,
    dataNormalizationService: DataNormalizationService,
  );
  loadProgressively(options: ProgressiveLoadingDto): Promise<ProgressiveLoadingResponseDto<any>>;
  prefetchProducts(cursor?: string, limit?: number): Promise<string[]>;
  loadMoreWithExclusions(
    options: ProgressiveLoadingDto,
  ): Promise<ProgressiveLoadingResponseDto<any>>;
}
