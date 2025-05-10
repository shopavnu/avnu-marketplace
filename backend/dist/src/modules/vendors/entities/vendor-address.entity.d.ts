export declare enum AddressType {
    BUSINESS = "business",
    SHIPPING = "shipping",
    BILLING = "billing",
    WAREHOUSE = "warehouse"
}
export declare class VendorAddress {
    id: string;
    vendorId: string;
    vendor: any;
    addressType: AddressType;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    contactName: string;
    contactPhone: string;
    createdAt: Date;
    updatedAt: Date;
}
