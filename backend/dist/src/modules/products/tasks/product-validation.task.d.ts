import { Repository } from 'typeorm';
import { ProductValidationService } from '../services/product-validation.service';
import { Merchant } from '../../merchants/entities/merchant.entity';
export declare class ProductValidationTask {
    private productValidationService;
    private merchantRepository;
    private readonly logger;
    constructor(productValidationService: ProductValidationService, merchantRepository: Repository<Merchant>);
    validateAllProducts(): Promise<void>;
    validateRecentProducts(): Promise<void>;
}
