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
var VendorNotificationService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorNotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_application_entity_1 = require("./entities/vendor-application.entity");
const vendor_entity_1 = require("./entities/vendor.entity");
const vendor_event_types_1 = require("../../events/vendor-event-types");
let VendorNotificationService = VendorNotificationService_1 = class VendorNotificationService {
    constructor(_vendorApplicationRepository, _configService, _emailService) {
        this._vendorApplicationRepository = _vendorApplicationRepository;
        this._configService = _configService;
        this._emailService = _emailService;
        this._logger = new common_1.Logger(VendorNotificationService_1.name);
    }
    async handleApplicationCreated(event) {
        try {
            await this._sendApplicationConfirmationEmail(event.businessEmail, event.businessName, event.applicationId);
            await this._vendorApplicationRepository.update(event.applicationId, {
                isNotificationSent: true,
            });
        }
        catch (error) {
            this._logger.error(`Error sending application confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
        }
    }
    async handleApplicationStatusChanged(event) {
        try {
            const application = await this._vendorApplicationRepository.findOne({
                where: { id: event.applicationId },
            });
            if (!application) {
                this._logger.error(`Application ${event.applicationId} not found for status notification`);
                return;
            }
            await this._sendStatusNotification(application, event.newStatus);
            await this._vendorApplicationRepository.update(event.applicationId, {
                isNotificationSent: true,
            });
        }
        catch (error) {
            this._logger.error(`Error handling status change notification: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
        }
    }
    async handleDocumentStatusChanged(_event) {
    }
    async _sendApplicationConfirmationEmail(email, businessName, applicationId) {
        try {
            const appUrl = this._configService.get('APP_URL') || 'http://localhost:3000';
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
        }
        catch (error) {
            this._logger.error(`Error sending confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
        }
    }
    async _sendStatusNotification(application, status) {
        try {
            const formData = application.formData;
            const email = formData.businessEmail;
            const businessName = formData.businessName;
            const appUrl = this._configService.get('APP_URL') || 'http://localhost:3000';
            const dashboardUrl = `${appUrl}/vendor/application/${application.id}`;
            const emailContent = this._prepareStatusEmailContent(status, application, businessName, dashboardUrl, appUrl);
            if (emailContent) {
                await this._emailService.sendEmail({
                    to: email,
                    subject: emailContent.subject,
                    html: emailContent.content,
                });
            }
        }
        catch (error) {
            this._logger.error(`Error sending application status update: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
        }
    }
    _prepareStatusEmailContent(status, application, businessName, dashboardUrl, appUrl) {
        switch (status) {
            case vendor_entity_1.VendorStatus.UNDER_REVIEW:
                return this._prepareUnderReviewEmail(application, businessName);
            case vendor_entity_1.VendorStatus.APPROVED:
                return this._prepareApprovedEmail(application, businessName, appUrl);
            case vendor_entity_1.VendorStatus.REJECTED:
                return this._prepareRejectedEmail(application, businessName);
            case vendor_entity_1.VendorStatus.SUSPENDED:
                return this._prepareSuspendedEmail(application, businessName);
            default:
                return null;
        }
    }
    _prepareUnderReviewEmail(application, businessName) {
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
    _prepareApprovedEmail(application, businessName, appUrl) {
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
    _prepareRejectedEmail(application, businessName) {
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
    _prepareSuspendedEmail(application, businessName) {
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
    _formatRejectionReason(reason) {
        return reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '';
    }
};
exports.VendorNotificationService = VendorNotificationService;
__decorate([
    (0, event_emitter_1.OnEvent)(VendorEventTypes.VENDOR_APPLICATION_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof VendorApplicationCreatedEvent !== "undefined" && VendorApplicationCreatedEvent) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], VendorNotificationService.prototype, "handleApplicationCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(VendorEventTypes.APPLICATION_STATUS_CHANGED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof vendor_event_types_1.ApplicationStatusChangedEvent !== "undefined" && vendor_event_types_1.ApplicationStatusChangedEvent) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], VendorNotificationService.prototype, "handleApplicationStatusChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)(VendorEventTypes.DOCUMENT_STATUS_CHANGED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof vendor_event_types_1.DocumentStatusChangedEvent !== "undefined" && vendor_event_types_1.DocumentStatusChangedEvent) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], VendorNotificationService.prototype, "handleDocumentStatusChanged", null);
exports.VendorNotificationService = VendorNotificationService = VendorNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_application_entity_1.VendorApplication)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService, Object])
], VendorNotificationService);
//# sourceMappingURL=vendor-notification.service.js.map