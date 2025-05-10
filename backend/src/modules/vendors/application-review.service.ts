import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VendorApplication } from './entities/vendor-application.entity';
import { VendorStatus } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';
import { ApplicationStatusChangedEvent } from '../../events/vendor-event-types';

/**
 * Service specifically for application review processes
 * Focused on the review lifecycle without handling email notifications or vendor creation
 */
@Injectable()
export class ApplicationReviewService {
  private readonly _logger = new Logger(ApplicationReviewService.name);

  constructor(
    @InjectRepository(VendorApplication)
    private readonly _vendorApplicationRepository: Repository<VendorApplication>,
    private readonly _transactionService: TransactionService,
    private readonly _eventBus: VendorEventBus,
  ) {}

  /**
   * Start the review process for an application
   */
  async startApplicationReview(applicationId: string, adminId: string): Promise<VendorApplication> {
    const application = await this._vendorApplicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    if (application.status !== VendorStatus.PENDING) {
      throw new BadRequestException(`Application is already under review or has been processed`);
    }

    // Record previous status for event emission
    const previousStatus = application.status;

    // Update application status
    application.status = VendorStatus.UNDER_REVIEW;
    application.reviewStartedAt = new Date();
    application.reviewedBy = adminId;

    const updatedApplication = await this._vendorApplicationRepository.save(application);

    // Publish status change event
    this._eventBus.publishApplicationStatusChanged({
      applicationId,
      previousStatus,
      newStatus: VendorStatus.UNDER_REVIEW,
      adminId,
      timestamp: new Date(),
    });

    return updatedApplication;
  }

  /**
   * Get application details by ID
   */
  async getApplicationById(applicationId: string): Promise<VendorApplication> {
    const application = await this._vendorApplicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    return application;
  }

  /**
   * Update application status with validation
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: VendorStatus,
    data: {
      adminId: string;
      reason?: string;
      notes?: string;
    },
  ): Promise<VendorApplication> {
    const application = await this.getApplicationById(applicationId);

    // Record previous status for event emission
    const previousStatus = application.status;

    // Update application
    application.status = newStatus;

    // Add review information
    if (
      (newStatus === VendorStatus.APPROVED || newStatus === VendorStatus.REJECTED) &&
      !application.reviewCompletedAt
    ) {
      application.reviewCompletedAt = new Date();
      application.reviewedBy = data.adminId;
    }

    // Add rejection reason if needed
    if (newStatus === VendorStatus.REJECTED) {
      application.rejectionReason = data.reason !== undefined ? data.reason : 'No reason provided';
    }

    // Add admin notes
    if (data.notes) {
      application.adminNotes = application.adminNotes
        ? `${application.adminNotes}\n\n${new Date().toISOString()} - ${data.notes}`
        : `${new Date().toISOString()} - ${data.notes}`;
    }

    // Save application
    const updatedApplication = await this._vendorApplicationRepository.save(application);

    // Publish status change event
    this._eventBus.publishApplicationStatusChanged({
      applicationId,
      previousStatus,
      newStatus,
      adminId: data.adminId,
      timestamp: new Date(),
      reason: data.reason,
      notes: data.notes,
    });

    return updatedApplication;
  }

  /**
   * Get application history
   */
  async getApplicationHistory(_applicationId: string): Promise<
    Array<{
      timestamp: Date;
      status: VendorStatus;
      actor: string;
      notes: string;
    }>
  > {
    // In a real implementation, this would query an audit log table
    // For now, we'll return a sample history
    return [
      {
        timestamp: new Date(Date.now() - 86400000 * 2),
        status: VendorStatus.PENDING,
        actor: 'system',
        notes: 'Application submitted',
      },
      {
        timestamp: new Date(Date.now() - 86400000),
        status: VendorStatus.UNDER_REVIEW,
        actor: 'admin',
        notes: 'Application review started',
      },
    ];
  }
}
