import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Send an email notification
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email content in HTML format
   * @param text Plain text version of the email
   */
  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'notifications@avnu-marketplace.com'),
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send a notification to a merchant about product data issues
   * @param merchantId The ID of the merchant
   * @param merchantEmail The email address of the merchant
   * @param productIssues Array of product issues to report
   */
  async notifyMerchantOfProductIssues(
    merchantId: string,
    merchantEmail: string,
    productIssues: Array<{
      productId: string;
      productTitle: string;
      issues: string[];
      suppressedFrom: string[];
    }>,
  ): Promise<boolean> {
    const subject = 'Action Required: Issues with your Avnu Marketplace products';
    
    // Create HTML content with product issues
    const issuesHtml = productIssues
      .map(
        (issue) => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #d32f2f;">Product: ${issue.productTitle || issue.productId}</h3>
          <p><strong>Product ID:</strong> ${issue.productId}</p>
          <p><strong>Issues:</strong></p>
          <ul>
            ${issue.issues.map((i) => `<li>${i}</li>`).join('')}
          </ul>
          <p><strong>This product is currently suppressed from:</strong></p>
          <ul>
            ${issue.suppressedFrom.map((location) => `<li>${location}</li>`).join('')}
          </ul>
        </div>
      `,
      )
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
}
