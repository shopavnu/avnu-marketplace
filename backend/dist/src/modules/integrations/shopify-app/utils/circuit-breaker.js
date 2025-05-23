"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShopifyCircuitBreaker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyCircuitBreaker = exports.CircuitState = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
let ShopifyCircuitBreaker = ShopifyCircuitBreaker_1 = class ShopifyCircuitBreaker {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ShopifyCircuitBreaker_1.name);
        this.circuits = new Map();
        this.failureThreshold = configService.get('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5);
        this.resetTimeoutMs = configService.get('CIRCUIT_BREAKER_RESET_TIMEOUT_MS', 60000);
        this.halfOpenSuccessThreshold = configService.get('CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD', 3);
        setInterval(() => this.cleanupCircuits(), 3600000);
    }
    async executeWithCircuitBreaker(circuitKey, operation) {
        if (!this.circuits.has(circuitKey)) {
            this.initializeCircuit(circuitKey);
        }
        const circuit = this.circuits.get(circuitKey);
        if (circuit.state === CircuitState.OPEN) {
            if (Date.now() >= circuit.nextAttemptTime) {
                this.transitionToHalfOpen(circuitKey);
            }
            else {
                this.logger.warn(`Circuit ${circuitKey} is OPEN. Fast failing.`);
                throw new Error(`Circuit breaker open for ${circuitKey}`);
            }
        }
        try {
            const result = await operation();
            this.handleSuccess(circuitKey);
            return result;
        }
        catch (error) {
            this.handleFailure(circuitKey, error);
            throw error;
        }
    }
    initializeCircuit(circuitKey) {
        this.circuits.set(circuitKey, {
            state: CircuitState.CLOSED,
            failureCount: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0,
            successfulTestCalls: 0,
        });
        this.logger.debug(`Initialized circuit breaker for ${circuitKey}`);
    }
    handleSuccess(circuitKey) {
        const circuit = this.circuits.get(circuitKey);
        if (circuit.state === CircuitState.HALF_OPEN) {
            circuit.successfulTestCalls++;
            if (circuit.successfulTestCalls >= this.halfOpenSuccessThreshold) {
                this.transitionToClosed(circuitKey);
            }
        }
        else if (circuit.state === CircuitState.CLOSED) {
            circuit.failureCount = 0;
        }
    }
    handleFailure(circuitKey, error) {
        const circuit = this.circuits.get(circuitKey);
        const now = Date.now();
        circuit.failureCount++;
        circuit.lastFailureTime = now;
        this.logger.warn(`Circuit ${circuitKey} failure: ${error.message}. ` +
            `Failure count: ${circuit.failureCount}/${this.failureThreshold}`);
        if (circuit.state === CircuitState.CLOSED && circuit.failureCount >= this.failureThreshold) {
            this.transitionToOpen(circuitKey);
        }
        else if (circuit.state === CircuitState.HALF_OPEN) {
            this.transitionToOpen(circuitKey);
        }
    }
    transitionToOpen(circuitKey) {
        const circuit = this.circuits.get(circuitKey);
        circuit.state = CircuitState.OPEN;
        circuit.nextAttemptTime = Date.now() + this.resetTimeoutMs;
        const failureFactor = Math.min(circuit.failureCount, 10);
        const backoffMultiplier = Math.pow(2, failureFactor - this.failureThreshold);
        if (backoffMultiplier > 1) {
            circuit.nextAttemptTime += this.resetTimeoutMs * backoffMultiplier;
        }
        this.logger.warn(`Circuit ${circuitKey} transitioned to OPEN. ` +
            `Will retry at ${new Date(circuit.nextAttemptTime).toISOString()}`);
    }
    transitionToHalfOpen(circuitKey) {
        const circuit = this.circuits.get(circuitKey);
        circuit.state = CircuitState.HALF_OPEN;
        circuit.successfulTestCalls = 0;
        this.logger.log(`Circuit ${circuitKey} transitioned to HALF_OPEN. Testing service health.`);
    }
    transitionToClosed(circuitKey) {
        const circuit = this.circuits.get(circuitKey);
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
        this.logger.log(`Circuit ${circuitKey} transitioned to CLOSED. Service appears healthy.`);
    }
    cleanupCircuits() {
        const now = Date.now();
        const oldCircuits = [];
        for (const [key, circuit] of this.circuits.entries()) {
            if (circuit.state === CircuitState.CLOSED &&
                circuit.failureCount === 0 &&
                (now - circuit.lastFailureTime > 86400000 || circuit.lastFailureTime === 0)) {
                oldCircuits.push(key);
            }
        }
        for (const key of oldCircuits) {
            this.circuits.delete(key);
        }
        if (oldCircuits.length > 0) {
            this.logger.debug(`Cleaned up ${oldCircuits.length} inactive circuits`);
        }
    }
    getCircuitState(circuitKey) {
        return this.circuits.get(circuitKey)?.state;
    }
    getAllCircuits() {
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
    forceCircuitState(circuitKey, state) {
        if (!this.circuits.has(circuitKey)) {
            this.initializeCircuit(circuitKey);
        }
        const _circuit = this.circuits.get(circuitKey);
        if (state === CircuitState.OPEN) {
            this.transitionToOpen(circuitKey);
        }
        else if (state === CircuitState.HALF_OPEN) {
            this.transitionToHalfOpen(circuitKey);
        }
        else {
            this.transitionToClosed(circuitKey);
        }
        this.logger.log(`Circuit ${circuitKey} manually forced to ${state}`);
    }
};
exports.ShopifyCircuitBreaker = ShopifyCircuitBreaker;
exports.ShopifyCircuitBreaker = ShopifyCircuitBreaker = ShopifyCircuitBreaker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShopifyCircuitBreaker);
//# sourceMappingURL=circuit-breaker.js.map