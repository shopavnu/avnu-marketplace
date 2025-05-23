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
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = exports.CircuitState = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor(eventEmitter, configService) {
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.lastFailureTime = 0;
        this.resetTimer = null;
        this.monitorTimer = null;
        this.options = {
            failureThreshold: this.configService.get('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
            resetTimeout: this.configService.get('CIRCUIT_BREAKER_RESET_TIMEOUT', 30000),
            maxRetries: this.configService.get('CIRCUIT_BREAKER_MAX_RETRIES', 3),
            retryDelay: this.configService.get('CIRCUIT_BREAKER_RETRY_DELAY', 1000),
            monitorInterval: this.configService.get('CIRCUIT_BREAKER_MONITOR_INTERVAL', 10000),
        };
        this.startMonitoring();
    }
    async execute(operation, fallback) {
        if (this.state === CircuitState.OPEN) {
            this.logger.debug('Circuit is OPEN, using fallback');
            if (fallback) {
                return fallback();
            }
            throw new Error('Circuit is open and no fallback provided');
        }
        if (this.state === CircuitState.HALF_OPEN) {
            this.logger.debug('Circuit is HALF-OPEN, testing service');
        }
        return this.executeWithRetries(operation, fallback);
    }
    async executeWithRetries(operation, fallback) {
        let lastError;
        for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
            try {
                const result = await operation();
                if (this.state === CircuitState.HALF_OPEN) {
                    this.closeCircuit();
                }
                return result;
            }
            catch (error) {
                lastError = error;
                this.logger.debug(`Operation failed (attempt ${attempt + 1}/${this.options.maxRetries}): ${error.message}`);
                this.recordFailure();
                if (this.state === CircuitState.OPEN) {
                    break;
                }
                if (attempt < this.options.maxRetries - 1) {
                    await this.delay(this.options.retryDelay);
                }
            }
        }
        if (fallback) {
            return fallback();
        }
        throw lastError;
    }
    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.options.failureThreshold && this.state === CircuitState.CLOSED) {
            this.openCircuit();
        }
    }
    openCircuit() {
        this.state = CircuitState.OPEN;
        this.logger.warn(`Circuit OPENED after ${this.failures} consecutive failures`);
        this.eventEmitter.emit('circuit.open', { service: 'redis', failures: this.failures });
        this.resetTimer = setTimeout(() => this.halfOpenCircuit(), this.options.resetTimeout);
    }
    halfOpenCircuit() {
        this.state = CircuitState.HALF_OPEN;
        this.logger.log('Circuit switched to HALF-OPEN state, testing service');
        this.eventEmitter.emit('circuit.half-open', { service: 'redis' });
    }
    closeCircuit() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.logger.log('Circuit CLOSED, normal operation resumed');
        this.eventEmitter.emit('circuit.closed', { service: 'redis' });
        if (this.resetTimer) {
            clearTimeout(this.resetTimer);
            this.resetTimer = null;
        }
    }
    startMonitoring() {
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
        }
        this.monitorTimer = setInterval(() => this.checkHealth(), this.options.monitorInterval);
        this.logger.log(`Circuit breaker monitoring started (interval: ${this.options.monitorInterval}ms)`);
    }
    async checkHealth() {
        if (this.state === CircuitState.OPEN) {
            this.logger.debug('Checking Redis health...');
            this.eventEmitter.emit('circuit.healthcheck.request', { service: 'redis' });
        }
    }
    handleHealthCheckSuccess() {
        if (this.state === CircuitState.OPEN) {
            this.logger.log('Health check successful, switching to HALF-OPEN');
            this.halfOpenCircuit();
        }
    }
    handleHealthCheckFailure() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.logger.warn('Health check failed, keeping circuit OPEN');
            this.openCircuit();
        }
    }
    getState() {
        return this.state;
    }
    getFailureCount() {
        return this.failures;
    }
    getMetrics() {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime) : null,
            options: this.options,
        };
    }
    reset() {
        this.closeCircuit();
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    onModuleDestroy() {
        if (this.resetTimer) {
            clearTimeout(this.resetTimer);
        }
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
        }
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
__decorate([
    (0, event_emitter_1.OnEvent)('circuit.healthcheck.success'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CircuitBreakerService.prototype, "handleHealthCheckSuccess", null);
__decorate([
    (0, event_emitter_1.OnEvent)('circuit.healthcheck.failure'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CircuitBreakerService.prototype, "handleHealthCheckFailure", null);
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map