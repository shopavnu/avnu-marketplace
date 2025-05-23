import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '../entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
export declare class ProductValidationService {
    private productRepository;
    private merchantRepository;
    private eventEmitter;
    private readonly logger;
    constructor(productRepository: Repository<Product>, merchantRepository: Repository<Merchant>, eventEmitter: EventEmitter2);
    validateProduct(product: Product): Promise<{
        isValid: boolean;
        issues: string[];
        suppressedFrom: string[];
    }>;
    private updateProductSuppressionStatus;
    validateMerchantProducts(merchantId: string): Promise<void>;
    validateAllProducts(): Promise<void>;
}
