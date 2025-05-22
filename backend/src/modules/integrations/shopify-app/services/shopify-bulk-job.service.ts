import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  IsNull as _IsNull,
  MoreThanOrEqual as _MoreThanOrEqual,
  LessThan,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  ShopifyBulkOperationJob,
  BulkOperationJobStatus,
} from '../entities/shopify-bulk-operation-job.entity';

/**
 * Service for managing Shopify bulk operation jobs
 *
 * This service provides background job monitoring, automatic cleanup,
 * and status tracking for long-running Shopify bulk operations.
 */
@Injectable()
export class ShopifyBulkJobService {
  private readonly logger = new Logger(ShopifyBulkJobService.name);

  constructor(
    @InjectRepository(ShopifyBulkOperationJob)
    private readonly jobRepository: Repository<ShopifyBulkOperationJob>,
  ) {}

  /**
   * Create a new bulk operation job
   */
  async createJob(
    merchantId: string,
    bulkOperationId: string,
    description: string,
    query: string,
    metadata?: Record<string, any>,
    connectionId?: string,
  ): Promise<ShopifyBulkOperationJob> {
    try {
      const job = new ShopifyBulkOperationJob();
      job.merchantId = merchantId;
      job.shopifyBulkOperationId = bulkOperationId;
      job.description = description;
      job.query = query;
      job.status = BulkOperationJobStatus.CREATED;
      job.metadata = metadata || {};
      job.connectionId = connectionId;

      const savedJob = await this.jobRepository.save(job);
      this.logger.log(`Created new bulk operation job ${savedJob.id} for merchant ${merchantId}`);

      return savedJob;
    } catch (error) {
      this.logger.error(`Failed to create bulk operation job for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Update the status of a job
   */
  async updateJobStatus(
    jobId: string,
    status: BulkOperationJobStatus,
    statusMessage?: string,
    additionalData?: Partial<ShopifyBulkOperationJob>,
  ): Promise<ShopifyBulkOperationJob> {
    try {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Update job status and any additional data
      job.status = status;
      job.statusMessage = statusMessage || job.statusMessage;

      if (status === BulkOperationJobStatus.COMPLETED) {
        job.completedAt = new Date();
      }

      // Apply any additional updates
      if (additionalData) {
        Object.assign(job, additionalData);
      }

      // Save the updated job
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Updated bulk operation job ${jobId} to status ${status}`);

      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to update job status for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Find a job by its ID
   */
  async findJobById(jobId: string): Promise<ShopifyBulkOperationJob | null> {
    try {
      return await this.jobRepository.findOne({
        where: { id: jobId },
        relations: ['connection'],
      });
    } catch (error) {
      this.logger.error(`Failed to find job with ID ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Find jobs by merchant ID with pagination
   *
   * Uses cursor-based pagination for better performance with large datasets
   */
  async findJobsByMerchantId(
    merchantId: string,
    status?: BulkOperationJobStatus | BulkOperationJobStatus[],
    limit = 20,
    cursor?: string,
    direction: 'forward' | 'backward' = 'backward',
  ): Promise<{
    jobs: ShopifyBulkOperationJob[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  }> {
    try {
      // Start building query
      let query = this.jobRepository
        .createQueryBuilder('job')
        .where('job.merchantId = :merchantId', { merchantId });

      // Apply status filter
      if (status) {
        if (Array.isArray(status)) {
          query = query.andWhere('job.status IN (:...statuses)', { statuses: status });
        } else {
          query = query.andWhere('job.status = :status', { status });
        }
      }

      // Apply cursor-based pagination
      if (cursor) {
        const cursorJob = await this.jobRepository.findOne({ where: { id: cursor } });

        if (cursorJob) {
          if (direction === 'forward') {
            query = query.andWhere('job.createdAt > :createdAt', {
              createdAt: cursorJob.createdAt,
            });
          } else {
            query = query.andWhere('job.createdAt < :createdAt', {
              createdAt: cursorJob.createdAt,
            });
          }
        }
      }

      // Set order by and limit
      query = query
        .orderBy('job.createdAt', direction === 'forward' ? 'ASC' : 'DESC')
        .take(limit + 1); // Fetch one more to check if there are more pages

      // Execute the query
      const jobs = await query.getMany();

      // Determine if there are more pages
      const hasMore = jobs.length > limit;
      if (hasMore) {
        jobs.pop(); // Remove the extra job
      }

      // For 'backward' direction, we need to reverse the order to display newest first
      if (direction === 'backward') {
        jobs.reverse();
      }

      // Prepare response
      const response = {
        jobs,
        hasNextPage: direction === 'forward' ? hasMore : Boolean(cursor),
        hasPreviousPage: direction === 'backward' ? hasMore : Boolean(cursor),
        startCursor: jobs.length > 0 ? jobs[0].id : undefined,
        endCursor: jobs.length > 0 ? jobs[jobs.length - 1].id : undefined,
      };

      return response;
    } catch (error) {
      this.logger.error(`Failed to find jobs for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Run automatic cleanup of completed and failed jobs older than a specified period
   *
   * This runs once a day at midnight
   */
  @Cron('0 0 * * *')
  async cleanupOldJobs(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Remove completed jobs older than 30 days
      const completedResult = await this.jobRepository.delete({
        status: BulkOperationJobStatus.COMPLETED,
        completedAt: LessThan(thirtyDaysAgo),
      });

      // Remove failed jobs older than 30 days
      const failedResult = await this.jobRepository.delete({
        status: BulkOperationJobStatus.FAILED,
        updatedAt: LessThan(thirtyDaysAgo),
      });

      this.logger.log(
        `Cleaned up ${completedResult.affected || 0} completed jobs and ${
          failedResult.affected || 0
        } failed jobs older than 30 days`,
      );
    } catch (error) {
      this.logger.error('Failed to clean up old jobs:', error);
    }
  }

  /**
   * Find stalled jobs (RUNNING jobs that haven't been updated recently)
   * and mark them as TIMED_OUT
   *
   * This runs every hour
   */
  @Cron('0 * * * *')
  async findStalledJobs(): Promise<void> {
    try {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

      // Find running jobs that haven't been updated in 3 hours
      const stalledJobs = await this.jobRepository.find({
        where: {
          status: BulkOperationJobStatus.RUNNING,
          updatedAt: LessThan(threeHoursAgo),
        },
      });

      if (stalledJobs.length > 0) {
        this.logger.log(`Found ${stalledJobs.length} stalled bulk operation jobs`);

        // Mark stalled jobs as TIMED_OUT
        for (const job of stalledJobs) {
          await this.updateJobStatus(
            job.id,
            BulkOperationJobStatus.TIMED_OUT,
            'Job timed out after 3 hours of inactivity',
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to check for stalled jobs:', error);
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<ShopifyBulkOperationJob> {
    try {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Only allow retrying failed or timed out jobs
      if (
        job.status !== BulkOperationJobStatus.FAILED &&
        job.status !== BulkOperationJobStatus.TIMED_OUT
      ) {
        throw new Error(`Cannot retry job with status ${job.status}`);
      }

      // Update retry count and reset status
      job.retryCount += 1;
      job.status = BulkOperationJobStatus.CREATED;
      job.errorCode = null;
      job.errorDetails = null;
      job.statusMessage = `Retry attempt #${job.retryCount}`;

      // Save the updated job
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Retrying bulk operation job ${jobId} (attempt #${job.retryCount})`);

      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string, reason?: string): Promise<ShopifyBulkOperationJob> {
    try {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Only allow canceling jobs that are not already completed, failed, or canceled
      if (
        job.status === BulkOperationJobStatus.COMPLETED ||
        job.status === BulkOperationJobStatus.FAILED ||
        job.status === BulkOperationJobStatus.CANCELED
      ) {
        throw new Error(`Cannot cancel job with status ${job.status}`);
      }

      // Update job status
      job.status = BulkOperationJobStatus.CANCELED;
      job.statusMessage = reason || 'Canceled by user';

      // Save the updated job
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Canceled bulk operation job ${jobId}: ${job.statusMessage}`);

      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to cancel job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get job metrics
   */
  async getJobMetrics(merchantId?: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    canceledJobs: number;
    timedOutJobs: number;
    averageCompletionTimeMs?: number;
  }> {
    try {
      // Create base query builder
      const queryBuilder = merchantId
        ? this.jobRepository
            .createQueryBuilder('job')
            .where('job.merchantId = :merchantId', { merchantId })
        : this.jobRepository.createQueryBuilder('job');

      // Get total count
      const totalJobs = await queryBuilder.getCount();

      // Get status counts
      const activeJobs = await queryBuilder
        .where('job.status IN (:...statuses)', {
          statuses: [BulkOperationJobStatus.CREATED, BulkOperationJobStatus.RUNNING],
        })
        .getCount();

      const completedJobs = await queryBuilder
        .where('job.status = :status', { status: BulkOperationJobStatus.COMPLETED })
        .getCount();

      const failedJobs = await queryBuilder
        .where('job.status = :status', { status: BulkOperationJobStatus.FAILED })
        .getCount();

      const canceledJobs = await queryBuilder
        .where('job.status = :status', { status: BulkOperationJobStatus.CANCELED })
        .getCount();

      const timedOutJobs = await queryBuilder
        .where('job.status = :status', { status: BulkOperationJobStatus.TIMED_OUT })
        .getCount();

      // Calculate average completion time for completed jobs
      let averageCompletionTimeMs: number | undefined;

      if (completedJobs > 0) {
        const completedJobsWithTimes = await queryBuilder
          .select('job.createdAt')
          .addSelect('job.completedAt')
          .where('job.status = :status', { status: BulkOperationJobStatus.COMPLETED })
          .andWhere('job.completedAt IS NOT NULL')
          .getMany();

        if (completedJobsWithTimes.length > 0) {
          const totalTime = completedJobsWithTimes.reduce((sum, job) => {
            const completionTime = job.completedAt.getTime() - job.createdAt.getTime();
            return sum + completionTime;
          }, 0);

          averageCompletionTimeMs = totalTime / completedJobsWithTimes.length;
        }
      }

      return {
        totalJobs,
        activeJobs,
        completedJobs,
        failedJobs,
        canceledJobs,
        timedOutJobs,
        averageCompletionTimeMs,
      };
    } catch (error) {
      this.logger.error('Failed to get job metrics:', error);
      throw error;
    }
  }
}
