import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from './circuit-breaker.service';
export declare class ResilientCacheService {
  private readonly primaryCache;
  private readonly circuitBreaker;
  private readonly eventEmitter;
  private readonly configService;
  private readonly logger;
  private readonly fallbackCache;
  private readonly defaultTTL;
  constructor(
    primaryCache: any,
    circuitBreaker: CircuitBreakerService,
    eventEmitter: EventEmitter2,
    configService: ConfigService,
  );
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  reset(): Promise<void>;
  getStats(): {
    fallback: {
      keys: any;
      hits: any;
      misses: any;
      ksize: any;
      vsize: any;
    };
    circuitBreaker: {
      state: import('./circuit-breaker.service').CircuitState;
      failures: number;
      lastFailureTime: Date;
      options: import('./circuit-breaker.service').CircuitBreakerOptions;
    };
  };
}
