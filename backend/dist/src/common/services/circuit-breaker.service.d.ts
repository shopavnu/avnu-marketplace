import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeout: number;
    maxRetries: number;
    retryDelay: number;
    monitorInterval: number;
}
export declare class CircuitBreakerService {
    private readonly eventEmitter;
    private readonly configService;
    private readonly logger;
    private state;
    private failures;
    private lastFailureTime;
    private resetTimer;
    private monitorTimer;
    private readonly options;
    constructor(eventEmitter: EventEmitter2, configService: ConfigService);
    execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    private executeWithRetries;
    private recordFailure;
    private openCircuit;
    private halfOpenCircuit;
    private closeCircuit;
    private startMonitoring;
    private checkHealth;
    handleHealthCheckSuccess(): void;
    handleHealthCheckFailure(): void;
    getState(): CircuitState;
    getFailureCount(): number;
    getMetrics(): {
        state: CircuitState;
        failures: number;
        lastFailureTime: Date;
        options: CircuitBreakerOptions;
    };
    reset(): void;
    private delay;
    onModuleDestroy(): void;
}
