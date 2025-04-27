import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from '../types/product';
import ResponsiveProductCard from '../components/product/ResponsiveProductCard';
import PersonalizedProductGrid from '../components/tracking/PersonalizedProductGrid';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import RecentlyViewedProducts from '../components/recommendations/RecentlyViewedProducts';
import { useSession } from '../hooks/useSession';

/**
 * Example implementation of a personalized discovery feed
 * Demonstrates integration of personalization tracking components
 */
const PersonalizedDiscoveryFeed: React.FC = () => {
  const { trackInteraction } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products/discovery');
        setProducts(response.data.items || []);
        
        // Track page view
        trackInteraction('view', {
          type: 'page',
          pageType: 'discovery_feed',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [trackInteraction]);
  
  // Render product card with click tracking
  const renderProductCard = (product: Product) => {
    return (
      <div 
        onClick={() => {
          // Track product click
          trackInteraction('click', {
            productId: product.id,
            categoryId: product.categoryId || (product.categories?.[0] || ''),
            brandId: product.brandId || product.brandName,
            price: product.price,
            timestamp: new Date().toISOString()
          });
        }}
      >
        <ResponsiveProductCard product={product} />
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
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Discovery Feed</h1>
      
      {/* Personalized Recommendations Section */}
      <div className="mb-12">
        <PersonalizedRecommendations 
          title="Recommended for You"
          fallbackTitle="Trending Now"
          limit={4}
          showRefreshButton={true}
        />
      </div>
      
      {/* Recently Viewed Products */}
      <div className="mb-12">
        <RecentlyViewedProducts 
          limit={4}
          title="Recently Viewed"
        />
      </div>
      
      {/* Main Product Grid with Personalization Tracking */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Popular Products</h2>
        <PersonalizedProductGrid
          products={products}
          pageType="discovery_feed"
          renderProductCard={renderProductCard}
          gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          itemClassName="h-[360px] w-full contain-strict relative"
        />
      </div>
    </div>
  );
};

export default PersonalizedDiscoveryFeed;
