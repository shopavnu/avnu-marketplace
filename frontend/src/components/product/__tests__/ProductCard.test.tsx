import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../ProductCard";

// Mock product data
const mockProduct = {
  id: "product-1",
  title: "Test Product",
  description: "This is a test product description",
  price: 19.99,
  images: ["https://example.com/image.jpg"],
  categories: ["category-1"],
  merchantId: "merchant-1",
  brandName: "Test Brand",
};

// Mock functions
const mockOnClick = jest.fn();
const mockTrackImpression = jest.fn();

describe("ProductCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  it("renders the product card correctly", () => {
    renderWithRouter(
      <ProductCard
        product={mockProduct}
        onClick={mockOnClick}
        trackImpression={mockTrackImpression}
      />,
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("tracks impression when component mounts", () => {
    renderWithRouter(
      <ProductCard
        product={mockProduct}
        onClick={mockOnClick}
        trackImpression={mockTrackImpression}
      />,
    );

    expect(mockTrackImpression).toHaveBeenCalledTimes(1);
    expect(mockTrackImpression).toHaveBeenCalledWith(mockProduct);
  });

  it("handles click events correctly", () => {
    renderWithRouter(
      <ProductCard
        product={mockProduct}
        onClick={mockOnClick}
        trackImpression={mockTrackImpression}
      />,
    );

    const card = screen.getByTestId(`product-card-${mockProduct.id}`);
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockProduct);
  });

  it("renders badges when showBadges is true and product is on sale", () => {
    const productWithDiscount = {
      ...mockProduct,
      isOnSale: true,
      discountPercentage: 20,
    };

    renderWithRouter(
      <ProductCard
        product={productWithDiscount}
        onClick={mockOnClick}
        trackImpression={mockTrackImpression}
        showBadges={true}
      />,
    );

    expect(screen.getByText("20% OFF")).toBeInTheDocument();
  });

  it("does not render badges when showBadges is false", () => {
    const productWithDiscount = {
      ...mockProduct,
      isOnSale: true,
      discountPercentage: 20,
    };

    renderWithRouter(
      <ProductCard
        product={productWithDiscount}
        onClick={mockOnClick}
        trackImpression={mockTrackImpression}
        showBadges={false}
      />,
    );

    expect(screen.queryByText("20% OFF")).not.toBeInTheDocument();
  });

  it("uses custom testId when provided", () => {
    renderWithRouter(
      <ProductCard
        product={mockProduct}
        onClick={mockOnClick}
        trackImpression={mockTrackImpression}
        testId="custom-test-id"
      />,
    );

    expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
    expect(
      screen.queryByTestId(`product-card-${mockProduct.id}`),
    ).not.toBeInTheDocument();
  });
});
