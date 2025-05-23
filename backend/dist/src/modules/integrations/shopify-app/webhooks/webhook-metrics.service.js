"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookMetricsService = void 0;
const common_1 = require("@nestjs/common");
let WebhookMetricsService = WebhookMetricsService_1 = class WebhookMetricsService {
    constructor() {
        this.logger = new common_1.Logger(WebhookMetricsService_1.name);
        this.metrics = new Map();
        this.shopMetrics = new Map();
        this.globalMetrics = {
            count: 0,
            totalProcessingTime: 0,
            successCount: 0,
            failureCount: 0,
        };
    }
    recordWebhookProcessing(topic, shop, processingTimeMs, success) {
        try {
            this.updateTopicMetrics(topic, processingTimeMs, success);
            this.updateShopMetrics(shop, topic, processingTimeMs, success);
            this.updateGlobalMetrics(processingTimeMs, success);
            if (processingTimeMs > 1000) {
                this.logger.warn(`Slow webhook processing for ${topic} from ${shop}: ${processingTimeMs}ms`);
            }
        }
        catch (error) {
            this.logger.error(`Error recording webhook metrics: ${error.message}`, error.stack);
        }
    }
    getTopicMetrics(topic) {
        return this.metrics.get(topic) || null;
    }
    getAllTopicMetrics() {
        return new Map(this.metrics);
    }
    getShopMetrics(shop) {
        return this.shopMetrics.get(shop) || null;
    }
    getGlobalMetrics() {
        return { ...this.globalMetrics };
    }
    getAverageProcessingTime(topic) {
        const metrics = this.metrics.get(topic);
        if (!metrics || metrics.count === 0) {
            return 0;
        }
        return metrics.totalProcessingTime / metrics.count;
    }
    getSuccessRate(topic) {
        const metrics = this.metrics.get(topic);
        if (!metrics || metrics.count === 0) {
            return 0;
        }
        return (metrics.successCount / metrics.count) * 100;
    }
    getGlobalSuccessRate() {
        if (this.globalMetrics.count === 0) {
            return 0;
        }
        return (this.globalMetrics.successCount / this.globalMetrics.count) * 100;
    }
    resetAllMetrics() {
        this.metrics.clear();
        this.shopMetrics.clear();
        this.globalMetrics = {
            count: 0,
            totalProcessingTime: 0,
            successCount: 0,
            failureCount: 0,
        };
        this.logger.log('All webhook metrics have been reset');
    }
    generateMetricsReport() {
        const topicMetrics = {};
        for (const [topic, data] of this.metrics.entries()) {
            const averageTime = data.count > 0 ? data.totalProcessingTime / data.count : 0;
            const successRate = data.count > 0 ? (data.successCount / data.count) * 100 : 0;
            topicMetrics[topic] = {
                count: data.count,
                averageProcessingTimeMs: Math.round(averageTime),
                successRate: Math.round(successRate * 100) / 100,
                failures: data.failureCount,
                lastProcessedAt: data.lastProcessedAt?.toISOString(),
            };
        }
        const globalAverageTime = this.globalMetrics.count > 0
            ? this.globalMetrics.totalProcessingTime / this.globalMetrics.count
            : 0;
        const globalSuccessRate = this.globalMetrics.count > 0
            ? (this.globalMetrics.successCount / this.globalMetrics.count) * 100
            : 0;
        return {
            global: {
                totalCount: this.globalMetrics.count,
                averageProcessingTimeMs: Math.round(globalAverageTime),
                successRate: Math.round(globalSuccessRate * 100) / 100,
                failures: this.globalMetrics.failureCount,
            },
            byTopic: topicMetrics,
            generatedAt: new Date().toISOString(),
        };
    }
    updateTopicMetrics(topic, processingTimeMs, success) {
        const existingMetrics = this.metrics.get(topic) || {
            count: 0,
            totalProcessingTime: 0,
            successCount: 0,
            failureCount: 0,
        };
        existingMetrics.count += 1;
        existingMetrics.totalProcessingTime += processingTimeMs;
        existingMetrics.lastProcessedAt = new Date();
        if (success) {
            existingMetrics.successCount += 1;
        }
        else {
            existingMetrics.failureCount += 1;
        }
        this.metrics.set(topic, existingMetrics);
    }
    updateShopMetrics(shop, topic, processingTimeMs, success) {
        if (!this.shopMetrics.has(shop)) {
            this.shopMetrics.set(shop, new Map());
        }
        const shopMetricsMap = this.shopMetrics.get(shop);
        const existingMetrics = shopMetricsMap.get(topic) || {
            count: 0,
            totalProcessingTime: 0,
            successCount: 0,
            failureCount: 0,
        };
        existingMetrics.count += 1;
        existingMetrics.totalProcessingTime += processingTimeMs;
        existingMetrics.lastProcessedAt = new Date();
        if (success) {
            existingMetrics.successCount += 1;
        }
        else {
            existingMetrics.failureCount += 1;
        }
        shopMetricsMap.set(topic, existingMetrics);
    }
    updateGlobalMetrics(processingTimeMs, success) {
        this.globalMetrics.count += 1;
        this.globalMetrics.totalProcessingTime += processingTimeMs;
        if (success) {
            this.globalMetrics.successCount += 1;
        }
        else {
            this.globalMetrics.failureCount += 1;
        }
    }
};
exports.WebhookMetricsService = WebhookMetricsService;
exports.WebhookMetricsService = WebhookMetricsService = WebhookMetricsService_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookMetricsService);
//# sourceMappingURL=webhook-metrics.service.js.map