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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var ShopifyBulkJobService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyBulkJobService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const schedule_1 = require('@nestjs/schedule');
const shopify_bulk_operation_job_entity_1 = require('../entities/shopify-bulk-operation-job.entity');
let ShopifyBulkJobService = (ShopifyBulkJobService_1 = class ShopifyBulkJobService {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
    this.logger = new common_1.Logger(ShopifyBulkJobService_1.name);
  }
  async createJob(merchantId, bulkOperationId, description, query, metadata, connectionId) {
    try {
      const job = new shopify_bulk_operation_job_entity_1.ShopifyBulkOperationJob();
      job.merchantId = merchantId;
      job.shopifyBulkOperationId = bulkOperationId;
      job.description = description;
      job.query = query;
      job.status = shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CREATED;
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
  async updateJobStatus(jobId, status, statusMessage, additionalData) {
    try {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });
      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
      job.status = status;
      job.statusMessage = statusMessage || job.statusMessage;
      if (status === shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED) {
        job.completedAt = new Date();
      }
      if (additionalData) {
        Object.assign(job, additionalData);
      }
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Updated bulk operation job ${jobId} to status ${status}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to update job status for job ${jobId}:`, error);
      throw error;
    }
  }
  async findJobById(jobId) {
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
  async findJobsByMerchantId(merchantId, status, limit = 20, cursor, direction = 'backward') {
    try {
      let query = this.jobRepository
        .createQueryBuilder('job')
        .where('job.merchantId = :merchantId', { merchantId });
      if (status) {
        if (Array.isArray(status)) {
          query = query.andWhere('job.status IN (:...statuses)', { statuses: status });
        } else {
          query = query.andWhere('job.status = :status', { status });
        }
      }
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
      query = query
        .orderBy('job.createdAt', direction === 'forward' ? 'ASC' : 'DESC')
        .take(limit + 1);
      const jobs = await query.getMany();
      const hasMore = jobs.length > limit;
      if (hasMore) {
        jobs.pop();
      }
      if (direction === 'backward') {
        jobs.reverse();
      }
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
  async cleanupOldJobs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const completedResult = await this.jobRepository.delete({
        status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED,
        completedAt: (0, typeorm_2.LessThan)(thirtyDaysAgo),
      });
      const failedResult = await this.jobRepository.delete({
        status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED,
        updatedAt: (0, typeorm_2.LessThan)(thirtyDaysAgo),
      });
      this.logger.log(
        `Cleaned up ${completedResult.affected || 0} completed jobs and ${failedResult.affected || 0} failed jobs older than 30 days`,
      );
    } catch (error) {
      this.logger.error('Failed to clean up old jobs:', error);
    }
  }
  async findStalledJobs() {
    try {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      const stalledJobs = await this.jobRepository.find({
        where: {
          status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING,
          updatedAt: (0, typeorm_2.LessThan)(threeHoursAgo),
        },
      });
      if (stalledJobs.length > 0) {
        this.logger.log(`Found ${stalledJobs.length} stalled bulk operation jobs`);
        for (const job of stalledJobs) {
          await this.updateJobStatus(
            job.id,
            shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.TIMED_OUT,
            'Job timed out after 3 hours of inactivity',
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to check for stalled jobs:', error);
    }
  }
  async retryJob(jobId) {
    try {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });
      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
      if (
        job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED &&
        job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.TIMED_OUT
      ) {
        throw new Error(`Cannot retry job with status ${job.status}`);
      }
      job.retryCount += 1;
      job.status = shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CREATED;
      job.errorCode = null;
      job.errorDetails = null;
      job.statusMessage = `Retry attempt #${job.retryCount}`;
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Retrying bulk operation job ${jobId} (attempt #${job.retryCount})`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId}:`, error);
      throw error;
    }
  }
  async cancelJob(jobId, reason) {
    try {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });
      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }
      if (
        job.status === shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED ||
        job.status === shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED ||
        job.status === shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CANCELED
      ) {
        throw new Error(`Cannot cancel job with status ${job.status}`);
      }
      job.status = shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CANCELED;
      job.statusMessage = reason || 'Canceled by user';
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Canceled bulk operation job ${jobId}: ${job.statusMessage}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to cancel job ${jobId}:`, error);
      throw error;
    }
  }
  async getJobMetrics(merchantId) {
    try {
      const queryBuilder = merchantId
        ? this.jobRepository
            .createQueryBuilder('job')
            .where('job.merchantId = :merchantId', { merchantId })
        : this.jobRepository.createQueryBuilder('job');
      const totalJobs = await queryBuilder.getCount();
      const activeJobs = await queryBuilder
        .where('job.status IN (:...statuses)', {
          statuses: [
            shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CREATED,
            shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING,
          ],
        })
        .getCount();
      const completedJobs = await queryBuilder
        .where('job.status = :status', {
          status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED,
        })
        .getCount();
      const failedJobs = await queryBuilder
        .where('job.status = :status', {
          status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED,
        })
        .getCount();
      const canceledJobs = await queryBuilder
        .where('job.status = :status', {
          status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CANCELED,
        })
        .getCount();
      const timedOutJobs = await queryBuilder
        .where('job.status = :status', {
          status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.TIMED_OUT,
        })
        .getCount();
      let averageCompletionTimeMs;
      if (completedJobs > 0) {
        const completedJobsWithTimes = await queryBuilder
          .select('job.createdAt')
          .addSelect('job.completedAt')
          .where('job.status = :status', {
            status: shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED,
          })
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
});
exports.ShopifyBulkJobService = ShopifyBulkJobService;
__decorate(
  [
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  ShopifyBulkJobService.prototype,
  'cleanupOldJobs',
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  ShopifyBulkJobService.prototype,
  'findStalledJobs',
  null,
);
exports.ShopifyBulkJobService =
  ShopifyBulkJobService =
  ShopifyBulkJobService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(
          0,
          (0, typeorm_1.InjectRepository)(
            shopify_bulk_operation_job_entity_1.ShopifyBulkOperationJob,
          ),
        ),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      ShopifyBulkJobService,
    );
//# sourceMappingURL=shopify-bulk-job.service.js.map
