import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { VendorApplication } from './entities/vendor-application.entity';
import { ApplicationStatusChangedEvent, DocumentStatusChangedEvent, VendorApplicationCreatedEvent } from '../../events/vendor-event-types';
interface IEmailService {
    sendEmail(options: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
}
export declare class VendorNotificationService {
    private readonly _vendorApplicationRepository;
    private readonly _configService;
    private readonly _emailService;
    private readonly _logger;
    constructor(_vendorApplicationRepository: Repository<VendorApplication>, _configService: ConfigService, _emailService: IEmailService);
    handleApplicationCreated(event: VendorApplicationCreatedEvent): Promise<void>;
    handleApplicationStatusChanged(event: ApplicationStatusChangedEvent): Promise<void>;
    handleDocumentStatusChanged(_event: DocumentStatusChangedEvent): Promise<void>;
    private _sendApplicationConfirmationEmail;
    private _sendStatusNotification;
    private _prepareStatusEmailContent;
    private _prepareUnderReviewEmail;
    private _prepareApprovedEmail;
    private _prepareRejectedEmail;
    private _prepareSuspendedEmail;
    private _formatRejectionReason;
}
export {};
