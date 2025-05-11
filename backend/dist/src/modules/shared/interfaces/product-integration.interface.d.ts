import { PlatformType } from '../enums/platform-type.enum';
export interface PlatformProductDto {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  quantity?: number;
  images?: string[];
  platformType: PlatformType;
  categories?: string[];
  tags?: string[];
  variants?: PlatformProductVariantDto[];
  attributes?: Record<string, string>;
  metadata?: Record<string, unknown>;
}
export interface PlatformProductVariantDto {
  id?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  attributes?: Record<string, string>;
}
export interface SyncResult {
  created: number;
  updated: number;
  failed: number;
  total?: number;
  totalProcessed?: number;
  success?: boolean;
  errors?: string[];
  platformErrors?: Record<string, string>;
  skipped?: number;
  deleted?: number;
  timestamp?: Date;
}
export interface ProductIntegrationService {
  getProduct(productId: string, merchantId: string): Promise<PlatformProductDto>;
  createProduct(product: PlatformProductDto, merchantId: string): Promise<PlatformProductDto>;
  updateProduct(
    productId: string,
    productUpdate: Partial<PlatformProductDto>,
    merchantId: string,
  ): Promise<PlatformProductDto>;
  deleteProduct(productId: string, merchantId: string): Promise<boolean>;
  syncProducts(merchantId: string): Promise<SyncResult>;
  syncOrders(merchantId: string): Promise<SyncResult>;
  processIncomingProduct(
    product: Record<string, unknown>,
    platformType: PlatformType,
    merchantId: string,
  ): PlatformProductDto;
  prepareOutgoingProduct(
    product: PlatformProductDto,
    platformType: PlatformType,
  ): Record<string, unknown>;
}
