"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const search_suggestion_resolver_1 = require("./search-suggestion.resolver");
const search_suggestion_service_1 = require("../services/search-suggestion.service");
describe('SearchSuggestionResolver', () => {
    let resolver;
    let searchSuggestionServiceMock;
    let loggerMock;
    beforeEach(async () => {
        searchSuggestionServiceMock = {
            getSuggestions: jest.fn(),
        };
        loggerMock = new common_1.Logger(search_suggestion_resolver_1.SearchSuggestionResolver.name);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                search_suggestion_resolver_1.SearchSuggestionResolver,
                {
                    provide: search_suggestion_service_1.SearchSuggestionService,
                    useValue: searchSuggestionServiceMock,
                },
                {
                    provide: common_1.Logger,
                    useValue: loggerMock,
                },
            ],
        }).compile();
        resolver = module.get(search_suggestion_resolver_1.SearchSuggestionResolver);
    });
    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });
    describe('getSuggestions', () => {
        it('should return suggestions for anonymous users', async () => {
            const input = {
                query: 'test',
                limit: 5,
                includePopular: true,
                includePersonalized: true,
                includeCategoryContext: true,
            };
            const mockResponse = {
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
            const input = {
                query: 'test',
                limit: 5,
                includePopular: true,
                includePersonalized: true,
                includeCategoryContext: true,
            };
            const user = {
                id: 'test-user-id',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const mockResponse = {
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
            const input = {
                query: 'test',
                limit: 5,
                includePopular: true,
                includePersonalized: true,
                includeCategoryContext: true,
            };
            searchSuggestionServiceMock.getSuggestions.mockRejectedValueOnce(new Error('Service error'));
            const result = await resolver.getSuggestions(input);
            expect(result).toBeDefined();
            expect(result.suggestions).toEqual([]);
            expect(result.originalQuery).toEqual('test');
            expect(result.total).toEqual(0);
        });
        it('should log performance metrics', async () => {
            const input = {
                query: 'test',
                limit: 5,
                includePopular: true,
                includePersonalized: true,
                includeCategoryContext: true,
            };
            const mockResponse = {
                originalQuery: 'test',
                isPersonalized: false,
                total: 0,
                suggestions: [],
            };
            searchSuggestionServiceMock.getSuggestions.mockResolvedValueOnce(mockResponse);
            const logSpy = jest.spyOn(loggerMock, 'log');
            await resolver.getSuggestions(input);
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Completed search suggestion request in'));
        });
    });
});
//# sourceMappingURL=search-suggestion.resolver.spec.js.map