import { ConfigService } from '@nestjs/config';
export declare enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}
export declare class ShopifyCircuitBreaker {
  private configService;
  private readonly logger;
  private circuits;
  private readonly failureThreshold;
  private readonly resetTimeoutMs;
  private readonly halfOpenSuccessThreshold;
  constructor(configService: ConfigService);
  executeWithCircuitBreaker<T>(circuitKey: string, operation: () => Promise<T>): Promise<T>;
  private initializeCircuit;
  private handleSuccess;
  private handleFailure;
  private transitionToOpen;
  private transitionToHalfOpen;
  private transitionToClosed;
  private cleanupCircuits;
  getCircuitState(circuitKey: string): CircuitState | undefined;
  getAllCircuits(): Array<{
    key: string;
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
  }>;
  forceCircuitState(circuitKey: string, state: CircuitState): void;
}
