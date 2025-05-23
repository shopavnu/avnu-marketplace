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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueDashboardController = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const structured_logger_1 = require("../utils/structured-logger");
let QueueDashboardController = class QueueDashboardController {
    constructor(webhookQueue, logger) {
        this.webhookQueue = webhookQueue;
        this.logger = logger;
    }
    async getQueueStats() {
        try {
            const [jobCounts, activeJobs, _completedJobs, failedJobs, _delayedJobs, waitingJobs] = await Promise.all([
                this.webhookQueue.getJobCounts(),
                this.webhookQueue.getActive(),
                this.webhookQueue.getCompleted(0, 10),
                this.webhookQueue.getFailed(0, 10),
                this.webhookQueue.getDelayed(),
                this.webhookQueue.getWaiting(),
            ]);
            const oneMinuteAgo = Date.now() - 60_000;
            const recentCompletedJobs = await this.webhookQueue.getJobs(['completed'], 0, 1000, true);
            const jobsInLastMinute = recentCompletedJobs.filter(job => job.finishedOn && job.finishedOn > oneMinuteAgo).length;
            return {
                counts: jobCounts,
                processingRate: jobsInLastMinute,
                activeJobs: activeJobs.map(job => ({
                    id: job.id,
                    topic: job.data.topic,
                    shop: job.data.shop,
                    attemptsMade: job.attemptsMade,
                    timestamp: job.timestamp,
                })),
                failedJobs: failedJobs.map(job => ({
                    id: job.id,
                    topic: job.data.topic,
                    shop: job.data.shop,
                    attemptsMade: job.attemptsMade,
                    stacktrace: job.stacktrace,
                    failedReason: job.failedReason,
                })),
                queueHealth: {
                    isHealthy: jobCounts.failed < 100 && activeJobs.length < 1000,
                    stuckJobsCount: activeJobs.filter(j => j.timestamp < Date.now() - 300_000).length,
                    oldestJob: waitingJobs.length > 0 ? waitingJobs[0].timestamp : null,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting queue stats: ${error.message}`);
            throw error;
        }
    }
    async getMerchantQueueStats(merchantId) {
        try {
            const [activeJobs, waitingJobs, failedJobs, completedJobs] = await Promise.all([
                this.webhookQueue.getJobs(['active']),
                this.webhookQueue.getJobs(['waiting']),
                this.webhookQueue.getJobs(['failed']),
                this.webhookQueue.getJobs(['completed'], 0, 100),
            ]);
            const merchantActiveJobs = activeJobs.filter(job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId);
            const merchantWaitingJobs = waitingJobs.filter(job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId);
            const merchantFailedJobs = failedJobs.filter(job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId);
            const merchantCompletedJobs = completedJobs.filter(job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId);
            const merchantJobs = [
                ...merchantActiveJobs,
                ...merchantWaitingJobs,
                ...merchantFailedJobs,
                ...merchantCompletedJobs,
            ];
            const status = {
                active: merchantActiveJobs.length,
                waiting: merchantWaitingJobs.length,
                failed: merchantFailedJobs.length,
                completed: merchantCompletedJobs.length,
            };
            const topics = merchantJobs.reduce((acc, job) => {
                const topic = job.data.topic;
                acc[topic] = (acc[topic] || 0) + 1;
                return acc;
            }, {});
            return {
                merchantId,
                totalJobs: merchantJobs.length,
                status,
                topics,
                recentFailed: merchantJobs
                    .filter(job => job.failedReason)
                    .slice(0, 5)
                    .map(job => ({
                    id: job.id,
                    topic: job.data.topic,
                    failedReason: job.failedReason,
                    timestamp: job.timestamp,
                })),
            };
        }
        catch (error) {
            this.logger.error(`Error getting merchant queue stats: ${error.message}`);
            throw error;
        }
    }
    async retryJob(jobId) {
        try {
            const job = await this.webhookQueue.getJob(jobId);
            if (!job) {
                return { success: false, message: 'Job not found' };
            }
            await job.retry();
            this.logger.log(`Manually retried job ${jobId}`, {
                jobId,
                topic: job.data.topic,
                shop: job.data.shop,
            });
            return { success: true, message: 'Job queued for retry' };
        }
        catch (error) {
            this.logger.error(`Error retrying job ${jobId}: ${error.message}`);
            throw error;
        }
    }
    async cleanupOldJobs() {
        try {
            const oneDayAgo = Date.now() - 86400000;
            const oldJobs = await this.webhookQueue.getJobs(['completed'], 0, 10000, true);
            const jobsToRemove = oldJobs.filter(job => job.finishedOn && job.finishedOn < oneDayAgo);
            await Promise.all(jobsToRemove.map(job => job.remove()));
            this.logger.log(`Cleaned up ${jobsToRemove.length} old completed jobs`);
            return {
                success: true,
                message: `Cleaned up ${jobsToRemove.length} old completed jobs`,
            };
        }
        catch (error) {
            this.logger.error(`Error cleaning up old jobs: ${error.message}`);
            throw error;
        }
    }
};
exports.QueueDashboardController = QueueDashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueDashboardController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId'),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QueueDashboardController.prototype, "getMerchantQueueStats", null);
__decorate([
    (0, common_1.Post)('retry/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QueueDashboardController.prototype, "retryJob", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueDashboardController.prototype, "cleanupOldJobs", null);
exports.QueueDashboardController = QueueDashboardController = __decorate([
    (0, common_1.Controller)('admin/queue-api'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, bull_1.InjectQueue)('shopify-webhooks')),
    __metadata("design:paramtypes", [Object, structured_logger_1.ShopifyStructuredLogger])
], QueueDashboardController);
//# sourceMappingURL=queue-dashboard.controller.js.map