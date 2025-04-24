export declare enum ShoppingFrequency {
    RARELY = "rarely",
    OCCASIONALLY = "occasionally",
    MONTHLY = "monthly",
    WEEKLY = "weekly",
    DAILY = "daily"
}
export declare enum PriceSensitivity {
    BUDGET = "budget",
    VALUE = "value",
    BALANCED = "balanced",
    PREMIUM = "premium",
    LUXURY = "luxury"
}
export declare class UserPreferencesSurveyInput {
    preferredCategories: string[];
    preferredBrands: string[];
    priceRangeMin: number;
    priceRangeMax: number;
    shoppingFrequency: ShoppingFrequency;
    priceSensitivity: PriceSensitivity;
    preferredAttributes?: string[];
    reviewImportance?: number;
    additionalPreferences?: Record<string, any>;
}
