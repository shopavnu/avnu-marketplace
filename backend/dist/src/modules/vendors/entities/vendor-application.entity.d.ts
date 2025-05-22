import { VendorStatus } from './vendor.entity';
export declare enum ApplicationStep {
  BUSINESS_INFO = 'business_info',
  PRODUCT_INFO = 'product_info',
  PAYMENT_INFO = 'payment_info',
  VERIFICATION = 'verification',
  COMPLETED = 'completed',
}
export declare class VendorApplication {
  id: string;
  status: VendorStatus;
  currentStep: ApplicationStep;
  formData: any;
  vendorId: string;
  vendor: any;
  submittedAt: Date;
  reviewStartedAt: Date;
  reviewCompletedAt: Date;
  reviewedBy: string;
  adminNotes: string;
  rejectionReason: string;
  documents: any[];
  termsAccepted: boolean;
  isNotificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
