import { ConfigService } from '@nestjs/config';
export declare class NotificationService {
  private configService;
  private readonly logger;
  private transporter;
  constructor(configService: ConfigService);
  sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean>;
  notifyMerchantOfProductIssues(
    merchantId: string,
    merchantEmail: string,
    productIssues: Array<{
      productId: string;
      productTitle: string;
      issues: string[];
      suppressedFrom: string[];
    }>,
  ): Promise<boolean>;
}
