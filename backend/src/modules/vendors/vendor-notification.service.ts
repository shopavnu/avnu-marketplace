import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VendorApplication } from './entities/vendor-application.entity';
import { VendorStatus } from './entities/vendor.entity';
import {
  ApplicationStatusChangedEvent,
  DocumentStatusChangedEvent,
  VendorEventTypes,
  VendorApplicationCreatedEvent,
} from '../../events/vendor-event-types';

/**
 * Interface for email service to avoid circular dependencies
 */
interface IEmailService {
  sendEmail(options: { to: string; subject: string; html: string }): Promise<void>;
}

/**
 * Service dedicated to handling all vendor-related notifications
 * Completely decoupled from other services using event listeners
 */
@Injectable()
export class VendorNotificationService {
  private readonly _logger = new Logger(VendorNotificationService.name);

  constructor(
    @InjectRepository(VendorApplication)
    private readonly _vendorApplicationRepository: Repository<VendorApplication>,
    private readonly _configService: ConfigService,
    private readonly _emailService: IEmailService,
  ) {}

  /**
   * Listen for application creation events and send confirmation emails
   */
  @OnEvent(VendorEventTypes.VENDOR_APPLICATION_CREATED)
  async handleApplicationCreated(event: VendorApplicationCreatedEvent): Promise<void> {
    try {
      await this._sendApplicationConfirmationEmail(
        event.businessEmail,
        event.businessName,
        event.applicationId,
      );

      // Mark notification as sent in database
      await this._vendorApplicationRepository.update(event.applicationId, {
        isNotificationSent: true,
      });
    } catch (error) {
      this._logger.error(
        `Error sending application confirmation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : '',
      );
    }
  }

  /**
   * Listen for application status changes and send notifications
   */
  @OnEvent(VendorEventTypes.APPLICATION_STATUS_CHANGED)
  async handleApplicationStatusChanged(event: ApplicationStatusChangedEvent): Promise<void> {
    try {
      // Get application details
      const application = await this._vendorApplicationRepository.findOne({
        where: { id: event.applicationId },
      });

      if (!application) {
        this._logger.error(`Application ${event.applicationId} not found for status notification`);
        return;
      }

      // Send status notification
      await this._sendStatusNotification(application, event.newStatus);

      // Mark notification as sent
      await this._vendorApplicationRepository.update(event.applicationId, {
        isNotificationSent: true,
      });
    } catch (error) {
      this._logger.error(
        `Error handling status change notification: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : '',
      );
    }
  }

  /**
   * Listen for document status changes and notify if needed
   */
  @OnEvent(VendorEventTypes.DOCUMENT_STATUS_CHANGED)
  async handleDocumentStatusChanged(_event: DocumentStatusChangedEvent): Promise<void> {
    // Add implementation if document status changes need to trigger emails
    // This provides a clear place to add that logic in the future
  }

  /**
   * Send application confirmation email
   */
  private async _sendApplicationConfirmationEmail(
    email: string,
    businessName: string,
    applicationId: string,
  ): Promise<void> {
    try {
      const appUrl = this._configService.get<string>('APP_URL') || 'http://localhost:3000';
      const statusUrl = `${appUrl}/vendor/application/${applicationId}`;

      await this._emailService.sendEmail({
        to: email,
        subject: 'Vendor Application Received',
        html: `
          <h1>Vendor Application Received</h1>
          <p>Dear ${businessName},</p>
          <p>Thank you for submitting your vendor application to join our marketplace.</p>
          <p>Your application is now under review. Our team will assess your information and documents within 2-3 business days.</p>
          <p>Your application ID is: <strong>${applicationId}</strong></p>
          <p>You can check the status of your application at any time by visiting:</p>
          <p><a href="${statusUrl}">${statusUrl}</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,</p>
          <p>The Marketplace Team</p>
        `,
      });
    } catch (error) {
      this._logger.error(
        `Error sending confirmation email: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : '',
      );
    }
  }

  /**
   * Send application status notification email
   */
  private async _sendStatusNotification(
    application: VendorApplication,
    status: VendorStatus,
  ): Promise<void> {
    try {
      const formData = application.formData;
      const email = formData.businessEmail;
      const businessName = formData.businessName;
      const appUrl = this._configService.get<string>('APP_URL') || 'http://localhost:3000';
      // URL for the application dashboard
      const dashboardUrl = `${appUrl}/vendor/application/${application.id}`;

      const emailContent = this._prepareStatusEmailContent(
        status,
        application,
        businessName,
        dashboardUrl,
        appUrl,
      );

      if (emailContent) {
        await this._emailService.sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.content,
        });
      }
    } catch (error) {
      this._logger.error(
        `Error sending application status update: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : '',
      );
    }
  }

