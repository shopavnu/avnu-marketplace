export declare class SocialLinksDto {
    instagram?: string;
    twitter?: string;
    facebook?: string;
}
export declare class CreateBrandDto {
    name: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    socialLinks?: SocialLinksDto;
    supportedCausesInfo?: string;
    foundedYear?: number;
    location?: string;
    values?: string[];
}
export declare class UpdateBrandDto {
    name?: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    socialLinks?: SocialLinksDto;
    supportedCausesInfo?: string;
    foundedYear?: number;
    location?: string;
    values?: string[];
}
export declare class BrandResponseDto {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    };
    supportedCausesInfo?: string;
    foundedYear?: number;
    location?: string;
    values?: string[];
    createdAt: Date;
    updatedAt: Date;
    products?: any[];
}
