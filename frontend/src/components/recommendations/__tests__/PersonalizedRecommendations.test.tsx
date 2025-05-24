import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PersonalizedRecommendations from "../PersonalizedRecommendations";
import { RecommendationService } from "../../../services/recommendation.service";
import { Product } from "../../../types/product";

// Mock the recommendation service
jest.mock("../../../services/recommendation.service");
const mockRecommendationService = RecommendationService as jest.Mocked<
  typeof RecommendationService
>;

// Mock the useSession hook
jest.mock("../../../hooks/useSession", () => ({
  useSession: () => ({
    sessionId: "test-session-id",
    trackInteraction: jest.fn(),
    getRecentInteractions: jest.fn(),
  }),
}));

// Mock the useUserPreferences hook
jest.mock("../../../hooks/useUserPreferences", () => ({
  useUserPreferences: () => ({
    userPreferences: {
      hasEnoughData: true,
      recentlyViewedProducts: ["product-1", "product-2"],
    },
    loading: false,
    error: null,
  }),
}));

jest.mock("../../../hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

describe("PersonalizedRecommendations Component", () => {
  beforeEach(() => {
    // Define a fresh copy of mockProducts for each test to prevent mutation issues
    const freshMockProducts: Product[] = [
      {
        id: "product-1",
        title: "Test Product 1",
        description: "Test description 1",
        price: 19.99,
        images: ["image-url-1.jpg"],
        slug: "test-product-1",
        categories: ['category-1-slug', 'general'],
        merchantId: 'merchant-1',
        brandName: 'Brand A',
        attributes: { 'color': 'Red', 'material': 'Cotton' },
        isSuppressed: false, // Ensure default state
      },
      {
        id: "product-2",
        title: "Test Product 2",
        description: "Test description 2",
        price: 29.99,
        images: ["image-url-2.jpg"],
        slug: "test-product-2",
        categories: ['category-2-slug', 'sale'],
        merchantId: 'merchant-2',
        brandName: 'Brand B',
        attributes: { 'size': 'Large' },
        isSuppressed: false, // Ensure default state
      },
    ];

    // Reset mocks before each test to ensure test isolation
    mockRecommendationService.getPersonalizedRecommendations.mockReset().mockResolvedValue([...freshMockProducts]);
    mockRecommendationService.getTrendingProducts.mockReset().mockResolvedValue([...freshMockProducts]);
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false, error: null });
  });

  const mockUseAuth = require("../../../hooks/useAuth").useAuth;
  const mockRecommendationService = require("../../../services/recommendation.service").RecommendationService;
  const mockProducts: Product[] = [
    {
      id: "product-1",
      title: "Test Product 1",
      description: "Test description 1",
      price: 19.99,
      images: ["image-url-1.jpg"],
      slug: "test-product-1",
      categories: ['category-1-slug', 'general'],
      merchantId: 'merchant-1',
      brandName: 'Brand A',
      attributes: { 'color': 'Red', 'material': 'Cotton' },
    },
    {
      id: "product-2",
      title: "Test Product 2",
      description: "Test description 2",
      price: 29.99,
      images: ["image-url-2.jpg"],
      slug: "test-product-2",
      categories: ['category-2-slug', 'sale'],
      merchantId: 'merchant-2',
      brandName: 'Brand B',
      attributes: { 'size': 'Large' },
    },
  ];

  it("should render loading state initially", () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockResolvedValue([]);
    mockRecommendationService.getTrendingProducts = jest
      .fn()
      .mockResolvedValue([]);

    render(
      <BrowserRouter>
        <PersonalizedRecommendations />
      </BrowserRouter>,
    );

    expect(
      screen.getByTestId("personalized-recommendations-loading"),
    ).toBeInTheDocument();
  });

  it("should render personalized recommendations when loaded", async () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <PersonalizedRecommendations title="Recommended For You" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Recommended For You")).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();

      // Verify ProductCard is used for each product with the correct testId
      mockProducts.forEach(product => {
        expect(screen.getByTestId(`personalized-recommendation-${product.id}`)).toBeInTheDocument();
      });
      expect(screen.queryByTestId("personalized-recommendations-loading")).not.toBeInTheDocument();
    });
  });

  it("should render trending products as fallback when no personalized recommendations", async () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockResolvedValue([]);
    mockRecommendationService.getTrendingProducts = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <PersonalizedRecommendations
          title="Recommended For You"
          fallbackTitle="Trending Now"
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // First, check for a product card, as this indicates data has loaded
      expect(screen.getByTestId(`trending-recommendation-${mockProducts[0].id}`)).toBeInTheDocument();

      // Then check for the heading
      expect(screen.getByRole('heading', { name: /Trending Now/i, level: 2 })).toBeInTheDocument();
      
      // Check for product titles
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();

      // Verify ProductCard is used for each product with the correct testId
      mockProducts.forEach(product => {
        expect(screen.getByTestId(`trending-recommendation-${product.id}`)).toBeInTheDocument();
      });
    }, { timeout: 5000 });
  });

  it("should refresh recommendations when refresh button is clicked", async () => {
    // Ensure isAuthenticated is true for this test
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'test-user' } });

    const refreshedProducts: Product[] = [
      {
        id: "product-3",
        title: "Test Product 3",
        description: "Test description 3",
        price: 39.99,
        images: ["image-url-3.jpg"],
        slug: "test-product-3",
        categories: ['category-3-slug', 'new-arrival'],
        merchantId: 'merchant-3',
        brandName: 'Brand C',
        featured: false,
        isOnSale: false,
        discountPercentage: 0,
        inStock: true, // Renamed from isAvailable
        quantity: 10,
        attributes: { 'style': 'Modern', 'season': 'Summer' },
        isSuppressed: false,
        tags: ['tag1', 'tag2'], // Added example tags as it's in Product type
      },
    ];

    mockRecommendationService.getPersonalizedRecommendations = jest.fn()
      .mockResolvedValueOnce(mockProducts.slice(0, 2))
      .mockResolvedValueOnce(refreshedProducts);

    render(
      <BrowserRouter>
        <PersonalizedRecommendations
          title="Recommended For You"
          showRefreshButton={true}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("refresh-recommendations"));

    await waitFor(() => {
      expect(screen.getByText("Test Product 3")).toBeInTheDocument();
    });
  });

  it("should respect the limit prop", async () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockResolvedValue(mockProducts);

    // Ensure isAuthenticated is true for this test
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'test-user' } });

    render(
      <BrowserRouter>
        <PersonalizedRecommendations limit={1} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        mockRecommendationService.getPersonalizedRecommendations,
      ).toHaveBeenCalledWith(1, expect.any(Boolean), expect.any(Boolean), expect.any(Number));
    });
  });

  it("should render empty state when no recommendations are found", async () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockResolvedValue([]);
    mockRecommendationService.getTrendingProducts = jest
      .fn()
      .mockResolvedValue([]);

    render(
      <BrowserRouter>
        <PersonalizedRecommendations />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("personalized-recommendations-empty"),
      ).toBeInTheDocument();
    });
  });

  it("should render error state when API calls fail", async () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockRejectedValue(new Error("API error"));
    mockRecommendationService.getTrendingProducts = jest
      .fn()
      .mockRejectedValue(new Error("API error"));

    render(
      <BrowserRouter>
        <PersonalizedRecommendations />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("personalized-recommendations-error"),
      ).toBeInTheDocument();
    });
  });
});
