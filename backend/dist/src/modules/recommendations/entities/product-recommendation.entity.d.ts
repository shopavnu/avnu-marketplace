export declare enum RecommendationType {
    SIMILAR_PRODUCTS = "similar_products",
    FREQUENTLY_BOUGHT_TOGETHER = "frequently_bought_together",
    COMPLEMENTARY_PRODUCTS = "complementary_products",
    PERSONALIZED = "personalized",
    TRENDING = "trending",
    TOP_RATED = "top_rated",
    RECENTLY_VIEWED = "recently_viewed",
    PRICE_DROP = "price_drop",
    SEASONAL = "seasonal",
    FEATURED = "featured"
}
export declare class ProductRecommendation {
    id: string;
    userId: string;
    sessionId: string;
    productId: string;
    recommendationType: RecommendationType;
    algorithmId: string;
    score: number;
    position: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    clickThroughRate: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
