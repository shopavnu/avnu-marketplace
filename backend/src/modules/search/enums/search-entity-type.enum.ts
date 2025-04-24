import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum representing the different entity types that can be searched
 */
export enum SearchEntityType {
  PRODUCT = 'product',
  MERCHANT = 'merchant',
  BRAND = 'brand',
  ALL = 'all',
}

// Register the enum with GraphQL
registerEnumType(SearchEntityType, {
  name: 'SearchEntityType',
  description: 'The types of entities that can be searched',
});
