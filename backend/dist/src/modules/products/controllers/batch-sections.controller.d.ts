import { BatchSectionsService } from '../services/batch-sections.service';
import { BatchSectionsRequestDto, BatchSectionsResponseDto } from '../dto/batch-sections.dto';
export declare class BatchSectionsController {
  private readonly batchSectionsService;
  private readonly logger;
  constructor(batchSectionsService: BatchSectionsService);
  loadBatchSections(batchRequest: BatchSectionsRequestDto): Promise<BatchSectionsResponseDto>;
  loadPersonalizedBatchSections(
    batchRequest: BatchSectionsRequestDto,
  ): Promise<BatchSectionsResponseDto>;
}
