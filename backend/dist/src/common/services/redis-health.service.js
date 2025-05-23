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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RedisHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisHealthService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
let RedisHealthService = RedisHealthService_1 = class RedisHealthService {
    constructor(cacheManager, eventEmitter, configService) {
        this.cacheManager = cacheManager;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.logger = new common_1.Logger(RedisHealthService_1.name);
        this.healthCheckKey = 'health:redis:check';
        this.healthCheckValue = 'OK';
        this.healthCheckTTL = this.configService.get('REDIS_HEALTH_CHECK_TTL', 60);
    }
    async onModuleInit() {
        await this.checkHealth();
    }
    async checkHealth() {
        try {
            await this.cacheManager.set(this.healthCheckKey, this.healthCheckValue, this.healthCheckTTL);
            const value = await this.cacheManager.get(this.healthCheckKey);
            const isHealthy = value === this.healthCheckValue;
            if (isHealthy) {
                this.logger.debug('Redis health check passed');
                this.eventEmitter.emit('redis.health.success');
            }
            else {
                this.logger.warn('Redis health check failed: value mismatch');
                this.eventEmitter.emit('redis.health.failure');
            }
            return isHealthy;
        }
        catch (error) {
            this.logger.error(`Redis health check failed: ${error.message}`, error.stack);
            this.eventEmitter.emit('redis.health.failure', error);
            return false;
        }
    }
    async handleHealthCheckRequest(payload) {
        if (payload.service === 'redis') {
            const isHealthy = await this.checkHealth();
            if (isHealthy) {
                this.eventEmitter.emit('circuit.healthcheck.success', { service: 'redis' });
            }
            else {
                this.eventEmitter.emit('circuit.healthcheck.failure', { service: 'redis' });
            }
        }
    }
    async ping() {
        try {
            const store = this.cacheManager.store;
            if (store && store.getClient) {
                const client = store.getClient();
                if (client && client.ping) {
                    const result = await client.ping();
                    return result === 'PONG';
                }
            }
            return this.checkHealth();
        }
        catch (error) {
            this.logger.error(`Redis ping failed: ${error.message}`, error.stack);
            return false;
        }
    }
};
exports.RedisHealthService = RedisHealthService;
__decorate([
    (0, event_emitter_1.OnEvent)('circuit.healthcheck.request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RedisHealthService.prototype, "handleHealthCheckRequest", null);
exports.RedisHealthService = RedisHealthService = RedisHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], RedisHealthService);
//# sourceMappingURL=redis-health.service.js.map