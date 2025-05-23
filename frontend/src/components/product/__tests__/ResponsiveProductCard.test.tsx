import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ResponsiveProductCard from "../ResponsiveProductCard";

// Mock formatCurrency and truncateText functions
jest.mock("../../../utils/formatters", () => ({
  formatCurrency: (price: number) => `$${price.toFixed(2)}`,
  truncateText: (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text,
}));

describe("ResponsiveProductCard Component", () => {
  // Test products with different content lengths
  const mockProducts = {
    complete: {
      id: "product-1",
      title: "Test Product with Complete Information",
      description:
        "This is a complete product description with all the necessary details that a customer might want to know.",
      price: 19.99,
      compareAtPrice: 29.99,
      discountPercentage: 33,
      images: ["https://example.com/image.jpg"],
      categories: ["category-1"],
      merchantId: "merchant-1",
      brandName: "Test Brand",
      slug: "test-product-1",
    },
    minimal: {
      id: "product-2",
      title: "Minimal",
      description: "Short",
      price: 9.99,
      images: ["https://example.com/image.jpg"],
      categories: ["category-1"],
      merchantId: "merchant-1",
      brandName: "Brand",
    },
    longContent: {
      id: "product-3",
      title:
        "This is an extremely long product title that should be truncated to maintain consistent card height across all products",
      description:
        "This is an extremely long product description that contains a lot of information and should be truncated to maintain consistent card height. It includes details about the product features, specifications, materials, and other important information that a customer might want to know.",
      price: 99.99,
      images: ["https://example.com/image.jpg"],
      categories: ["category-1"],
      merchantId: "merchant-1",
      brandName: "Very Long Brand Name That Should Be Truncated",
    },
    missingContent: {
      id: "product-4",
      title: "",
      description: "",
      price: 0,
      images: [],
      categories: [],
      merchantId: "merchant-1",
      brandName: "",
    },
  };

  // Helper function to render card with router context
  const renderCard = (product: any) => {
    return render(
      <BrowserRouter>
        <ResponsiveProductCard product={product} />
      </BrowserRouter>,
    );
  };

  beforeEach(() => {
    // Mock window.innerWidth to test different device sizes
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200, // Default to desktop
    });

    // Mock the resize event
    window.dispatchEvent(new Event("resize"));
  });

  it("renders product with complete information correctly", () => {
    renderCard(mockProducts.complete);

    expect(
      screen.getByText("Test Product with Complete Information"),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("33% OFF")).toBeInTheDocument();
  });

  it("renders product with minimal information correctly", () => {
    renderCard(mockProducts.minimal);

    expect(screen.getByText("Minimal")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
  });

  it("handles long content by truncating appropriately", () => {
    renderCard(mockProducts.longContent);

    const title = screen.getByText(/This is an extremely long product title/);
    const description = screen.getByText(
      /This is an extremely long product description/,
    );

    // Check that title has CSS truncation styles applied.
    // In JSDOM, textContent will still hold the full title for CSS-based truncation.
    // Check key CSS properties for truncation that are reliably testable in JSDOM.
    // We acknowledge JSDOM limitations in verifying -webkit-box-orient and -webkit-line-clamp.
    expect(title).toHaveStyle({
      display: "-webkit-box", // Prerequisite for line-clamping
      overflow: "hidden",    // Prerequisite for line-clamping
      'text-overflow': "ellipsis", // Visual cue for truncation
    });
    // Confirm the full text content is present in the DOM for the title,
    // as CSS-based truncation doesn't alter textContent.
    expect(title.textContent).toEqual(mockProducts.longContent.title);

    // Check that description content is programmatically truncated by the
    // getResponsiveDescription() method, which uses the mocked truncateText.
    // For desktop (default test setup), description maxLength is 150.
    const expectedTruncatedDescription =
      mockProducts.longContent.description.substring(0, 150) + "...";
    expect(description.textContent).toEqual(expectedTruncatedDescription);
  });

  it("handles missing content with fallbacks", () => {
    renderCard(mockProducts.missingContent);

    expect(screen.getByText("Untitled Product")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("No description available")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("maintains consistent card height across different content lengths", () => {
    // Render all cards
    const { container: container1 } = renderCard(mockProducts.complete);
    const { container: container2 } = renderCard(mockProducts.minimal);
    const { container: container3 } = renderCard(mockProducts.longContent);
    const { container: container4 } = renderCard(mockProducts.missingContent);

    // Get card elements
    const card1 = container1.querySelector(".product-card");
    const card2 = container2.querySelector(".product-card");
    const card3 = container3.querySelector(".product-card");
    const card4 = container4.querySelector(".product-card");

    // Check that all cards have the same height
    const height1 = window.getComputedStyle(card1!).height;
    const height2 = window.getComputedStyle(card2!).height;
    const height3 = window.getComputedStyle(card3!).height;
    const height4 = window.getComputedStyle(card4!).height;

    expect(height1).toBe(height2);
    expect(height2).toBe(height3);
    expect(height3).toBe(height4);
  });

  it("adapts to mobile screen size", () => {
    // Set window width to mobile size
    window.innerWidth = 480;
    window.dispatchEvent(new Event("resize"));

    const { container } = renderCard(mockProducts.complete);
    const card = container.querySelector(".product-card");

    // Check card height matches mobile dimensions
    expect(window.getComputedStyle(card!).height).toBe("280px");
  });

  it("adapts to tablet screen size", () => {
    // Set window width to tablet size
    window.innerWidth = 800;
    window.dispatchEvent(new Event("resize"));

    const { container } = renderCard(mockProducts.complete);
    const card = container.querySelector(".product-card");

    // Check card height matches tablet dimensions
    expect(window.getComputedStyle(card!).height).toBe("320px");
  });

  it("adapts to desktop screen size", () => {
    // Set window width to desktop size
    window.innerWidth = 1200;
    window.dispatchEvent(new Event("resize"));

    const { container } = renderCard(mockProducts.complete);
    const card = container.querySelector(".product-card");

    // Check card height matches desktop dimensions
    expect(window.getComputedStyle(card!).height).toBe("360px");
  });
});
