import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  VendorEventTypes,
  ApplicationStatusChangedEvent,
  DocumentStatusChangedEvent,
} from './vendor-event-types';

/**
 * Event types for vendor-related events
 */
export enum VendorEventType {
  VENDOR_CREATED = 'vendor.created',
  VENDOR_UPDATED = 'vendor.updated',
  APPLICATION_SUBMITTED = 'vendor.application.submitted',
  APPLICATION_CREATED = 'vendor.application.created',
  APPLICATION_APPROVED = 'vendor.application.approved',
  APPLICATION_REJECTED = 'vendor.application.rejected',
  DOCUMENT_UPLOADED = 'vendor.document.uploaded',
  DOCUMENT_VERIFIED = 'vendor.document.verified',
}

/**
 * Base interface for all vendor-related events
 */
export interface IVendorEvent {
  timestamp: Date;
  eventType: VendorEventType;
}

/**
 * Interface for vendor creation event
 */
export interface IVendorCreatedEvent extends IVendorEvent {
  vendorId: string;
  applicationId: string;
}

/**
 * Service for emitting and listening to vendor-related events
 */
@Injectable()
export class VendorEventBus {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit a vendor-related event
   * @param eventType - Type of the event
   * @param payload - Event payload
   */
  emit<T extends IVendorEvent>(eventType: VendorEventType, payload: T): boolean {
    return this.eventEmitter.emit(eventType, {
      ...payload,
      timestamp: new Date(),
      eventType,
    });
  }

  /**
   * Publish a vendor created event
   * @param payload - Event data containing vendorId and applicationId
   */
  publishVendorCreated(payload: {
    vendorId: string;
    applicationId: string;
    timestamp: Date;
  }): boolean {
    return this.emit(VendorEventType.VENDOR_CREATED, {
      ...payload,
      eventType: VendorEventType.VENDOR_CREATED,
    });
  }

  /**
   * Publish an application status changed event
   * @param payload - Event data containing applicationId, previousStatus, newStatus, etc.
   */
  publishApplicationStatusChanged(payload: ApplicationStatusChangedEvent): boolean {
    return this.eventEmitter.emit(VendorEventTypes.APPLICATION_STATUS_CHANGED, payload);
  }

  /**
   * Publish a document status changed event
   * @param payload - Event data containing documentId, previousStatus, newStatus, etc.
   */
  publishDocumentStatusChanged(payload: DocumentStatusChangedEvent): boolean {
    return this.eventEmitter.emit(VendorEventTypes.DOCUMENT_STATUS_CHANGED, payload);
  }

  /**
   * Publish a vendor application created event
   * @param payload - Event data containing application details
   */
  publishVendorApplicationCreated(payload: {
    applicationId: string;
    businessEmail: string;
    businessName: string;
    timestamp: Date;
  }): boolean {
    return this.emit(VendorEventType.APPLICATION_CREATED, {
      ...payload,
      eventType: VendorEventType.APPLICATION_CREATED,
    });
  }
}
