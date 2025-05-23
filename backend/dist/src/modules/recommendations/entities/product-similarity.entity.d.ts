export declare enum SimilarityType {
    ATTRIBUTE_BASED = "attribute_based",
    COLLABORATIVE_FILTERING = "collaborative_filtering",
    CONTENT_BASED = "content_based",
    HYBRID = "hybrid",
    PURCHASE_BASED = "purchase_based",
    VIEW_BASED = "view_based",
    CATEGORY_BASED = "category_based",
    PRICE_BASED = "price_based",
    BRAND_BASED = "brand_based",
    EMBEDDING_BASED = "embedding_based"
}
export declare class ProductSimilarity {
    id: string;
    sourceProductId: string;
    targetProductId: string;
    similarityType: SimilarityType;
    score: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
