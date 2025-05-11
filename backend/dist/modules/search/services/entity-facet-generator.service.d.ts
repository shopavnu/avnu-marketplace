import { ConfigService } from '@nestjs/config';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchFacets } from '../dto/search-response.dto';
export declare class EntityFacetGeneratorService {
  private readonly configService;
  private readonly logger;
  constructor(configService: ConfigService);
  generateFacets(aggregations: any, entityType: SearchEntityType): SearchFacets;
  private generateProductFacets;
  private generateMerchantFacets;
  private generateBrandFacets;
  private generateAllEntityFacets;
  combineFacets(productFacets: any, merchantFacets: any, brandFacets: any): SearchFacets;
  buildAggregationRequest(entityType: SearchEntityType): any;
}
