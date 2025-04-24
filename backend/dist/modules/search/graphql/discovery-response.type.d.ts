import { ProductResultType } from './search-response.type';
export declare class DiscoverySectionMetadata {
    personalizedCount: number;
    trendingCount: number;
    newArrivalsCount: number;
    emergingBrandsCount: number;
    sponsoredCount: number;
}
export declare class DiscoverySection {
    id: string;
    title: string;
    description: string;
    type: string;
    items: ProductResultType[];
}
export declare class DiscoveryHomepageResponse {
    sections: DiscoverySection[];
    metadata: DiscoverySectionMetadata;
    highlightsEnabled: boolean;
}
