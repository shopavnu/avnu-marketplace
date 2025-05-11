export declare class CreateProductDto {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  thumbnail?: string;
  categories: string[];
  tags?: string[];
  merchantId: string;
  brandName: string;
  isActive?: boolean;
  inStock?: boolean;
  quantity?: number;
  values?: string[];
  externalId: string;
  externalSource: string;
}
