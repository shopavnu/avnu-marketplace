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
var WebhookRetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRetryService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const webhook_registry_1 = require("./webhook-registry");
const webhook_monitor_service_1 = require("./webhook-monitor.service");
let WebhookRetryService = WebhookRetryService_1 = class WebhookRetryService {
    constructor(webhookRegistry, webhookMonitor) {
        this.webhookRegistry = webhookRegistry;
        this.webhookMonitor = webhookMonitor;
        this.logger = new common_1.Logger(WebhookRetryService_1.name);
        this.defaultRetryConfig = {
            maxRetries: 5,
            initialDelayMs: 60000,
            backoffMultiplier: 2,
            maxDelayMs: 3600000,
        };
        this.scheduledRetries = new Map();
    }
    scheduleRetry(webhookId, context, retryCount = 0, config = this.defaultRetryConfig) {
        try {
            const event = this.webhookMonitor.getWebhookEvent(webhookId);
            if (!event) {
                this.logger.warn(`Cannot schedule retry for unknown webhook ${webhookId}`);
                return;
            }
            if (retryCount >= config.maxRetries) {
                this.logger.warn(`Webhook ${webhookId} for topic ${context.topic} has exceeded maximum retry attempts (${config.maxRetries})`);
                return;
            }
            const delayMs = Math.min(config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount), config.maxDelayMs);
            this.logger.log(`Scheduling retry #${retryCount + 1} for webhook ${webhookId} in ${delayMs / 1000} seconds`);
            if (this.scheduledRetries.has(webhookId)) {
                clearTimeout(this.scheduledRetries.get(webhookId));
            }
            const timeout = setTimeout(async () => {
                await this.executeRetry(webhookId, context, retryCount + 1, config);
            }, delayMs);
            this.scheduledRetries.set(webhookId, timeout);
        }
        catch (error) {
            this.logger.error(`Failed to schedule retry for webhook ${webhookId}: ${error.message}`, error.stack);
        }
    }
    async executeRetry(webhookId, context, retryCount, config) {
        try {
            this.logger.log(`Executing retry #${retryCount} for webhook ${webhookId}`);
            const result = await this.webhookRegistry.process(context);
            this.webhookMonitor.recordRetryAttempt(webhookId, result.success, result.success ? undefined : result.message);
            if (!result.success && retryCount < config.maxRetries) {
                this.scheduleRetry(webhookId, context, retryCount, config);
            }
            else if (!result.success) {
                this.logger.warn(`Webhook ${webhookId} for ${context.shop} failed after maximum retries (${config.maxRetries})`);
            }
            else {
                this.logger.log(`Successfully processed webhook ${webhookId} on retry #${retryCount}`);
                this.scheduledRetries.delete(webhookId);
            }
        }
        catch (error) {
            this.logger.error(`Error during webhook retry: ${error.message}`, error.stack);
            this.webhookMonitor.recordRetryAttempt(webhookId, false, `Exception during retry: ${error.message}`);
            if (retryCount < config.maxRetries) {
                this.scheduleRetry(webhookId, context, retryCount, config);
            }
        }
    }
    async retryAllFailedWebhooks() {
        try {
            const failedEvents = this.webhookMonitor.getFailedWebhookEvents();
            this.logger.log(`Retrying ${failedEvents.length} failed webhooks`);
            for (const event of failedEvents) {
                if (event.retryCount >= this.defaultRetryConfig.maxRetries) {
                    this.logger.warn(`Skipping webhook ${event.id} as it already exceeded maximum retries (${this.defaultRetryConfig.maxRetries})`);
                    continue;
                }
                const context = {
                    topic: event.topic,
                    shop: event.shop,
                    payload: {},
                    webhookId: event.id,
                    timestamp: new Date(),
                };
                this.scheduleRetry(event.id, context, event.retryCount, {
                    ...this.defaultRetryConfig,
                    initialDelayMs: 5000 * (event.retryCount + 1),
                });
            }
            this.logger.log(`Scheduled retries for ${failedEvents.length} webhooks`);
        }
        catch (error) {
            this.logger.error(`Failed to retry all failed webhooks: ${error.message}`, error.stack);
        }
    }
    async scheduledRetryFailedWebhooks() {
        this.logger.log('Running scheduled retry of failed webhooks');
        await this.retryAllFailedWebhooks();
    }
};
exports.WebhookRetryService = WebhookRetryService;
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookRetryService.prototype, "scheduledRetryFailedWebhooks", null);
exports.WebhookRetryService = WebhookRetryService = WebhookRetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [webhook_registry_1.WebhookRegistry,
        webhook_monitor_service_1.WebhookMonitorService])
], WebhookRetryService);
//# sourceMappingURL=webhook-retry.service.js.map