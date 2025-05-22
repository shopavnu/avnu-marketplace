import { NotificationService } from '../services/notification.service';
interface ProductIssueEvent {
  merchantId: string;
  merchantEmail: string;
  productIssues: Array<{
    productId: string;
    productTitle: string;
    issues: string[];
    suppressedFrom: string[];
  }>;
}
export declare class ProductIssuesListener {
  private notificationService;
  private readonly logger;
  constructor(notificationService: NotificationService);
  handleProductIssuesEvent(payload: ProductIssueEvent): Promise<void>;
}
export {};
