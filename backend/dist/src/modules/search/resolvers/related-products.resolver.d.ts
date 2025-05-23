import { RelatedProductsService } from '../services/related-products.service';
import { User } from '../../users/entities/user.entity';
export declare class RelatedProductsResolver {
    private readonly relatedProductsService;
    constructor(relatedProductsService: RelatedProductsService);
    getRelatedProducts(productId: string, limit?: number, user?: User): Promise<any>;
    getComplementaryProducts(productId: string, limit?: number, user?: User): Promise<any>;
    getFrequentlyBoughtTogether(productId: string, limit?: number): Promise<any>;
}
