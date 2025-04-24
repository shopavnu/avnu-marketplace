import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@common/services/logger.service';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: LoggerService);
    catch(exception: unknown, host: ArgumentsHost): void;
    private generateErrorRef;
}
