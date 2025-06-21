import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Product, ProductVariant, InventoryStatus, VariantOption } from "../types/product";
import { useSession } from "../hooks/useSession";
import ProductDetailTracker from "../components/tracking/ProductDetailTracker";
import ResponsiveProductCard from "../components/product/ResponsiveProductCard";
import SimilarProducts from "../components/recommendations/SimilarProducts";
import PersonalizedRecommendations from "../components/recommendations/PersonalizedRecommendations";
import RecentlyViewedProducts from "../components/recommendations/RecentlyViewedProducts";
import useCartStore from "../stores/useCartStore";
import { createProductSummary } from "../utils/cart";

/**
 * Product detail page with personalization tracking
 */
const ProductDetailPage: React.FC = () => {
  const { productId, slug } = useParams<{
    productId?: string;
    slug?: string;
  }>();
  const { trackInteraction } = useSession();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let response;

        if (productId) {
          response = await axios.get(`/api/products/${productId}`);
        } else if (slug) {
          response = await axios.get(`/api/products/by-slug/${slug}`);
        } else {
          throw new Error("Product ID or slug is required");
        }

        const productData = response.data;
        setProduct(productData);

        // If product has variants, select the first one by default
        if (productData.hasVariants && productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          
          // Set default selected options based on the first variant
          if (productData.variants[0].options) {
            setSelectedOptions(productData.variants[0].options);
          }
        }

        // Track page view
        trackInteraction("view", {
          type: "product",
          productId: productData.id,
          categoryId:
            productData.categoryId || productData.categories?.[0] || "",
          brandId: productData.brandId || productData.brandName,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, slug, trackInteraction]);

  // Handle option selection (e.g., when user selects a size or color)
  const handleOptionSelect = (optionName: string, optionValue: string) => {
    // Update selected options
    const newSelectedOptions = {
      ...selectedOptions,
      [optionName]: optionValue,
    };
    setSelectedOptions(newSelectedOptions);
    
    // Find matching variant based on selected options
    if (product?.variants) {
      const matchingVariant = findMatchingVariant(product.variants, newSelectedOptions);
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      }
    }
  };

  // Find a variant that matches the selected options
  const findMatchingVariant = (variants: ProductVariant[], options: Record<string, string>): ProductVariant | null => {
    return variants.find(variant => {
      // Check if all selected options match this variant's options
      return Object.entries(options).every(([key, value]) => 
        variant.options[key] === value
      );
    }) || null;
  };

  // Get inventory status based on quantity
  const getInventoryStatus = (): InventoryStatus => {
    if (selectedVariant) {
      if (!selectedVariant.inStock || selectedVariant.inventoryQuantity <= 0) {
        return InventoryStatus.OUT_OF_STOCK;
      } else if (selectedVariant.inventoryQuantity <= (product?.lowStockThreshold || 5)) {
        return InventoryStatus.LOW_STOCK;
      }
      return InventoryStatus.IN_STOCK;
    } else if (product) {
      if (!product.inStock || (product.quantity !== undefined && product.quantity <= 0)) {
        return InventoryStatus.OUT_OF_STOCK;
      } else if (product.quantity !== undefined && product.quantity <= (product.lowStockThreshold || 5)) {
        return InventoryStatus.LOW_STOCK;
      }
      return InventoryStatus.IN_STOCK;
    }
    return InventoryStatus.OUT_OF_STOCK;
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is at least 1 and not more than available inventory
    const maxAvailable = selectedVariant?.inventoryQuantity || product?.quantity || 1;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxAvailable));
    setQuantity(validQuantity);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    // Create standardized summary via shared helper
    const productSummary = createProductSummary(product, selectedVariant, selectedOptions);

    // Add to cart
    addItem(productSummary, quantity);

    // Track add to cart event
    trackInteraction("add_to_cart", {
      productId: productSummary.id,
      variantId: selectedVariant?.id,
      categoryId: product.categoryId || product.categories?.[0] || "",
      brandId: product.brandId || product.brandName,
      price: productSummary.price,
      quantity,
      timestamp: new Date().toISOString(),
    });
  };

  // Track product click for recommendations
  const handleProductClick = (clickedProduct: Product) => {
    trackInteraction("click", {
      productId: clickedProduct.id,
      categoryId:
        clickedProduct.categoryId || clickedProduct.categories?.[0] || "",
      brandId: clickedProduct.brandId || clickedProduct.brandName,
      price: clickedProduct.price,
      timestamp: new Date().toISOString(),
      sourceProductId: product?.id, // Track which product led to this click
    });
  };

  // Render product card with click tracking
  const renderProductCard = (recommendedProduct: Product) => {
    return (
      <div onClick={() => handleProductClick(recommendedProduct)}>
        <ResponsiveProductCard product={recommendedProduct} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center text-red-500">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <ProductDetailTracker product={product}>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative">
            <img
              src={selectedVariant?.imageUrl || (product?.images && product.images[0]) || ''}
              alt={product?.title || ''}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product?.title}</h1>
            <p className="text-gray-600 mb-4">{product?.brandName}</p>

            {/* Price display with variant price if selected */}
            <div className="flex items-center mb-6">
              <span className="text-2xl font-semibold">
                ${(selectedVariant?.price || product?.price || 0).toFixed(2)}
              </span>
              {((selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price) || 
                (product?.compareAtPrice && product.compareAtPrice > product.price)) && (
                <span className="text-gray-500 line-through ml-3">
                  ${(selectedVariant?.compareAtPrice || product?.compareAtPrice || 0).toFixed(2)}
                </span>
              )}
              {product?.discountPercentage && product.discountPercentage > 0 && (
                <span className="ml-3 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Inventory Status Indicator */}
            <div className="mb-4">
              {getInventoryStatus() === InventoryStatus.IN_STOCK && (
                <span className="text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  In Stock
                </span>
              )}
              {getInventoryStatus() === InventoryStatus.LOW_STOCK && (
                <span className="text-orange-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Only {selectedVariant?.inventoryQuantity || product?.quantity} left!
                </span>
              )}
              {getInventoryStatus() === InventoryStatus.OUT_OF_STOCK && (
                <span className="text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Variant Options Selection */}
            {product?.variantOptions && product.variantOptions.length > 0 && (
              <div className="mb-6">
                {product.variantOptions.map((option) => (
                  <div key={option.name} className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{option.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        // Determine if this option is available based on current selections
                        const isSelected = selectedOptions[option.name] === value;
                        
                        // For color options, show color swatches
                        if (option.name.toLowerCase() === 'color') {
                          return (
                            <button
                              key={value}
                              onClick={() => handleOptionSelect(option.name, value)}
                              className={`relative w-8 h-8 rounded-full border ${isSelected ? 'border-black' : 'border-gray-300'}`}
                              style={{ backgroundColor: value.toLowerCase() }}
                              title={value}
                            >
                              {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white stroke-current" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        }
                        
                        // For other options like size, show buttons
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.name, value)}
                            className={`px-3 py-2 text-sm border rounded ${isSelected 
                              ? 'bg-gray-900 text-white border-gray-900' 
                              : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
              <div className="flex items-center">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-3 py-1 border border-gray-300 rounded-l text-lg"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-center py-1 border-t border-b border-gray-300 text-lg"
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-3 py-1 border border-gray-300 rounded-r text-lg"
                  disabled={quantity >= (selectedVariant?.inventoryQuantity || product?.quantity || 999)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product?.description}</p>
            </div>

            {/* Add to Cart Button - with tracking */}
            <button
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${getInventoryStatus() === InventoryStatus.OUT_OF_STOCK 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={handleAddToCart}
              disabled={getInventoryStatus() === InventoryStatus.OUT_OF_STOCK}
            >
              {getInventoryStatus() === InventoryStatus.OUT_OF_STOCK ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-16">
          <SimilarProducts
            productId={product.id}
            similarityType="hybrid"
            limit={4}
            title="You May Also Like"
          />
        </div>

        {/* Recently Viewed Products */}
        <div className="mt-16">
          <RecentlyViewedProducts limit={4} excludeProductId={product.id} />
        </div>

        {/* Personalized Recommendations */}
        <div className="mt-16">
          <PersonalizedRecommendations
            limit={4}
            title="Recommended For You"
            fallbackTitle="You Might Be Interested In"
          />
        </div>
      </div>
    </ProductDetailTracker>
  );
};

export default ProductDetailPage;