  /**
   * Prepare email content based on application status
   */
  private _prepareStatusEmailContent(
    status: VendorStatus,
    application: VendorApplication,
    businessName: string,
    dashboardUrl: string,
    appUrl: string,
  ): { subject: string; content: string } | null {
    switch (status) {
      case VendorStatus.UNDER_REVIEW:
        return this._prepareUnderReviewEmail(application, businessName);

      case VendorStatus.APPROVED:
        return this._prepareApprovedEmail(application, businessName, appUrl);

      case VendorStatus.REJECTED:
        return this._prepareRejectedEmail(application, businessName);

      case VendorStatus.SUSPENDED:
        return this._prepareSuspendedEmail(application, businessName);

      default:
        // No notification for other status changes
        return null;
    }
  }

  /**
   * Create email content for under review status
   */
  private _prepareUnderReviewEmail(
    application: VendorApplication,
    businessName: string,
  ): { subject: string; content: string } {
    const subject = 'Your Vendor Application is Under Review';
    const content = `
      <h1>Application Under Review</h1>
      <p>Dear ${businessName},</p>
      <p>Your vendor application is now being reviewed by our team. This process typically takes 1-2 business days.</p>
      <p>We'll notify you as soon as the review is complete.</p>
      <p>Application ID: ${application.id}</p>
      <p>Best regards,</p>
      <p>The Marketplace Team</p>
    `;

    return { subject, content };
  }

  /**
   * Create email content for approved status
   */
  private _prepareApprovedEmail(
    application: VendorApplication,
    businessName: string,
    appUrl: string,
  ): { subject: string; content: string } {
    const subject = 'Vendor Application Approved!';
    const content = `
      <h1>Application Approved</h1>
      <p>Dear ${businessName},</p>
      <p>Congratulations! Your application to become a vendor on our marketplace has been approved.</p>
      <p>You can now log in to your vendor dashboard to start listing products and managing your store.</p>
      <p><a href="${appUrl}/vendor/login">Login to Vendor Dashboard</a></p>
      <p>Application ID: ${application.id}</p>
      <p>Best regards,</p>
      <p>The Marketplace Team</p>
    `;

    return { subject, content };
  }

  /**
   * Create email content for rejected status
   */
  private _prepareRejectedEmail(
    application: VendorApplication,
    businessName: string,
  ): { subject: string; content: string } {
    const subject = 'Update on Your Vendor Application';
    const content = `
      <h1>Application Status Update</h1>
      <p>Dear ${businessName},</p>
      <p>Thank you for your interest in becoming a vendor on our marketplace.</p>
      <p>After careful review, we are unable to approve your application at this time.</p>
      ${this._formatRejectionReason(application.rejectionReason)}
      <p>You may reapply after addressing the issues mentioned above.</p>
      <p>Application ID: ${application.id}</p>
      <p>Best regards,</p>
      <p>The Marketplace Team</p>
    `;

    return { subject, content };
  }

  /**
   * Create email content for suspended status
   */
  private _prepareSuspendedEmail(
    application: VendorApplication,
    businessName: string,
  ): { subject: string; content: string } {
    const subject = 'Important: Your Vendor Account Has Been Suspended';
    const content = `
      <h1>Account Suspended</h1>
      <p>Dear ${businessName},</p>
      <p>Your vendor account has been temporarily suspended.</p>
      ${this._formatRejectionReason(application.rejectionReason)}
      <p>Please contact our support team for more information and steps to restore your account.</p>
      <p>Application ID: ${application.id}</p>
      <p>Best regards,</p>
      <p>The Marketplace Team</p>
    `;

    return { subject, content };
  }

  /**
   * Format rejection reason if provided
   */
  private _formatRejectionReason(reason?: string): string {
    return reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '';
  }
}
