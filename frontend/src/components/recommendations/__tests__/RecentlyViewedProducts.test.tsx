import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RecentlyViewedProducts from "../RecentlyViewedProducts";
import { ProductService } from "../../../services/product.service";
import { useUserPreferences } from "../../../hooks/useUserPreferences";
import ProductCard from "../../product/ProductCard";

// Mock the product service
jest.mock("../../../services/product.service");
const mockProductService = ProductService as jest.Mocked<typeof ProductService>;

// Mock the useSession hook
jest.mock("../../../hooks/useSession", () => ({
  useSession: () => ({
    sessionId: "test-session-id",
    trackInteraction: jest.fn(),
    getRecentInteractions: jest
      .fn()
      .mockResolvedValue([
        { data: { productId: "product-1" } },
        { data: { productId: "product-2" } },
        { data: { productId: "product-3" } },
      ]),
  }),
}));

// Mock the useUserPreferences hook
jest.mock("../../../hooks/useUserPreferences", () => ({
  useUserPreferences: jest.fn().mockReturnValue({
    userPreferences: {
      recentlyViewedProducts: ["product-1", "product-2"],
    },
    loading: false,
    error: null,
    fetchUserPreferences: jest.fn(),
    updateFromCurrentSession: jest.fn(),
    getPersonalizedRecommendations: jest.fn(),
  }),
}));
const mockUserPreferences = useUserPreferences as jest.Mock;

describe("RecentlyViewedProducts Component", () => {
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
    mockProductService.getProductsByIds = jest.fn().mockResolvedValue([]);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("recently-viewed-loading")).toBeInTheDocument();
  });

  it("should render recently viewed products when loaded", async () => {
    mockProductService.getProductsByIds = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Recently Viewed")).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();

      // Verify ProductCard is used with correct props
      expect(ProductCard).toHaveBeenCalledWith(
        expect.objectContaining({
          product: mockProducts[0],
          testId: `recently-viewed-${mockProducts[0].id}`,
        }),
        expect.anything(),
      );
    });
  });

  it("should render with custom title when provided", async () => {
    mockProductService.getProductsByIds = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts title="Your Browsing History" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Your Browsing History")).toBeInTheDocument();
    });
  });

  it("should respect excludeProductId prop", async () => {
    mockProductService.getProductsByIds = jest
      .fn()
      .mockResolvedValue([mockProducts[0]]);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts excludeProductId="product-2" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockProductService.getProductsByIds).toHaveBeenCalledWith([
        "product-2",
        "product-3",
      ]);
    });
  });

  it("should respect the limit prop", async () => {
    mockProductService.getProductsByIds = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts limit={1} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockProductService.getProductsByIds).toHaveBeenCalledWith(
        ["product-1"],
        expect.anything(),
      );
    });
  });

  it("should track clicks on product cards", async () => {
    mockProductService.getProductsByIds = jest
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
        <RecentlyViewedProducts />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    // Click on the first product card
    fireEvent.click(
      screen.getByTestId(`mocked-product-card-${mockProducts[0].id}`),
    );

    expect(trackInteractionMock).toHaveBeenCalledWith(
      "RECOMMENDATION_CLICK",
      expect.objectContaining({
        recommendationType: "recently_viewed",
        recommendedProductId: mockProducts[0].id,
      }),
    );
  });

  it("should render product cards with consistent sizing", async () => {
    mockProductService.getProductsByIds = jest
      .fn()
      .mockResolvedValue(mockProducts);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // Verify ProductCard component is used for each product
      mockProducts.forEach((product) => {
        expect(ProductCard).toHaveBeenCalledWith(
          expect.objectContaining({
            product,
            testId: `recently-viewed-${product.id}`,
          }),
          expect.anything(),
        );
      });
    });
  });

  it("should render empty state when no recently viewed products are found", async () => {
    mockProductService.getProductsByIds = jest.fn().mockResolvedValue([]);

    render(
      <BrowserRouter>
        <RecentlyViewedProducts />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("recently-viewed-empty")).toBeInTheDocument();
    });
  });

  it("should render error state when API call fails", async () => {
    mockProductService.getProductsByIds = jest
      .fn()
      .mockRejectedValue(new Error("API error"));

    render(
      <BrowserRouter>
        <RecentlyViewedProducts />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("recently-viewed-error")).toBeInTheDocument();
    });
  });
});
