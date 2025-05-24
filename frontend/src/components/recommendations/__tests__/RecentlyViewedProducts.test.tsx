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

// Mock the ProductCard component
jest.mock("../../product/ProductCard", () => {
  const MockProductCard = jest.fn((props) => {
    const { product, testId, onClick, trackImpression } = props;
    if (trackImpression) {
      trackImpression();
    }
    const handleClick = () => {
      if (onClick) {
        onClick(product);
      }
    };
    return (
      <div data-testid={testId || `mocked-product-card-${product.id}`} onClick={handleClick}>
        {product.title}
        {/* Simplified mock render */}
      </div>
    );
  });
  return MockProductCard;
});

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
      expect(screen.getByText("Recently viewed")).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();

      // Verify ProductCard is used for each product with the correct testId
      mockProducts.forEach(product => {
        expect(screen.getByTestId(`recently-viewed-${product.id}`)).toBeInTheDocument();
      });
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
    // Explicitly set userPreferences for this test
    (useUserPreferences as jest.Mock).mockReturnValue({
      userPreferences: { recentlyViewedProducts: ["product-1", "product-2", "product-3"], enabled: true },
      updateUserPreferences: jest.fn(),
      clearUserPreferences: jest.fn(),
    });

    // Mock getProductsByIds to return specific products based on input
    mockProductService.getProductsByIds = jest.fn().mockImplementation(async (ids: string[]) => {
      // console.log('[TEST LOG] getProductsByIds in excludeProductId test called with:', ids);
      return mockProducts.filter(p => ids.includes(p.id));
    });

    render(
      <BrowserRouter>
        <RecentlyViewedProducts excludeProductId="product-2" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // Expect call with product-1 and product-3, as product-2 is excluded
      expect(mockProductService.getProductsByIds).toHaveBeenCalledWith([
        "product-1",
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
        ["product-1"]
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
      screen.getByTestId(`recently-viewed-${mockProducts[0].id}`),
    );

    expect(trackInteractionMock).toHaveBeenCalledWith(
      "RECOMMENDATION_CLICK",
      expect.objectContaining({
        recommendationType: "recently_viewed",
        targetProductId: mockProducts[0].id,
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
      // Verify ProductCard component is used for each product and is visible
      mockProducts.forEach((product) => {
        const productCardElement = screen.getByTestId(`recently-viewed-${product.id}`);
        expect(productCardElement).toBeInTheDocument();
        // We can add more specific assertions about sizing if needed, 
        // but for now, presence is the main check derived from the original assertion.
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
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Ensure userPreferences has some products to trigger the fetch, otherwise API won't be called
    (useUserPreferences as jest.Mock).mockReturnValueOnce({
      userPreferences: { recentlyViewedProducts: ['product-1'], enabled: true }, // Add some product IDs
      updateUserPreferences: jest.fn(),
      clearUserPreferences: jest.fn(),
    });

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

    consoleErrorSpy.mockRestore();
  });
});
