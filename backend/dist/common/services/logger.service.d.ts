import { LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}
export declare class LoggerService implements NestLoggerService {
  private configService;
  private context?;
  private logLevel;
  constructor(configService: ConfigService);
  setContext(context: string): this;
  error(message: any, trace?: string, context?: string): void;
  warn(message: any, context?: string): void;
  log(message: any, context?: string): void;
  debug(message: any, context?: string): void;
  verbose(message: any, context?: string): void;
  private formatMessage;
}
