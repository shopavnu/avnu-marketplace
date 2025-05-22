export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export type ReportReason = 
  | 'prohibited_item' 
  | 'counterfeit' 
  | 'inappropriate_content' 
  | 'misleading_description' 
  | 'incorrect_pricing' 
  | 'poor_quality' 
  | 'safety_concern'
  | 'other';

export type ReportAction = 
  | 'none' 
  | 'deactivate_product' 
  | 'deactivate_merchant' 
  | 'dismiss';

export interface ProductReport {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  merchantId: string;
  merchantName: string;
  reporterId?: string; // Optional if anonymous reports are allowed
  reporterEmail?: string;
  reason: ReportReason;
  customReason?: string; // Additional details when reason is 'other'
  description: string;
  status: ReportStatus;
  dateReported: string;
  reviewDate?: string;
  reviewedBy?: string;
  action?: ReportAction;
  actionNotes?: string;
}

// For aggregating reports by merchant
export interface MerchantReportSummary {
  merchantId: string;
  merchantName: string;
  totalReports: number;
  pendingReports: number;
  actionedReports: number;
  dismissedReports: number;
}

// Report reason display map for UI
export const REPORT_REASON_DISPLAY: Record<ReportReason, string> = {
  prohibited_item: 'Prohibited or Illegal Item',
  counterfeit: 'Counterfeit or Unauthorized Replica',
  inappropriate_content: 'Inappropriate or Offensive Content',
  misleading_description: 'Misleading Description or Images',
  incorrect_pricing: 'Incorrect Pricing Information',
  poor_quality: 'Poor Quality Product',
  safety_concern: 'Product Safety Concern',
  other: 'Other Reason'
};

// Report status display map for UI
export const REPORT_STATUS_DISPLAY: Record<ReportStatus, string> = {
  pending: 'Pending Review',
  reviewed: 'Reviewed',
  dismissed: 'Dismissed',
  actioned: 'Action Taken'
};

// Report action display map for UI
export const REPORT_ACTION_DISPLAY: Record<ReportAction, string> = {
  none: 'No Action Required',
  deactivate_product: 'Deactivate Product',
  deactivate_merchant: 'Deactivate Merchant',
  dismiss: 'Dismiss Report'
};
