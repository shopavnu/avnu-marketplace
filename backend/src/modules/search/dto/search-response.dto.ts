import { ApiProperty } from '@nestjs/swagger';
import { Field, ObjectType, Int, Float, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { HighlightResult } from './highlight.dto';
// HighlightField is not used but kept for reference
import {} from '../services/search-relevance.service';
// RelevanceAlgorithm is not used but kept for reference

@ObjectType('PaginationInfo')
export class PaginationInfo {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  @Field(() => Int)
  total: number;

  @ApiProperty({
    description: 'Current page (0-indexed)',
    example: 0,
  })
  @Field(() => Int)
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  @Field(() => Int)
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  @Field(() => Int)
  pages: number;

  @ApiProperty({
    description: 'Total number of pages (alias for pages)',
    example: 5,
  })
  @Field(() => Int)
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  @Field(() => Boolean)
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  @Field(() => Boolean)
  hasPrevious: boolean;
}

@ObjectType('CategoryFacet')
export class CategoryFacet {
  @ApiProperty({
    description: 'Category name',
    example: 'Clothing',
  })
  @Field()
  name: string;

  @ApiProperty({
    description: 'Number of items in this category',
    example: 42,
  })
  @Field(() => Int)
  count: number;
}

@ObjectType('ValueFacet')
export class ValueFacet {
  @ApiProperty({
    description: 'Value name',
    example: 'Sustainable',
  })
  @Field()
  name: string;

  @ApiProperty({
    description: 'Number of items with this value',
    example: 27,
  })
  @Field(() => Int)
  count: number;
}

@ObjectType('PriceFacet')
export class PriceFacet {
  @ApiProperty({
    description: 'Minimum price',
    example: 10.99,
  })
  @Field(() => Float)
  min: number;

  @ApiProperty({
    description: 'Maximum price',
    example: 199.99,
  })
  @Field(() => Float)
  max: number;

  @ApiProperty({
    description: 'Price ranges',
    example: [
      { min: 0, max: 50, count: 20 },
      { min: 50, max: 100, count: 15 },
      { min: 100, max: 200, count: 7 },
    ],
  })
  @Field(() => [PriceRange])
  ranges: PriceRange[];
}

@ObjectType('PriceRange')
export class PriceRange {
  @ApiProperty({
    description: 'Minimum price in range',
    example: 50,
  })
  @Field(() => Float)
  min: number;

  @ApiProperty({
    description: 'Maximum price in range',
    example: 100,
  })
  @Field(() => Float)
  max: number;

  @ApiProperty({
    description: 'Number of items in this price range',
    example: 15,
  })
  @Field(() => Int)
  count: number;
}

@ObjectType('SearchMetadata')
export class SearchMetadata {
  @ApiProperty({
    description: 'Search duration in milliseconds',
    example: 123,
  })
  @Field(() => Int)
  searchDuration: number;

  @ApiProperty({
    description: 'Relevance algorithm used',
    example: 'intent',
  })
  @Field()
  algorithm: string;

  @ApiProperty({
    description: 'A/B test ID if applicable',
    example: 'search-relevance-test-001',
    required: false,
  })
  @Field({ nullable: true })
  testId?: string;

  @ApiProperty({
    description: 'A/B test variant ID if applicable',
    example: 'intent-boosted',
    required: false,
  })
  @Field({ nullable: true })
  variantId?: string;

  @ApiProperty({
    description: 'Whether personalization was applied',
    example: true,
    required: false,
  })
  @Field(() => Boolean, { nullable: true })
  personalized?: boolean;

  @ApiProperty({
    description: 'Personalization strength if applied',
    example: 1.0,
    required: false,
  })
  @Field(() => Float, { nullable: true })
  personalizationStrength?: number;
}

// Define a generic facet type for simple term aggregations
@ObjectType('TermFacet')
export class TermFacet {
  @ApiProperty({
    description: 'Facet item name/key',
    example: 'Example Brand',
  })
  @Field()
  name: string;

  @ApiProperty({
    description: 'Number of items in this facet',
    example: 10,
  })
  @Field(() => Int)
  count: number;
}

@ObjectType('SearchFacets')
export class SearchFacets {
  @ApiProperty({
    description: 'Category facets',
    type: [CategoryFacet],
  })
  @Field(() => [CategoryFacet])
  categories: CategoryFacet[];

  @ApiProperty({
    description: 'Value facets',
    type: [ValueFacet],
  })
  @Field(() => [ValueFacet])
  values: ValueFacet[];

  @ApiProperty({
    description: 'Price facets',
    type: PriceFacet,
  })
  @Field(() => PriceFacet, { nullable: true })
  price?: PriceFacet;

  @ApiProperty({
    description: 'Brand facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  brands?: TermFacet[];

  @ApiProperty({
    description: 'Location facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  locations?: TermFacet[];

  @ApiProperty({
    description: 'Entity Type facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  entityTypes?: TermFacet[];

  @ApiProperty({
    description: 'Merchant facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  merchants?: TermFacet[];

  @ApiProperty({
    description: 'Rating facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  ratings?: TermFacet[];

  @ApiProperty({
    description: 'Founded Year facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  foundedYears?: TermFacet[];

  @ApiProperty({
    description: 'Tag facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  tags?: TermFacet[];

  @ApiProperty({
    description: 'Verification Status facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  verificationStatus?: TermFacet[];

  @ApiProperty({
    description: 'Color facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  colors?: TermFacet[];

  @ApiProperty({
    description: 'Size facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  sizes?: TermFacet[];

  @ApiProperty({
    description: 'Material facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  materials?: TermFacet[];

  @ApiProperty({
    description: 'In-stock status facets',
    type: [TermFacet],
    required: false,
  })
  @Field(() => [TermFacet], { nullable: true })
  inStock?: TermFacet[];
}

@ObjectType('ProductSearchResult')
export class ProductSearchResult {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Field(() => ID)
  id: string;

  @ApiProperty({
    description: 'Highlighted content for this product',
    type: HighlightResult,
    required: false,
  })
  @Field(() => HighlightResult, { nullable: true })
  highlights?: HighlightResult;

  @ApiProperty({
    description: 'Product title',
    example: 'Organic Cotton T-Shirt',
  })
  @Field()
  title: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Comfortable organic cotton t-shirt made with sustainable practices.',
  })
  @Field()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 29.99,
  })
  @Field(() => Float)
  price: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/t-shirt.jpg',
  })
  @Field()
  image: string;

  @ApiProperty({
    description: 'Brand name',
    example: 'EcoWear',
  })
  @Field()
  brandName: string;

  @ApiProperty({
    description: 'Brand ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Field(() => ID)
  brandId: string;

  @ApiProperty({
    description: 'Categories',
    example: ['Clothing', 'T-Shirts'],
  })
  @Field(() => [String])
  categories: string[];

  @ApiProperty({
    description: 'Values',
    example: ['Sustainable', 'Ethical'],
  })
  @Field(() => [String])
  values: string[];

  @ApiProperty({
    description: 'Rating',
    example: 4.5,
  })
  @Field(() => Float)
  rating: number;

  @ApiProperty({
    description: 'Number of reviews',
    example: 42,
  })
  @Field(() => Int)
  reviewCount: number;

  @ApiProperty({
    description: 'Whether the product is sponsored',
    example: false,
  })
  @Field(() => Boolean)
  isSponsored: boolean;

  @ApiProperty({
    description: 'Relevance score',
    example: 0.95,
  })
  @Field(() => Float)
  score: number;
}

@ObjectType('MerchantSearchResult')
export class MerchantSearchResult {
  @ApiProperty({
    description: 'Merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Field(() => ID)
  id: string;

  @ApiProperty({
    description: 'Highlighted content for this merchant',
    type: HighlightResult,
    required: false,
  })
  @Field(() => HighlightResult, { nullable: true })
  highlights?: HighlightResult;

  @ApiProperty({
    description: 'Merchant name',
    example: 'EcoWear',
  })
  @Field()
  name: string;

  @ApiProperty({
    description: 'Merchant description',
    example: 'Sustainable clothing brand focused on eco-friendly materials.',
  })
  @Field()
  description: string;

  @ApiProperty({
    description: 'Merchant logo URL',
    example: 'https://example.com/images/ecowear-logo.jpg',
  })
  @Field()
  logo: string;

  @ApiProperty({
    description: 'Merchant location',
    example: 'Portland, OR',
  })
  @Field()
  location: string;

  @ApiProperty({
    description: 'Categories',
    example: ['Clothing', 'Accessories'],
  })
  @Field(() => [String])
  categories: string[];

  @ApiProperty({
    description: 'Values',
    example: ['Sustainable', 'Ethical', 'Local'],
  })
  @Field(() => [String])
  values: string[];

  @ApiProperty({
    description: 'Rating',
    example: 4.7,
  })
  @Field(() => Float)
  rating: number;

  @ApiProperty({
    description: 'Number of reviews',
    example: 156,
  })
  @Field(() => Int)
  reviewCount: number;

  @ApiProperty({
    description: 'Whether the merchant is sponsored',
    example: false,
  })
  @Field(() => Boolean)
  isSponsored: boolean;

  @ApiProperty({
    description: 'Relevance score',
    example: 0.92,
  })
  @Field(() => Float)
  score: number;
}

@ObjectType('BrandSearchResult')
export class BrandSearchResult {
  @ApiProperty({
    description: 'Brand ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @Field(() => ID)
  id: string;

  @ApiProperty({
    description: 'Highlighted content for this brand',
    type: HighlightResult,
    required: false,
  })
  @Field(() => HighlightResult, { nullable: true })
  highlights?: HighlightResult;

  @ApiProperty({
    description: 'Brand name',
    example: 'EcoWear',
  })
  @Field()
  name: string;

  @ApiProperty({
    description: 'Brand description',
    example: 'Sustainable clothing brand focused on eco-friendly materials.',
  })
  @Field()
  description: string;

  @ApiProperty({
    description: 'Brand logo URL',
    example: 'https://example.com/images/ecowear-logo.jpg',
  })
  @Field()
  logo: string;

  @ApiProperty({
    description: 'Brand hero image URL',
    example: 'https://example.com/images/ecowear-hero.jpg',
  })
  @Field()
  heroImage: string;

  @ApiProperty({
    description: 'Brand location',
    example: 'Portland, OR',
  })
  @Field()
  location: string;

  @ApiProperty({
    description: 'Categories',
    example: ['Clothing', 'Accessories'],
  })
  @Field(() => [String])
  categories: string[];

  @ApiProperty({
    description: 'Values',
    example: ['Sustainable', 'Ethical', 'Local'],
  })
  @Field(() => [String])
  values: string[];

  @ApiProperty({
    description: 'Year founded',
    example: 2015,
  })
  @Field(() => Int)
  foundedYear: number;

  @ApiProperty({
    description: 'Whether the brand is sponsored',
    example: false,
  })
  @Field(() => Boolean)
  isSponsored: boolean;

  @ApiProperty({
    description: 'Relevance score',
    example: 0.89,
  })
  @Field(() => Float)
  score: number;
}

@ObjectType('SearchResponse')
export class SearchResponseDto {
  @ApiProperty({
    description: 'Pagination information',
    type: PaginationInfo,
  })
  @Field(() => PaginationInfo)
  pagination: PaginationInfo;

  @ApiProperty({
    description: 'Whether highlights are enabled in the response',
    example: true,
    required: false,
  })
  @Field(() => Boolean, { nullable: true })
  highlightsEnabled?: boolean;

  @ApiProperty({
    description: 'Search facets for filtering',
    type: SearchFacets,
  })
  @Field(() => SearchFacets)
  facets: SearchFacets;

  @ApiProperty({
    description: 'Product search results',
    type: [ProductSearchResult],
  })
  @Field(() => [ProductSearchResult], { nullable: true })
  products?: ProductSearchResult[];

  @ApiProperty({
    description: 'Merchant search results',
    type: [MerchantSearchResult],
  })
  @Field(() => [MerchantSearchResult], { nullable: true })
  merchants?: MerchantSearchResult[];

  @ApiProperty({
    description: 'Brand search results',
    type: [BrandSearchResult],
  })
  @Field(() => [BrandSearchResult], { nullable: true })
  brands?: BrandSearchResult[];

  @ApiProperty({
    description: 'Search query used',
    example: 'sustainable clothing',
  })
  @Field()
  query: string;

  @ApiProperty({
    description: 'Whether NLP was used for the search',
    example: true,
  })
  @Field(() => Boolean)
  usedNlp: boolean;

  @ApiProperty({
    description: 'NLP-processed query (if NLP was used)',
    example: 'sustainable eco-friendly clothing apparel',
    required: false,
  })
  @Field({ nullable: true })
  processedQuery?: string;

  @ApiProperty({
    description: 'Experiment variant (if A/B testing is active)',
    example: 'variant_a',
    required: false,
  })
  @Field({ nullable: true })
  experimentVariant?: string;

  @ApiProperty({
    description: 'Relevance scores for each result',
    required: false,
  })
  @Field(() => GraphQLJSON, { nullable: true })
  relevanceScores?: Record<string, number>;

  @ApiProperty({
    description: 'Distribution of results by entity type',
    required: false,
  })
  @Field(() => GraphQLJSON, { nullable: true })
  entityDistribution?: Record<string, number>;

  @ApiProperty({
    description: 'Experiment ID for A/B testing',
    required: false,
  })
  @Field({ nullable: true })
  experimentId?: string;

  @ApiProperty({
    description: 'Search metadata including performance and relevance information',
    required: false,
  })
  @Field(() => SearchMetadata, { nullable: true })
  metadata?: SearchMetadata;
}
