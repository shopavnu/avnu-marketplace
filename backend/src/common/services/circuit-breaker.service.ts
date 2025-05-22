import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation, requests pass through
  OPEN = 'OPEN', // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN', // Testing if the service is back online
}

/**
 * Configuration for a circuit breaker
 */
export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time in ms before trying to close circuit again
  maxRetries: number; // Maximum number of retries for a single operation
  retryDelay: number; // Delay between retries in ms
  monitorInterval: number; // Interval to check service health in ms
}

/**
 * Circuit breaker implementation for Redis
 * Monitors Redis connection and automatically switches to fallback strategy when Redis is unavailable
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime: number = 0;
  private resetTimer: NodeJS.Timeout | null = null;
  private monitorTimer: NodeJS.Timeout | null = null;
  private readonly options: CircuitBreakerOptions;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    // Load configuration from environment variables with defaults
    this.options = {
      failureThreshold: this.configService.get<number>('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
      resetTimeout: this.configService.get<number>('CIRCUIT_BREAKER_RESET_TIMEOUT', 30000), // 30 seconds
      maxRetries: this.configService.get<number>('CIRCUIT_BREAKER_MAX_RETRIES', 3),
      retryDelay: this.configService.get<number>('CIRCUIT_BREAKER_RETRY_DELAY', 1000), // 1 second
      monitorInterval: this.configService.get<number>('CIRCUIT_BREAKER_MONITOR_INTERVAL', 10000), // 10 seconds
    };

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Execute a function with circuit breaker protection
   * @param operation The function to execute
   * @param fallback Optional fallback function to execute if circuit is open
   * @returns The result of the operation or fallback
   */
  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // If circuit is open, fail fast
    if (this.state === CircuitState.OPEN) {
      this.logger.debug('Circuit is OPEN, using fallback');
      if (fallback) {
        return fallback();
      }
      throw new Error('Circuit is open and no fallback provided');
    }

    // If circuit is half-open, only allow one request through to test
    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.debug('Circuit is HALF-OPEN, testing service');
    }

    // Try to execute the operation with retries
    return this.executeWithRetries(operation, fallback);
  }

  /**
   * Execute an operation with retries
   */
  private async executeWithRetries<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    let lastError: Error;

    // Try the operation up to maxRetries times
    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        const result = await operation();

        // If successful and in HALF_OPEN state, close the circuit
        if (this.state === CircuitState.HALF_OPEN) {
          this.closeCircuit();
        }

        return result;
      } catch (error) {
        lastError = error;
        this.logger.debug(
          `Operation failed (attempt ${attempt + 1}/${this.options.maxRetries}): ${error.message}`,
        );

        // Record the failure
        this.recordFailure();

        // If circuit is now open, break out of the retry loop
        if (this.state === CircuitState.OPEN) {
          break;
        }

        // Wait before retrying
        if (attempt < this.options.maxRetries - 1) {
          await this.delay(this.options.retryDelay);
        }
      }
    }

    // If we've exhausted all retries and have a fallback, use it
    if (fallback) {
      return fallback();
    }

    // Otherwise, throw the last error
    throw lastError;
  }

  /**
   * Record a failure and potentially open the circuit
   */
  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    // If we've hit the threshold and the circuit is closed, open it
    if (this.failures >= this.options.failureThreshold && this.state === CircuitState.CLOSED) {
      this.openCircuit();
    }
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.logger.warn(`Circuit OPENED after ${this.failures} consecutive failures`);

    // Emit circuit open event
    this.eventEmitter.emit('circuit.open', { service: 'redis', failures: this.failures });

    // Schedule circuit reset
    this.resetTimer = setTimeout(() => this.halfOpenCircuit(), this.options.resetTimeout);
  }

  /**
   * Set circuit to half-open state to test if service is back
   */
  private halfOpenCircuit(): void {
    this.state = CircuitState.HALF_OPEN;
    this.logger.log('Circuit switched to HALF-OPEN state, testing service');

    // Emit circuit half-open event
    this.eventEmitter.emit('circuit.half-open', { service: 'redis' });
  }

  /**
   * Close the circuit (normal operation)
   */
  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.logger.log('Circuit CLOSED, normal operation resumed');

    // Emit circuit closed event
    this.eventEmitter.emit('circuit.closed', { service: 'redis' });

    // Clear any pending reset timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  /**
   * Start monitoring service health
   */
  private startMonitoring(): void {
    // Clear any existing monitor
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }

    // Set up regular health check
    this.monitorTimer = setInterval(() => this.checkHealth(), this.options.monitorInterval);
    this.logger.log(
      `Circuit breaker monitoring started (interval: ${this.options.monitorInterval}ms)`,
    );
  }

  /**
   * Check service health
   */
  private async checkHealth(): Promise<void> {
    // Only check health if circuit is open
    if (this.state === CircuitState.OPEN) {
      this.logger.debug('Checking Redis health...');

      // Emit health check event - the Redis service can listen for this and respond
      this.eventEmitter.emit('circuit.healthcheck.request', { service: 'redis' });
    }
  }

  /**
   * Handle successful health check
   */
  @OnEvent('circuit.healthcheck.success')
  handleHealthCheckSuccess(): void {
    if (this.state === CircuitState.OPEN) {
      this.logger.log('Health check successful, switching to HALF-OPEN');
      this.halfOpenCircuit();
    }
  }

  /**
   * Handle failed health check
   */
  @OnEvent('circuit.healthcheck.failure')
  handleHealthCheckFailure(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.warn('Health check failed, keeping circuit OPEN');
      this.openCircuit();
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures;
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime) : null,
      options: this.options,
    };
  }

  /**
   * Reset the circuit breaker (for testing)
   */
  reset(): void {
    this.closeCircuit();
  }

  /**
   * Utility method to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up on service destruction
   */
  onModuleDestroy() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
  }
}
