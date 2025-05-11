import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Represents the state of a circuit for a specific service/endpoint
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation, requests allowed
  OPEN = 'OPEN', // Circuit broken, requests immediately fail
  HALF_OPEN = 'HALF_OPEN', // Testing if service is back, allowing limited requests
}

/**
 * Circuit breaker for a specific service/endpoint
 */
interface CircuitData {
  // Current state of the circuit
  state: CircuitState;

  // Count of consecutive failures
  failureCount: number;

  // Timestamp of the last failure
  lastFailureTime: number;

  // Timestamp when we can try again
  nextAttemptTime: number;

  // Successful calls in half-open state
  successfulTestCalls: number;
}

/**
 * Circuit Breaker implementation for Shopify API calls
 *
 * Prevents cascading failures by failing fast when a service is unhealthy.
 * This implementation tracks circuits per merchant and per endpoint type.
 */
@Injectable()
export class ShopifyCircuitBreaker {
  private readonly logger = new Logger(ShopifyCircuitBreaker.name);
  private circuits: Map<string, CircuitData> = new Map();

  // Circuit breaker configuration
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenSuccessThreshold: number;

  constructor(private configService: ConfigService) {
    // Load configuration with defaults
    this.failureThreshold = configService.get('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5);
    this.resetTimeoutMs = configService.get('CIRCUIT_BREAKER_RESET_TIMEOUT_MS', 60000); // 1 minute
    this.halfOpenSuccessThreshold = configService.get(
      'CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD',
      3,
    );

    // Periodically clean up old circuit data
    setInterval(() => this.cleanupCircuits(), 3600000); // Every hour
  }

  /**
   * Execute an operation with circuit breaker protection
   *
   * @param circuitKey Unique identifier for this circuit (e.g., "store:endpoint")
   * @param operation Function to execute
   * @returns Promise with the operation result
   * @throws CircuitOpenError if the circuit is open
   */
  async executeWithCircuitBreaker<T>(circuitKey: string, operation: () => Promise<T>): Promise<T> {
    // Initialize circuit if it doesn't exist
    if (!this.circuits.has(circuitKey)) {
      this.initializeCircuit(circuitKey);
    }

    const circuit = this.circuits.get(circuitKey);

    // Check if circuit is OPEN
    if (circuit.state === CircuitState.OPEN) {
      // Check if it's time to try again
      if (Date.now() >= circuit.nextAttemptTime) {
        this.transitionToHalfOpen(circuitKey);
      } else {
        // Fast fail if circuit is open
        this.logger.warn(`Circuit ${circuitKey} is OPEN. Fast failing.`);
        throw new Error(`Circuit breaker open for ${circuitKey}`);
      }
    }

    try {
      // Execute the operation
      const result = await operation();

      // Handle success
      this.handleSuccess(circuitKey);

      return result;
    } catch (error) {
      // Handle failure
      this.handleFailure(circuitKey, error);
      throw error;
    }
  }

  /**
   * Initialize a new circuit
   */
  private initializeCircuit(circuitKey: string): void {
    this.circuits.set(circuitKey, {
      state: CircuitState.CLOSED,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successfulTestCalls: 0,
    });

    this.logger.debug(`Initialized circuit breaker for ${circuitKey}`);
  }

  /**
   * Handle a successful operation
   */
  private handleSuccess(circuitKey: string): void {
    const circuit = this.circuits.get(circuitKey);

    if (circuit.state === CircuitState.HALF_OPEN) {
      // In HALF_OPEN state, count successful calls
      circuit.successfulTestCalls++;

      if (circuit.successfulTestCalls >= this.halfOpenSuccessThreshold) {
        // If we've had enough successful calls, close the circuit
        this.transitionToClosed(circuitKey);
      }
    } else if (circuit.state === CircuitState.CLOSED) {
      // In CLOSED state, reset the failure count
      circuit.failureCount = 0;
    }
  }

  /**
   * Handle a failed operation
   */
  private handleFailure(circuitKey: string, error: any): void {
    const circuit = this.circuits.get(circuitKey);
    const now = Date.now();

    // Update failure information
    circuit.failureCount++;
    circuit.lastFailureTime = now;

    // Log the failure with details
    this.logger.warn(
      `Circuit ${circuitKey} failure: ${error.message}. ` +
        `Failure count: ${circuit.failureCount}/${this.failureThreshold}`,
    );

    if (circuit.state === CircuitState.CLOSED && circuit.failureCount >= this.failureThreshold) {
      // If we've had too many failures in CLOSED state, open the circuit
      this.transitionToOpen(circuitKey);
    } else if (circuit.state === CircuitState.HALF_OPEN) {
      // If we have a failure in HALF_OPEN state, go back to OPEN
      this.transitionToOpen(circuitKey);
    }
  }

  /**
   * Transition a circuit to OPEN state
   */
  private transitionToOpen(circuitKey: string): void {
    const circuit = this.circuits.get(circuitKey);

    circuit.state = CircuitState.OPEN;
    circuit.nextAttemptTime = Date.now() + this.resetTimeoutMs;

    // Use exponential backoff for retry times
    const failureFactor = Math.min(circuit.failureCount, 10); // Cap at 10x
    const backoffMultiplier = Math.pow(2, failureFactor - this.failureThreshold);
    if (backoffMultiplier > 1) {
      circuit.nextAttemptTime += this.resetTimeoutMs * backoffMultiplier;
    }

    this.logger.warn(
      `Circuit ${circuitKey} transitioned to OPEN. ` +
        `Will retry at ${new Date(circuit.nextAttemptTime).toISOString()}`,
    );
  }

  /**
   * Transition a circuit to HALF_OPEN state
   */
  private transitionToHalfOpen(circuitKey: string): void {
    const circuit = this.circuits.get(circuitKey);

    circuit.state = CircuitState.HALF_OPEN;
    circuit.successfulTestCalls = 0;

    this.logger.log(`Circuit ${circuitKey} transitioned to HALF_OPEN. Testing service health.`);
  }

  /**
   * Transition a circuit to CLOSED state
   */
  private transitionToClosed(circuitKey: string): void {
    const circuit = this.circuits.get(circuitKey);

    circuit.state = CircuitState.CLOSED;
    circuit.failureCount = 0;

    this.logger.log(`Circuit ${circuitKey} transitioned to CLOSED. Service appears healthy.`);
  }

  /**
   * Clean up old circuit data
   */
  private cleanupCircuits(): void {
    const now = Date.now();
    const oldCircuits = [];

    // Find circuits with no activity for 24 hours
    for (const [key, circuit] of this.circuits.entries()) {
      // If circuit is CLOSED and hasn't failed in 24 hours, clean it up
      if (
        circuit.state === CircuitState.CLOSED &&
        circuit.failureCount === 0 &&
        (now - circuit.lastFailureTime > 86400000 || circuit.lastFailureTime === 0)
      ) {
        oldCircuits.push(key);
      }
    }

    // Remove old circuits
    for (const key of oldCircuits) {
      this.circuits.delete(key);
    }

    if (oldCircuits.length > 0) {
      this.logger.debug(`Cleaned up ${oldCircuits.length} inactive circuits`);
    }
  }

  /**
   * Get the current state of a circuit
   */
  getCircuitState(circuitKey: string): CircuitState | undefined {
    return this.circuits.get(circuitKey)?.state;
  }

  /**
   * Get all circuit information (for monitoring)
   */
  getAllCircuits(): Array<{
    key: string;
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
  }> {
    const result = [];

    for (const [key, circuit] of this.circuits.entries()) {
      result.push({
        key,
        state: circuit.state,
        failureCount: circuit.failureCount,
        lastFailureTime: circuit.lastFailureTime,
        nextAttemptTime: circuit.nextAttemptTime,
      });
    }

    return result;
  }

  /**
   * Force a circuit to a specific state (for testing/admin purposes)
   */
  forceCircuitState(circuitKey: string, state: CircuitState): void {
    if (!this.circuits.has(circuitKey)) {
      this.initializeCircuit(circuitKey);
    }

    const _circuit = this.circuits.get(circuitKey);

    if (state === CircuitState.OPEN) {
      this.transitionToOpen(circuitKey);
    } else if (state === CircuitState.HALF_OPEN) {
      this.transitionToHalfOpen(circuitKey);
    } else {
      this.transitionToClosed(circuitKey);
    }

    this.logger.log(`Circuit ${circuitKey} manually forced to ${state}`);
  }
}
