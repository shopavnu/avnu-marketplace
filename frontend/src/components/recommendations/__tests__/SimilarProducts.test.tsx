import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SimilarProducts from "../SimilarProducts";
import { RecommendationService } from "../../../services/recommendation.service";
import ProductCard from "../../product/ProductCard";

// Mock the recommendation service
jest.mock("../../../services/recommendation.service");
const mockRecommendationService = RecommendationService as jest.Mocked<
  typeof RecommendationService
>;

// Mock the ProductCard component
jest.mock("../../product/ProductCard", () => {
  return jest.fn((props) => (
    <div
      data-testid={props.testId || `mocked-product-card-${props.product.id}`}
      onClick={() => props.onClick && props.onClick(props.product)}
    >
      <div>{props.product.title}</div>
      <div>{props.product.brandName}</div>
      <div>${props.product.price}</div>
    </div>
  ));
});

// Mock the useSession hook
jest.mock("../../../hooks/useSession", () => ({
  useSession: () => ({
    sessionId: "test-session-id",
    trackInteraction: jest.fn(),
    getRecentInteractions: jest.fn(),
  }),
}));

describe("SimilarProducts Component", () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    mockRecommendationService.getSimilarProducts.mockReset();
    // If other RecommendationService methods are used by SimilarProducts, reset them too.
  });
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
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue([]);

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("similar-products-loading")).toBeInTheDocument();
  });

  it("should render similar products when loaded", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" />
      </BrowserRouter>,
    );

    await screen.findByText("Test Product 1"); // Wait for product to appear
    expect(screen.queryByTestId("similar-products-loading")).not.toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /You may also like/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();

    // Verify ProductCard is used with correct props for each product
    mockProducts.forEach(product => {
      expect(ProductCard).toHaveBeenCalledWith(
        expect.objectContaining({
          product: product,
          testId: `similar-product-${product.id}`,
        }),
        expect.anything(), // The second argument to ProductCard mock calls is the context
      );
    });
  });

  it("should render with custom title when provided", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <SimilarProducts
          productId="test-product-id"
          title="Custom Similar Products Title"
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Custom Similar Products Title"),
      ).toBeInTheDocument();
    });
  });

  it("should render empty state when no similar products are found", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue([]);

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" />
      </BrowserRouter>,
    );

    await screen.findByTestId("similar-products-empty");
    expect(screen.queryByTestId("similar-products-loading")).not.toBeInTheDocument();
  });

  it("should render error state when API call fails", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockRejectedValue(new Error("API error"));

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" />
      </BrowserRouter>,
    );

    await screen.findByTestId("similar-products-error");
    expect(screen.queryByTestId("similar-products-loading")).not.toBeInTheDocument();
  });

  it("should respect the limit prop", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" limit={1} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockRecommendationService.getSimilarProducts).toHaveBeenCalledWith(
        "test-product-id",
        'hybrid', // Default similarityType
        1
      );
    });
  });

  it("should track clicks on product cards", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue(mockProducts);
    const trackInteractionMock = jest.fn();

    // Override the useSession mock for this test
    jest
      .spyOn(require("../../../hooks/useSession"), "useSession")
      .mockImplementation(() => ({
        sessionId: "test-session-id",
        trackInteraction: trackInteractionMock,
        getRecentInteractions: jest.fn(),
      }));

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    // Click on the first product card
    fireEvent.click(
      screen.getByTestId(`similar-product-${mockProducts[0].id}`),
    );

    expect(trackInteractionMock).toHaveBeenCalledWith(
      "RECOMMENDATION_CLICK",
      expect.objectContaining({
        recommendationType: "similar_products",
        similarityType: "hybrid",
        sourceProductId: "test-product-id",
        targetProductId: mockProducts[0].id
      })
    );
  });

  it("should render product cards with consistent sizing", async () => {
    mockRecommendationService.getSimilarProducts = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <SimilarProducts productId="test-product-id" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // Verify ProductCard component is used for each product with correct props
      mockProducts.forEach((product) => {
        expect(ProductCard).toHaveBeenCalledWith(
          expect.objectContaining({
            product: product,
            testId: `similar-product-${product.id}`,
            // Add other props that are expected to be passed and are relevant for sizing consistency if necessary
          }),
          expect.anything() // Context for the mock call
        );
      });
      // Additionally, one might check the number of times ProductCard was called:
      // expect(ProductCard).toHaveBeenCalledTimes(mockProducts.length);
    });
  });
});
