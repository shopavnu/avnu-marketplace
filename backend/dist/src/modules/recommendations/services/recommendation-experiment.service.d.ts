import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
export declare class RecommendationExperimentService {
    private readonly productRepository;
    private readonly logger;
    constructor(productRepository: Repository<Product>);
    getVariant(userId: string, experimentId: string): Promise<string>;
    recordEvent(userId: string, experimentId: string, variant: string, event: string, metadata?: Record<string, any>): Promise<void>;
    private hashString;
}
