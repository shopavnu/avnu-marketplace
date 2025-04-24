import {
  Resolver,
  Query,
  Args,
  Int,
  ObjectType,
  Field,
  InputType,
  Mutation,
  Float,
} from '@nestjs/graphql';
import { NaturalLanguageSearchService } from './services/natural-language-search.service';
import { NlpService } from './services/nlp.service';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ObjectType()
class QueryEntity {
  @Field()
  type: string;

  @Field()
  value: string;
}

@ObjectType()
class QueryFilters {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => Int, { nullable: true })
  priceMin?: number;

  @Field(() => Int, { nullable: true })
  priceMax?: number;

  @Field({ nullable: true })
  brandName?: string;

  @Field({ nullable: true })
  inStock?: boolean;

  @Field(() => [String], { nullable: true })
  values?: string[];
}

@ObjectType()
class ProcessedQueryResult {
  @Field()
  originalQuery: string;

  @Field()
  processedQuery: string;

  @Field(() => [String])
  tokens: string[];

  @Field(() => [String])
  stems: string[];

  @Field(() => [QueryEntity])
  entities: QueryEntity[];

  @Field()
  intent: string;

  @Field(() => QueryFilters)
  filters: QueryFilters;
}

@ObjectType()
class NlpSearchResult {
  @Field(() => [Product])
  items: Product[];

  @Field(() => Int)
  total: number;

  @Field()
  enhancedQuery: string;

  @Field(() => QueryFilters)
  detectedFilters: QueryFilters;
}

@InputType()
class UserPreferencesInput {
  @Field(() => [String], { nullable: true })
  favoriteCategories?: string[];

  @Field(() => [String], { nullable: true })
  favoriteValues?: string[];

  @Field(() => String, { nullable: true })
  priceSensitivity?: 'low' | 'medium' | 'high';
}

@ObjectType()
class KeywordsResult {
  @Field(() => [String])
  keywords: string[];
}

@ObjectType()
class SimilarityResult {
  @Field(() => Float)
  similarity: number;
}

@ObjectType()
class ClassificationResult {
  @Field()
  category: string;
}

@ObjectType()
class _RelevanceScore {
  @Field(() => Float)
  score: number;
}

@Resolver()
export class NlpResolver {
  constructor(
    private readonly naturalLanguageSearchService: NaturalLanguageSearchService,
    private readonly nlpService: NlpService,
  ) {}

  @Query(() => NlpSearchResult, { name: 'nlpSearch' })
  async searchProducts(
    @Args('query') query: string,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
  ) {
    return this.naturalLanguageSearchService.searchProducts(
      query,
      paginationDto || { page: 1, limit: 10 },
    );
  }

  @Query(() => ProcessedQueryResult, { name: 'analyzeQuery' })
  analyzeQuery(@Args('query') query: string) {
    return this.nlpService.processQuery(query);
  }

  @Query(() => [String], { name: 'searchSuggestions' })
  async generateSearchSuggestions(
    @Args('query') query: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.naturalLanguageSearchService.generateSearchSuggestions(query, limit);
  }

  @Query(() => ClassificationResult, { name: 'classifyQuery' })
  classifySearchQuery(@Args('query') query: string) {
    return { category: this.naturalLanguageSearchService.classifySearchQuery(query) };
  }

  @Mutation(() => [Product], { name: 'getRecommendationsFromDescription' })
  async getRecommendationsFromDescription(
    @Args('description') description: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.naturalLanguageSearchService.getRecommendationsFromDescription(description, limit);
  }

  @Mutation(() => NlpSearchResult, { name: 'getPersonalizedSearchResults' })
  async getPersonalizedSearchResults(
    @Args('query') query: string,
    @Args('userPreferences') userPreferences: UserPreferencesInput,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
  ) {
    return this.naturalLanguageSearchService.getPersonalizedSearchResults(
      query,
      userPreferences,
      paginationDto || { page: 1, limit: 10 },
    );
  }

  @Mutation(() => KeywordsResult, { name: 'extractKeywords' })
  extractKeywords(
    @Args('text') text: string,
    @Args('maxKeywords', { type: () => Int, nullable: true }) maxKeywords?: number,
  ) {
    return {
      keywords: this.nlpService.extractKeywords(text, maxKeywords),
    };
  }

  @Mutation(() => SimilarityResult, { name: 'calculateSimilarity' })
  calculateSimilarity(@Args('text1') text1: string, @Args('text2') text2: string) {
    return {
      similarity: this.nlpService.calculateSimilarity(text1, text2),
    };
  }
}
