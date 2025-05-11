'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
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
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyStructuredLogger = exports.LogLevel = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const winston = __importStar(require('winston'));
var LogLevel;
(function (LogLevel) {
  LogLevel['ERROR'] = 'error';
  LogLevel['WARN'] = 'warn';
  LogLevel['INFO'] = 'info';
  LogLevel['DEBUG'] = 'debug';
  LogLevel['VERBOSE'] = 'verbose';
})(LogLevel || (exports.LogLevel = LogLevel = {}));
let ShopifyStructuredLogger = class ShopifyStructuredLogger {
  constructor(configService) {
    this.configService = configService;
    const isProduction = configService.get('NODE_ENV') === 'production';
    const logLevel = configService.get('LOG_LEVEL', 'info');
    const format = isProduction
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...metadata }) => {
            const metaStr = Object.keys(metadata).length
              ? `\n${JSON.stringify(metadata, null, 2)}`
              : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
          }),
        );
    this.logger = winston.createLogger({
      level: logLevel,
      format,
      defaultMeta: { service: 'shopify-integration' },
      transports: [new winston.transports.Console()],
    });
  }
  error(message, metadata = {}) {
    this.logWithLevel(LogLevel.ERROR, message, metadata);
  }
  warn(message, metadata = {}) {
    this.logWithLevel(LogLevel.WARN, message, metadata);
  }
  log(message, metadata = {}) {
    this.logWithLevel(LogLevel.INFO, message, metadata);
  }
  debug(message, metadata = {}) {
    this.logWithLevel(LogLevel.DEBUG, message, metadata);
  }
  verbose(message, metadata = {}) {
    this.logWithLevel(LogLevel.VERBOSE, message, metadata);
  }
  logWebhookEvent(topic, shopDomain, webhookId, metadata = {}) {
    this.log(`Webhook received: ${topic}`, {
      shopDomain,
      webhookId,
      component: 'webhook',
      action: 'received',
      resource: topic,
      ...metadata,
    });
  }
  logApiRequest(endpoint, shopDomain, metadata = {}) {
    this.debug(`API Request: ${endpoint}`, {
      shopDomain,
      endpoint,
      component: 'api',
      action: 'request',
      ...metadata,
    });
  }
  logApiResponse(endpoint, shopDomain, status, duration, metadata = {}) {
    const logLevel = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.logWithLevel(logLevel, `API Response: ${endpoint} (${status})`, {
      shopDomain,
      endpoint,
      httpStatusCode: status,
      duration,
      component: 'api',
      action: 'response',
      ...metadata,
    });
  }
  logBulkOperation(action, bulkOperationId, shopDomain, metadata = {}) {
    this.log(`Bulk operation ${action}`, {
      shopDomain,
      bulkOperationId,
      component: 'bulkOperation',
      action,
      ...metadata,
    });
  }
  logWithLevel(level, message, metadata = {}) {
    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([_, v]) => v !== undefined),
    );
    if (!cleanMetadata.requestId) {
      cleanMetadata.requestId = this.generateRequestId();
    }
    this.logger.log(level, message, cleanMetadata);
  }
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
};
exports.ShopifyStructuredLogger = ShopifyStructuredLogger;
exports.ShopifyStructuredLogger = ShopifyStructuredLogger = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
  ShopifyStructuredLogger,
);
//# sourceMappingURL=structured-logger.js.map
