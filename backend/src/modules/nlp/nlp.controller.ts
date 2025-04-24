import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NaturalLanguageSearchService } from './services/natural-language-search.service';
import { NlpService } from './services/nlp.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('nlp')
@Controller('nlp')
export class NlpController {
  constructor(
    private readonly naturalLanguageSearchService: NaturalLanguageSearchService,
    private readonly nlpService: NlpService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Perform a natural language search for products' })
  @ApiResponse({
    status: 200,
    description: 'Returns search results with enhanced query and detected filters',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Natural language query' })
  async searchProducts(@Query('query') query: string, @Query() paginationDto: PaginationDto) {
    return this.naturalLanguageSearchService.searchProducts(query, paginationDto);
  }

  @Get('analyze')
  @ApiOperation({ summary: 'Analyze a natural language query' })
  @ApiResponse({
    status: 200,
    description: 'Returns the analyzed query with tokens, entities, and intent',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Natural language query' })
  analyzeQuery(@Query('query') query: string) {
    return this.nlpService.processQuery(query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Generate search suggestions based on a partial query' })
  @ApiResponse({ status: 200, description: 'Returns search suggestions' })
  @ApiQuery({ name: 'query', required: true, description: 'Partial query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of suggestions' })
  async generateSearchSuggestions(@Query('query') query: string, @Query('limit') limit?: number) {
    return this.naturalLanguageSearchService.generateSearchSuggestions(query, limit);
  }

  @Get('classify')
  @ApiOperation({ summary: 'Classify a search query into predefined categories' })
  @ApiResponse({ status: 200, description: 'Returns the query classification' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  classifySearchQuery(@Query('query') query: string) {
    return { category: this.naturalLanguageSearchService.classifySearchQuery(query) };
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'Get product recommendations based on a natural language description' })
  @ApiResponse({ status: 200, description: 'Returns recommended products' })
  async getRecommendationsFromDescription(@Body() body: { description: string; limit?: number }) {
    return this.naturalLanguageSearchService.getRecommendationsFromDescription(
      body.description,
      body.limit,
    );
  }

  @Post('personalized-search')
  @ApiOperation({ summary: 'Get personalized search results based on user preferences' })
  @ApiResponse({ status: 200, description: 'Returns personalized search results' })
  async getPersonalizedSearchResults(
    @Body()
    body: {
      query: string;
      userPreferences: {
        favoriteCategories?: string[];
        favoriteValues?: string[];
        priceSensitivity?: 'low' | 'medium' | 'high';
      };
      pagination?: PaginationDto;
    },
  ) {
    return this.naturalLanguageSearchService.getPersonalizedSearchResults(
      body.query,
      body.userPreferences,
      body.pagination || { page: 1, limit: 10 },
    );
  }

  @Post('extract-keywords')
  @ApiOperation({ summary: 'Extract keywords from text' })
  @ApiResponse({ status: 200, description: 'Returns extracted keywords' })
  extractKeywords(@Body() body: { text: string; maxKeywords?: number }) {
    return {
      keywords: this.nlpService.extractKeywords(body.text, body.maxKeywords),
    };
  }

  @Post('calculate-similarity')
  @ApiOperation({ summary: 'Calculate similarity between two texts' })
  @ApiResponse({ status: 200, description: 'Returns similarity score' })
  calculateSimilarity(@Body() body: { text1: string; text2: string }) {
    return {
      similarity: this.nlpService.calculateSimilarity(body.text1, body.text2),
    };
  }
}
