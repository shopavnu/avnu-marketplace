import { OnModuleInit } from '@nestjs/common';
import { IndicesConfigService } from './indices.config';
import { LoggerService } from '@common/services/logger.service';
export declare class ElasticsearchConfigModule implements OnModuleInit {
    private readonly indicesConfigService;
    private readonly logger;
    constructor(indicesConfigService: IndicesConfigService, logger: LoggerService);
    onModuleInit(): Promise<void>;
}
