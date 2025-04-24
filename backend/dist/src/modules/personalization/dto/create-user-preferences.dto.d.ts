export declare class CreateUserPreferencesDto {
    userId: string;
    favoriteCategories?: string[];
    favoriteValues?: string[];
    favoriteBrands?: string[];
    priceSensitivity?: 'low' | 'medium' | 'high';
    preferSustainable?: boolean;
    preferEthical?: boolean;
    preferLocalBrands?: boolean;
    preferredSizes?: string[];
    preferredColors?: string[];
    preferredMaterials?: string[];
}
