import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PersonalizedRecommendations from "../PersonalizedRecommendations";
import { RecommendationService } from "../../../services/recommendation.service";

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

describe("PersonalizedRecommendations Component", () => {
  const mockProducts = [
    {
      id: "product-1",
      title: "Test Product 1",
      description: "Test description 1",
      price: 19.99,
      images: ["image-url-1.jpg"],
      slug: "test-product-1",
    },
    {
      id: "product-2",
      title: "Test Product 2",
      description: "Test description 2",
      price: 29.99,
      images: ["image-url-2.jpg"],
      slug: "test-product-2",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      expect(screen.getByText("Trending Now")).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    });
  });

  it("should refresh recommendations when refresh button is clicked", async () => {
    mockRecommendationService.getPersonalizedRecommendations = jest
      .fn()
      .mockResolvedValueOnce(mockProducts)
      .mockResolvedValueOnce([
        {
          id: "product-3",
          title: "Test Product 3",
          description: "Test description 3",
          price: 39.99,
          images: ["image-url-3.jpg"],
          slug: "test-product-3",
        },
      ]);

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

    render(
      <BrowserRouter>
        <PersonalizedRecommendations limit={1} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        mockRecommendationService.getPersonalizedRecommendations,
      ).toHaveBeenCalledWith(1);
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
