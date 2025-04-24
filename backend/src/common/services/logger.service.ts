import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Log levels for the application
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Centralized logger service for the application
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private logLevel: LogLevel;

  constructor(private configService: ConfigService) {
    // Set log level based on environment configuration
    const configLogLevel = this.configService.get<string>('LOG_LEVEL', 'info').toLowerCase();

    switch (configLogLevel) {
      case 'error':
        this.logLevel = LogLevel.ERROR;
        break;
      case 'warn':
        this.logLevel = LogLevel.WARN;
        break;
      case 'info':
        this.logLevel = LogLevel.INFO;
        break;
      case 'debug':
        this.logLevel = LogLevel.DEBUG;
        break;
      default:
        this.logLevel = LogLevel.INFO;
    }
  }

  /**
   * Set the context for the logger
   * @param context The context to set
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param trace Optional stack trace
   * @param context Optional context override
   */
  error(message: any, trace?: string, context?: string) {
    if (this.logLevel >= LogLevel.ERROR) {
      const currentContext = context || this.context;
      const timestamp = new Date().toISOString();

      console.error(
        JSON.stringify({
          level: 'error',
          context: currentContext,
          timestamp,
          message: this.formatMessage(message),
          trace,
        }),
      );
    }
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param context Optional context override
   */
  warn(message: any, context?: string) {
    if (this.logLevel >= LogLevel.WARN) {
      const currentContext = context || this.context;
      const timestamp = new Date().toISOString();

      console.warn(
        JSON.stringify({
          level: 'warn',
          context: currentContext,
          timestamp,
          message: this.formatMessage(message),
        }),
      );
    }
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param context Optional context override
   */
  log(message: any, context?: string) {
    if (this.logLevel >= LogLevel.INFO) {
      const currentContext = context || this.context;
      const timestamp = new Date().toISOString();

      console.log(
        JSON.stringify({
          level: 'info',
          context: currentContext,
          timestamp,
          message: this.formatMessage(message),
        }),
      );
    }
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param context Optional context override
   */
  debug(message: any, context?: string) {
    if (this.logLevel >= LogLevel.DEBUG) {
      const currentContext = context || this.context;
      const timestamp = new Date().toISOString();

      console.debug(
        JSON.stringify({
          level: 'debug',
          context: currentContext,
          timestamp,
          message: this.formatMessage(message),
        }),
      );
    }
  }

  /**
   * Log a verbose message (alias for debug)
   * @param message The message to log
   * @param context Optional context override
   */
  verbose(message: any, context?: string) {
    this.debug(message, context);
  }

  /**
   * Format the message for logging
   * @param message The message to format
   * @returns The formatted message
   */
  private formatMessage(message: any): string {
    if (typeof message === 'object') {
      try {
        return JSON.stringify(message);
      } catch (e) {
        return `[Object] ${message}`;
      }
    }
    return message;
  }
}
