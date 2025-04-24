import { HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@common/services/logger.service';
export declare class HealthController {
    private health;
    private http;
    private db;
    private memory;
    private configService;
    private logger;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, configService: ConfigService, logger: LoggerService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
