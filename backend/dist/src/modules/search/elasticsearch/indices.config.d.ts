import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@common/services/logger.service';
export declare class IndicesConfigService {
    private readonly elasticsearchService;
    private readonly configService;
    private readonly logger;
    constructor(elasticsearchService: ElasticsearchService, configService: ConfigService, logger: LoggerService);
    initIndices(): Promise<void>;
    private createProductIndex;
    private createMerchantIndex;
    private seedSuggestionsIndex;
    private createSuggestionsIndex;
    private createBrandIndex;
}
