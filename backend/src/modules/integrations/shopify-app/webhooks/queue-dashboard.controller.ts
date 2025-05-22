import { Controller, Get, Inject as _Inject, Param, Post, UseGuards } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ShopifyStructuredLogger } from '../utils/structured-logger';

/**
 * Controller for the queue dashboard API
 *
 * Provides endpoints for:
 * - Getting queue stats and metrics
 * - Monitoring queue health
 * - Retrying failed jobs
 * - Cleaning up completed jobs
 */
@Controller('admin/queue-api')
@UseGuards(JwtAuthGuard) // Secure all endpoints with JWT auth
export class QueueDashboardController {
  private readonly logger: ShopifyStructuredLogger;

  constructor(
    @InjectQueue('shopify-webhooks') private webhookQueue: Queue,
    logger: ShopifyStructuredLogger,
  ) {
    this.logger = logger;
  }

  /**
   * Get queue statistics and metrics
   */
  @Get('stats')
  async getQueueStats() {
    try {
      // Get queue counts for different states
      const [jobCounts, activeJobs, _completedJobs, failedJobs, _delayedJobs, waitingJobs] =
        await Promise.all([
          this.webhookQueue.getJobCounts(),
          this.webhookQueue.getActive(),
          this.webhookQueue.getCompleted(0, 10), // Latest 10 completed
          this.webhookQueue.getFailed(0, 10), // Latest 10 failed
          this.webhookQueue.getDelayed(),
          this.webhookQueue.getWaiting(),
        ]);

      // Calculate processing rate (jobs/minute)
      // This is an approximation based on completed jobs in the last minute
      const oneMinuteAgo = Date.now() - 60_000;
      const recentCompletedJobs = await this.webhookQueue.getJobs(['completed'], 0, 1000, true);

      const jobsInLastMinute = recentCompletedJobs.filter(
        job => job.finishedOn && job.finishedOn > oneMinuteAgo,
      ).length;

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
          stuckJobsCount: activeJobs.filter(
            j => j.timestamp < Date.now() - 300_000, // Stuck for more than 5 minutes
          ).length,
          oldestJob: waitingJobs.length > 0 ? waitingJobs[0].timestamp : null,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting queue stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get merchant-specific queue metrics
   */
  @Get('merchant/:merchantId')
  async getMerchantQueueStats(@Param('merchantId') merchantId: string) {
    try {
      // Get jobs for this merchant by status
      const [activeJobs, waitingJobs, failedJobs, completedJobs] = await Promise.all([
        this.webhookQueue.getJobs(['active']),
        this.webhookQueue.getJobs(['waiting']),
        this.webhookQueue.getJobs(['failed']),
        this.webhookQueue.getJobs(['completed'], 0, 100), // Limit to last 100 completed
      ]);

      // Filter jobs for this merchant by status
      const merchantActiveJobs = activeJobs.filter(
        job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId,
      );

      const merchantWaitingJobs = waitingJobs.filter(
        job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId,
      );

      const merchantFailedJobs = failedJobs.filter(
        job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId,
      );

      const merchantCompletedJobs = completedJobs.filter(
        job => job.data.merchantId === merchantId || job.data.metadata?.merchantId === merchantId,
      );

      // Combine for total merchant jobs
      const merchantJobs = [
        ...merchantActiveJobs,
        ...merchantWaitingJobs,
        ...merchantFailedJobs,
        ...merchantCompletedJobs,
      ];

      // Count jobs by status
      const status = {
        active: merchantActiveJobs.length,
        waiting: merchantWaitingJobs.length,
        failed: merchantFailedJobs.length,
        completed: merchantCompletedJobs.length,
      };

      // Count jobs by topic
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
    } catch (error) {
      this.logger.error(`Error getting merchant queue stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry a failed job
   */
  @Post('retry/:jobId')
  async retryJob(@Param('jobId') jobId: string) {
    try {
      const job = await this.webhookQueue.getJob(jobId);

      if (!job) {
        return { success: false, message: 'Job not found' };
      }

      // Retry the job
      await job.retry();

      this.logger.log(`Manually retried job ${jobId}`, {
        jobId,
        topic: job.data.topic,
        shop: job.data.shop,
      });

      return { success: true, message: 'Job queued for retry' };
    } catch (error) {
      this.logger.error(`Error retrying job ${jobId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up old completed jobs to free up Redis memory
   */
  @Post('cleanup')
  async cleanupOldJobs() {
    try {
      // Clean up jobs completed more than 1 day ago
      const oneDayAgo = Date.now() - 86400000;

      // Get completed jobs older than 1 day
      const oldJobs = await this.webhookQueue.getJobs(['completed'], 0, 10000, true);

      const jobsToRemove = oldJobs.filter(job => job.finishedOn && job.finishedOn < oneDayAgo);

      // Remove each job
      await Promise.all(jobsToRemove.map(job => job.remove()));

      this.logger.log(`Cleaned up ${jobsToRemove.length} old completed jobs`);

      return {
        success: true,
        message: `Cleaned up ${jobsToRemove.length} old completed jobs`,
      };
    } catch (error) {
      this.logger.error(`Error cleaning up old jobs: ${error.message}`);
      throw error;
    }
  }
}
