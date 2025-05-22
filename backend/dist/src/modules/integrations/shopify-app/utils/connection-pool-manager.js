'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var ShopifyConnectionPoolManager_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyConnectionPoolManager = void 0;
const common_1 = require('@nestjs/common');
const axios_1 = __importDefault(require('axios'));
const config_1 = require('@nestjs/config');
let ShopifyConnectionPoolManager =
  (ShopifyConnectionPoolManager_1 = class ShopifyConnectionPoolManager {
    constructor(configService) {
      this.configService = configService;
      this.logger = new common_1.Logger(ShopifyConnectionPoolManager_1.name);
      this.connectionsByStore = new Map();
      this.DEFAULT_MAX_CALLS = 40;
      this.DEFAULT_WINDOW_MS = 20000;
      this.PRIORITY = {
        CRITICAL: 100,
        HIGH: 75,
        MEDIUM: 50,
        LOW: 25,
        BACKGROUND: 10,
      };
      setInterval(() => this.processPendingRequests(), 100);
    }
    async executeRequest(shopDomain, config, priority = this.PRIORITY.MEDIUM) {
      if (!this.connectionsByStore.has(shopDomain)) {
        this.initializeConnectionForStore(shopDomain);
      }
      const connection = this.connectionsByStore.get(shopDomain);
      if (
        connection.currentCalls < connection.maxCalls &&
        !connection.throttled &&
        connection.pendingRequests.length === 0
      ) {
        return this.executeRequestImmediately(shopDomain, config);
      }
      return new Promise((resolve, reject) => {
        connection.pendingRequests.push({
          config,
          resolve,
          reject,
          priority,
          timestamp: Date.now(),
        });
        connection.pendingRequests.sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return a.timestamp - b.timestamp;
        });
        this.logger.debug(
          `Request queued for ${shopDomain} (priority: ${priority}). ` +
            `Queue size: ${connection.pendingRequests.length}`,
        );
      });
    }
    processPendingRequests() {
      for (const [shopDomain, connection] of this.connectionsByStore.entries()) {
        if (connection.pendingRequests.length === 0) {
          continue;
        }
        if (connection.throttled) {
          if (new Date() >= connection.resetAt) {
            connection.throttled = false;
            connection.currentCalls = 0;
            this.logger.log(`Connection unthrottled for ${shopDomain}`);
          } else {
            continue;
          }
        }
        if (connection.currentCalls >= connection.maxCalls) {
          continue;
        }
        const nextRequest = connection.pendingRequests.shift();
        if (nextRequest) {
          this.executeRequestImmediately(shopDomain, nextRequest.config)
            .then(response => nextRequest.resolve(response))
            .catch(error => nextRequest.reject(error));
          this.logger.debug(
            `Processing queued request for ${shopDomain}. ` +
              `Remaining in queue: ${connection.pendingRequests.length}`,
          );
        }
      }
    }
    async executeRequestImmediately(shopDomain, config) {
      const connection = this.connectionsByStore.get(shopDomain);
      try {
        connection.currentCalls++;
        const response = await connection.client(config);
        this.updateRateLimitInfo(shopDomain, response);
        return response;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          this.handleRateLimitExceeded(shopDomain, error.response);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              this.executeRequest(shopDomain, config).then(resolve).catch(reject);
            }, 1000);
          });
        }
        throw error;
      }
    }
    initializeConnectionForStore(shopDomain) {
      const client = axios_1.default.create({
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      this.connectionsByStore.set(shopDomain, {
        currentCalls: 0,
        maxCalls: this.DEFAULT_MAX_CALLS,
        resetAt: new Date(Date.now() + this.DEFAULT_WINDOW_MS),
        pendingRequests: [],
        throttled: false,
        client,
      });
      this.logger.log(`Initialized connection pool for store: ${shopDomain}`);
    }
    updateRateLimitInfo(shopDomain, response) {
      const connection = this.connectionsByStore.get(shopDomain);
      const rateLimitHeader = response.headers['x-shopify-shop-api-call-limit'];
      if (rateLimitHeader) {
        const [current, max] = rateLimitHeader.split('/').map(Number);
        connection.currentCalls = current;
        connection.maxCalls = max;
        const secondsToReset = Math.ceil(current / 2);
        connection.resetAt = new Date(Date.now() + secondsToReset * 1000);
        if (current >= 0.8 * max) {
          this.logger.warn(
            `Approaching rate limit for ${shopDomain}: ${current}/${max} (${Math.round((current / max) * 100)}%)`,
          );
          if (!connection.throttled) {
            setTimeout(() => {
              connection.throttled = false;
            }, 1000);
          }
        }
        if (current >= 0.95 * max) {
          this.logger.warn(`Rate limit critical for ${shopDomain}: ${current}/${max}`);
          connection.throttled = true;
        }
      }
    }
    handleRateLimitExceeded(shopDomain, response) {
      const connection = this.connectionsByStore.get(shopDomain);
      const retryAfter = response.headers['retry-after']
        ? parseInt(response.headers['retry-after'], 10) * 1000
        : 5000;
      this.logger.error(
        `Rate limit exceeded for ${shopDomain}. ` + `Throttling for ${retryAfter / 1000} seconds.`,
      );
      connection.throttled = true;
      connection.resetAt = new Date(Date.now() + retryAfter);
    }
    getConnectionState(shopDomain) {
      return this.connectionsByStore.get(shopDomain);
    }
    getPriorities() {
      return this.PRIORITY;
    }
  });
exports.ShopifyConnectionPoolManager = ShopifyConnectionPoolManager;
exports.ShopifyConnectionPoolManager =
  ShopifyConnectionPoolManager =
  ShopifyConnectionPoolManager_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      ShopifyConnectionPoolManager,
    );
//# sourceMappingURL=connection-pool-manager.js.map
