import { AccessibilityService } from '../services/accessibility.service';
import { ProductsService } from '../products.service';
import { ProductAccessibilityDto, AriaAttributesDto, ImageAltTextDto } from '../dto/accessibility-metadata.dto';
import { Product } from '../entities/product.entity';
export declare class AccessibilityResolver {
    private readonly accessibilityService;
    private readonly productsService;
    constructor(accessibilityService: AccessibilityService, productsService: ProductsService);
    productAccessibility(productId: string): Promise<ProductAccessibilityDto>;
    productAriaAttributes(productId: string): Promise<AriaAttributesDto>;
    generateProductAltText(productId: string): Promise<ProductAccessibilityDto>;
    imageAltTexts(product: Product): Promise<ImageAltTextDto[]>;
}
