export declare enum VendorStatus {
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare enum BusinessType {
    INDIVIDUAL = "individual",
    LLC = "llc",
    CORPORATION = "corporation",
    PARTNERSHIP = "partnership",
    OTHER = "other"
}
export declare class Vendor {
    id: string;
    businessName: string;
    businessEmail: string;
    phone: string;
    businessType: BusinessType;
    website: string;
    description: string;
    status: VendorStatus;
    businessId: string;
    productCategories: string[];
    isVerified: boolean;
    verifiedAt: Date;
    verifiedBy: string;
    rejectionReason: string;
    commissionRate: number;
    canListNewProducts: boolean;
    productsCount: number;
    bankingDetails: any;
    documents: any[];
    products: any[];
    createdAt: Date;
    updatedAt: Date;
}
