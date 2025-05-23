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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorEventBus = exports.VendorEventType = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const vendor_event_types_1 = require("./vendor-event-types");
var VendorEventType;
(function (VendorEventType) {
    VendorEventType["VENDOR_CREATED"] = "vendor.created";
    VendorEventType["VENDOR_UPDATED"] = "vendor.updated";
    VendorEventType["APPLICATION_SUBMITTED"] = "vendor.application.submitted";
    VendorEventType["APPLICATION_CREATED"] = "vendor.application.created";
    VendorEventType["APPLICATION_APPROVED"] = "vendor.application.approved";
    VendorEventType["APPLICATION_REJECTED"] = "vendor.application.rejected";
    VendorEventType["DOCUMENT_UPLOADED"] = "vendor.document.uploaded";
    VendorEventType["DOCUMENT_VERIFIED"] = "vendor.document.verified";
})(VendorEventType || (exports.VendorEventType = VendorEventType = {}));
let VendorEventBus = class VendorEventBus {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    emit(eventType, payload) {
        return this.eventEmitter.emit(eventType, {
            ...payload,
            timestamp: new Date(),
            eventType,
        });
    }
    publishVendorCreated(payload) {
        return this.emit(VendorEventType.VENDOR_CREATED, {
            ...payload,
            eventType: VendorEventType.VENDOR_CREATED,
        });
    }
    publishApplicationStatusChanged(payload) {
        return this.eventEmitter.emit(vendor_event_types_1.VendorEventTypes.APPLICATION_STATUS_CHANGED, payload);
    }
    publishDocumentStatusChanged(payload) {
        return this.eventEmitter.emit(vendor_event_types_1.VendorEventTypes.DOCUMENT_STATUS_CHANGED, payload);
    }
    publishVendorApplicationCreated(payload) {
        return this.emit(VendorEventType.APPLICATION_CREATED, {
            ...payload,
            eventType: VendorEventType.APPLICATION_CREATED,
        });
    }
};
exports.VendorEventBus = VendorEventBus;
exports.VendorEventBus = VendorEventBus = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], VendorEventBus);
//# sourceMappingURL=vendor-event-bus.service.js.map