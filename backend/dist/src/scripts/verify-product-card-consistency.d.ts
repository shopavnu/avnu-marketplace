declare function processImage(imageUrl: string): {
    url: string;
    width: number;
    height: number;
    aspectRatio: number;
};
declare function normalizeProduct(product: any): any;
declare const testProducts: ({
    title: string;
    description: string;
    price: number;
    images: string[];
    categories: string[];
    merchantId: string;
    brandName: string;
    compareAtPrice?: undefined;
} | {
    title: string;
    description: string;
    price: number;
    compareAtPrice: number;
    images: string[];
    categories: string[];
    merchantId: string;
    brandName: string;
})[];
declare function verifyProductCardConsistency(): void;
