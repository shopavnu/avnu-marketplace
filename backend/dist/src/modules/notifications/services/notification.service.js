"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: this.configService.get('EMAIL_SECURE', false),
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASSWORD'),
            },
        });
    }
    async sendEmail(to, subject, html, text) {
        try {
            const mailOptions = {
                from: this.configService.get('EMAIL_FROM', 'notifications@avnu-marketplace.com'),
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ''),
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`, error.stack);
            return false;
        }
    }
    async notifyMerchantOfProductIssues(merchantId, merchantEmail, productIssues) {
        const subject = 'Action Required: Issues with your Avnu Marketplace products';
        const issuesHtml = productIssues
            .map(issue => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #d32f2f;">Product: ${issue.productTitle || issue.productId}</h3>
          <p><strong>Product ID:</strong> ${issue.productId}</p>
          <p><strong>Issues:</strong></p>
          <ul>
            ${issue.issues.map(i => `<li>${i}</li>`).join('')}
          </ul>
          <p><strong>This product is currently suppressed from:</strong></p>
          <ul>
            ${issue.suppressedFrom.map(location => `<li>${location}</li>`).join('')}
          </ul>
        </div>
      `)
            .join('');
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #333;">Avnu Marketplace Product Alert</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello,</p>
          
          <p>We've detected issues with some of your products on Avnu Marketplace. These products have been temporarily suppressed from the affected areas to maintain a high-quality shopping experience.</p>
          
          <p>Please review and fix the following issues as soon as possible:</p>
          
          ${issuesHtml}
          
          <p>To fix these issues:</p>
          <ol>
            <li>Log in to your Avnu Marketplace merchant dashboard</li>
            <li>Navigate to Products > All Products</li>
            <li>Select each affected product and update the missing or invalid information</li>
            <li>Save your changes</li>
          </ol>
          
          <p>Once the issues are resolved, your products will automatically be displayed again in all relevant areas of the marketplace.</p>
          
          <p>If you need assistance, please contact our merchant support team at <a href="mailto:support@avnu-marketplace.com">support@avnu-marketplace.com</a>.</p>
          
          <p>Thank you for your prompt attention to this matter.</p>
          
          <p>Best regards,<br>The Avnu Marketplace Team</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated notification from Avnu Marketplace. Please do not reply to this email.</p>
        </div>
      </div>
    `;
        return this.sendEmail(merchantEmail, subject, html);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map