import { VendorStatus } from '../modules/vendors/entities/vendor.entity';
import { DocumentStatus } from '../modules/vendors/entities/vendor-document.entity';
export declare enum VendorEventTypes {
    VENDOR_APPLICATION_CREATED = "vendor.application.created",
    APPLICATION_STATUS_CHANGED = "vendor.application.status.changed",
    DOCUMENT_STATUS_CHANGED = "vendor.document.status.changed"
}
export interface VendorApplicationCreatedEvent {
    applicationId: string;
    businessName: string;
    businessEmail: string;
    timestamp: Date;
}
export interface ApplicationStatusChangedEvent {
    applicationId: string;
    previousStatus: VendorStatus;
    newStatus: VendorStatus;
    adminId: string;
    timestamp: Date;
    reason?: string;
    notes?: string;
}
export interface DocumentStatusChangedEvent {
    documentId: string;
    applicationId: string;
    vendorId?: string;
    previousStatus: DocumentStatus;
    newStatus: DocumentStatus;
    adminId: string;
    timestamp: Date;
    notes?: string;
    reason?: string;
}
