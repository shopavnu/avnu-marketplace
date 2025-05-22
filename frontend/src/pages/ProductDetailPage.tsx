import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Product } from "../types/product";
import { useSession } from "../hooks/useSession";
import ProductDetailTracker from "../components/tracking/ProductDetailTracker";
import ResponsiveProductCard from "../components/product/ResponsiveProductCard";
import SimilarProducts from "../components/recommendations/SimilarProducts";
import PersonalizedRecommendations from "../components/recommendations/PersonalizedRecommendations";
import RecentlyViewedProducts from "../components/recommendations/RecentlyViewedProducts";

/**
 * Product detail page with personalization tracking
 */
const ProductDetailPage: React.FC = () => {
  const { productId, slug } = useParams<{
    productId?: string;
    slug?: string;
  }>();
  const { trackInteraction } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        setProduct(response.data);

        // Track page view
        trackInteraction("view", {
          type: "product",
          productId: response.data.id,
          categoryId:
            response.data.categoryId || response.data.categories?.[0] || "",
          brandId: response.data.brandId || response.data.brandName,
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
              src={product.images[0]}
              alt={product.title}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-600 mb-4">{product.brandName}</p>

            <div className="flex items-center mb-6">
              <span className="text-2xl font-semibold">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-gray-500 line-through ml-3">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="ml-3 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Add to Cart Button - with tracking */}
            <button
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => {
                trackInteraction("add_to_cart", {
                  productId: product.id,
                  categoryId:
                    product.categoryId || product.categories?.[0] || "",
                  brandId: product.brandId || product.brandName,
                  price: product.price,
                  timestamp: new Date().toISOString(),
                });
              }}
            >
              Add to Cart
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
