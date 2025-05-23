export declare class SocialLinks {
    instagram?: string;
    twitter?: string;
    facebook?: string;
}
export declare class Brand {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    socialLinks?: SocialLinks;
    supportedCausesInfo?: string;
    foundedYear?: number;
    location?: string;
    values?: string[];
    createdAt: Date;
    updatedAt: Date;
    products?: any[];
}
