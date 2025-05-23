import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplicationStatusChangedEvent, DocumentStatusChangedEvent } from './vendor-event-types';
export declare enum VendorEventType {
    VENDOR_CREATED = "vendor.created",
    VENDOR_UPDATED = "vendor.updated",
    APPLICATION_SUBMITTED = "vendor.application.submitted",
    APPLICATION_CREATED = "vendor.application.created",
    APPLICATION_APPROVED = "vendor.application.approved",
    APPLICATION_REJECTED = "vendor.application.rejected",
    DOCUMENT_UPLOADED = "vendor.document.uploaded",
    DOCUMENT_VERIFIED = "vendor.document.verified"
}
export interface IVendorEvent {
    timestamp: Date;
    eventType: VendorEventType;
}
export interface IVendorCreatedEvent extends IVendorEvent {
    vendorId: string;
    applicationId: string;
}
export declare class VendorEventBus {
    private readonly eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    emit<T extends IVendorEvent>(eventType: VendorEventType, payload: T): boolean;
    publishVendorCreated(payload: {
        vendorId: string;
        applicationId: string;
        timestamp: Date;
    }): boolean;
    publishApplicationStatusChanged(payload: ApplicationStatusChangedEvent): boolean;
    publishDocumentStatusChanged(payload: DocumentStatusChangedEvent): boolean;
    publishVendorApplicationCreated(payload: {
        applicationId: string;
        businessEmail: string;
        businessName: string;
        timestamp: Date;
    }): boolean;
}
