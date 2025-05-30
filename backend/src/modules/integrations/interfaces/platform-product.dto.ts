// @ts-strict-mode: enabled
import { PlatformType } from '../../shared';

/**
 * Data Transfer Object for platform products
 */
export interface PlatformProductDto {
  id?: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  quantity: number;
  images: string[];
  platformType?: PlatformType;
  platformData?: Record<string, unknown>;
  categories?: string[];
  variants?: Array<Partial<PlatformProductDto>>;
}
