import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
export declare class MerchantProductsController {
  private productRepository;
  constructor(productRepository: Repository<Product>);
  getSuppressedProducts(
    merchantId: string,
    limit?: number,
  ): Promise<{
    success: boolean;
    data: Product[];
    count: number;
  }>;
}
