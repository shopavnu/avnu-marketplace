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
var ResilientCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResilientCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const circuit_breaker_service_1 = require("./circuit-breaker.service");
const NodeCache = require('node-cache');
let ResilientCacheService = ResilientCacheService_1 = class ResilientCacheService {
    constructor(primaryCache, circuitBreaker, eventEmitter, configService) {
        this.primaryCache = primaryCache;
        this.circuitBreaker = circuitBreaker;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.logger = new common_1.Logger(ResilientCacheService_1.name);
        this.fallbackCache = new NodeCache({
            stdTTL: this.configService.get('FALLBACK_CACHE_TTL', 300),
            checkperiod: 60,
            maxKeys: this.configService.get('FALLBACK_CACHE_MAX_KEYS', 1000),
        });
        this.defaultTTL = this.configService.get('REDIS_TTL', 3600);
        this.logger.log('Resilient cache service initialized with Redis primary and in-memory fallback');
    }
    async get(key) {
        return this.circuitBreaker.execute(async () => {
            const value = (await this.primaryCache.get(key));
            if (value !== undefined && value !== null) {
                this.fallbackCache.set(key, value);
            }
            return value || null;
        }, async () => {
            const value = this.fallbackCache.get(key);
            this.logger.debug(`Fallback cache ${value ? 'hit' : 'miss'} for key: ${key}`);
            return value || null;
        });
    }
    async set(key, value, ttl = this.defaultTTL) {
        try {
            this.fallbackCache.set(key, value, ttl);
            await this.circuitBreaker.execute(async () => {
                await this.primaryCache.set(key, value, ttl);
            }, async () => {
                this.logger.debug(`Primary cache unavailable, using fallback for key: ${key}`);
            });
        }
        catch (error) {
            this.logger.error(`Failed to set cache key ${key}: ${error.message}`, error.stack);
        }
    }
    async del(key) {
        try {
            this.fallbackCache.del(key);
            await this.circuitBreaker.execute(async () => {
                await this.primaryCache.del(key);
            }, async () => {
                this.logger.debug(`Primary cache unavailable, deleted from fallback only for key: ${key}`);
            });
        }
        catch (error) {
            this.logger.error(`Failed to delete cache key ${key}: ${error.message}`, error.stack);
        }
    }
    async reset() {
        try {
            this.fallbackCache.flushAll();
            await this.circuitBreaker.execute(async () => {
                await this.primaryCache.reset();
            }, async () => {
                this.logger.debug('Primary cache unavailable, reset fallback cache only');
            });
        }
        catch (error) {
            this.logger.error(`Failed to reset cache: ${error.message}`, error.stack);
        }
    }
    getStats() {
        const fallbackStats = this.fallbackCache.getStats();
        return {
            fallback: {
                keys: this.fallbackCache.keys().length,
                hits: fallbackStats.hits,
                misses: fallbackStats.misses,
                ksize: fallbackStats.ksize,
                vsize: fallbackStats.vsize,
            },
            circuitBreaker: this.circuitBreaker.getMetrics(),
        };
    }
};
exports.ResilientCacheService = ResilientCacheService;
exports.ResilientCacheService = ResilientCacheService = ResilientCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, circuit_breaker_service_1.CircuitBreakerService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], ResilientCacheService);
//# sourceMappingURL=resilient-cache.service.js.map