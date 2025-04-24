import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SearchSuggestionResolver } from './search-suggestion.resolver';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { SearchSuggestionInput } from '../graphql/search-suggestion.input';
import { SearchSuggestionsResponseType } from '../graphql/search-suggestion.type';
import { User } from '../../users/entities/user.entity';

describe('SearchSuggestionResolver', () => {
  let resolver: SearchSuggestionResolver;
  let searchSuggestionServiceMock: {
    getSuggestions: jest.Mock;
  };
  let loggerMock: Logger;

  beforeEach(async () => {
    searchSuggestionServiceMock = {
      getSuggestions: jest.fn(),
    };

    loggerMock = new Logger(SearchSuggestionResolver.name);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchSuggestionResolver,
        {
          provide: SearchSuggestionService,
          useValue: searchSuggestionServiceMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    resolver = module.get<SearchSuggestionResolver>(SearchSuggestionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getSuggestions', () => {
    it('should return suggestions for anonymous users', async () => {
      const input: SearchSuggestionInput = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };

      const mockResponse: SearchSuggestionsResponseType = {
        originalQuery: 'test',
        isPersonalized: false,
        suggestions: [
          {
            text: 'test suggestion',
            score: 100,
            isPopular: false,
            isPersonalized: false,
            category: 'clothing',
            type: 'product',
          },
        ],
        total: 1,
      };

      searchSuggestionServiceMock.getSuggestions.mockResolvedValueOnce(mockResponse);

      const result = await resolver.getSuggestions(input);

      expect(result).toEqual(mockResponse);
      expect(searchSuggestionServiceMock.getSuggestions).toHaveBeenCalledWith(input, undefined);
    });

    it('should pass user context to service for authenticated users', async () => {
      const input: SearchSuggestionInput = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };

      const user: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const mockResponse: SearchSuggestionsResponseType = {
        originalQuery: 'test',
        isPersonalized: false,
        suggestions: [
          {
            text: 'test suggestion',
            score: 100,
            isPopular: false,
            isPersonalized: false,
            category: 'clothing',
            type: 'product',
          },
          {
            text: 'test personalized',
            score: 90,
            isPopular: false,
            isPersonalized: true,
            category: 'electronics',
            type: 'search',
          },
        ],
        total: 2,
      };

      searchSuggestionServiceMock.getSuggestions.mockResolvedValueOnce(mockResponse);

      const result = await resolver.getSuggestions(input, user);

      expect(result).toEqual(mockResponse);
      expect(searchSuggestionServiceMock.getSuggestions).toHaveBeenCalledWith(input, user);
    });

    it('should handle errors gracefully', async () => {
      const input: SearchSuggestionInput = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };

      searchSuggestionServiceMock.getSuggestions.mockRejectedValueOnce(new Error('Service error'));

      // The resolver should catch the error and return an empty response
      const result = await resolver.getSuggestions(input);

      expect(result).toBeDefined();
      expect(result.suggestions).toEqual([]);
      expect(result.originalQuery).toEqual('test');
      expect(result.total).toEqual(0);
    });

    it('should log performance metrics', async () => {
      const input: SearchSuggestionInput = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };

      const mockResponse: SearchSuggestionsResponseType = {
        originalQuery: 'test',
        isPersonalized: false,
        total: 0,
        suggestions: [],
      };

      searchSuggestionServiceMock.getSuggestions.mockResolvedValueOnce(mockResponse);

      // Spy on the logger
      const logSpy = jest.spyOn(loggerMock, 'log');

      await resolver.getSuggestions(input);

      // Check that performance logging happened
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completed search suggestion request in'),
      );
    });
  });
});
