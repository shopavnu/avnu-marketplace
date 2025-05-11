export declare class ProductVariantDto {
  id?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventoryQuantity?: number;
  options?: Record<string, string>[];
}
